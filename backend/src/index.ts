import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'
import { cors } from 'hono/cors'
import { requestId } from 'hono/request-id'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand, ScanCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { z } from 'zod'
import { randomUUID, createHash } from 'crypto'
import { submitVerdictSchema, calculateVerdict } from './verdictCalculator'
import { Logger } from '@aws-lambda-powertools/logger'

export const app = new Hono()

// Initialize Lambda Powertools structured JSON logger
const logger = new Logger({
  serviceName: 'dev-persona-api',
  logLevel: 'INFO'
})

function getLogContext(c: any) {
  const rawIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  const ipHash = createHash('sha256').update(rawIp).digest('hex')
  return {
    requestId: c.get('requestId') || 'N/A',
    method: c.req.method,
    url: c.req.url,
    ipHash
  }
}

// Enable UUID request correlation mapping
app.use('*', requestId())

// Simple in-memory rate limiter for Lambda instances (mitigates concurrent container metric abuse)
const rateLimiter = new Map<string, { count: number; resetTime: number }>()

app.use('*', async (c, next) => {
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const limit = 60 // 60 requests per minute per IP

  const current = rateLimiter.get(ip)

  if (!current || now > current.resetTime) {
    rateLimiter.set(ip, { count: 1, resetTime: now + windowMs })
  } else if (current.count >= limit) {
    logger.warn('Rate limit exceeded for IP', { ...getLogContext(c) })
    return c.json({ error: 'Rate limit exceeded. Please try again later.' }, 429)
  } else {
    current.count++
  }

  await next()
})

// Bot Heuristics Blocker: mitigates automated scraping/metric manipulation
const botPatterns = [
  /headless/i,
  /playwright/i,
  /puppeteer/i,
  /phantom/i,
  /selenium/i
]

app.use('*', async (c, next) => {
  const ua = c.req.header('user-agent') || ''
  const e2eSecret = c.req.header('x-e2e-test-secret')
  
  // Allow automated runs if local dev or authorized with E2E bypass secret
  const isLocal = c.req.url.includes('localhost') || c.req.url.includes('127.0.0.1')
  const E2E_SECRET = process.env.E2E_TEST_SECRET
  const isAuthorizedE2E = E2E_SECRET && e2eSecret === E2E_SECRET

  if (botPatterns.some(p => p.test(ua)) && !isAuthorizedE2E && !isLocal) {
    logger.warn('Bot traffic blocked', { ...getLogContext(c), userAgent: ua })
    return c.json({ error: 'Bot traffic detected' }, 403)
  }
  await next()
})

// Define allowed CORS origins
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://nackxyz.pages.dev',
]

// CORS configuration with dynamic checking
app.use('/*', cors({
  origin: (origin) => {
    if (!origin) return null

    // Check exact matches
    if (ALLOWED_ORIGINS.includes(origin)) {
      return origin
    }

    // Secure origin pattern matching:
    // Only allow exact match on nackxyz.pages.dev or its subdomains (e.g. c29b68a6.nackxyz.pages.dev)
    const safeRegex = /^https?:\/\/([a-zA-Z0-9-]+\.)?nackxyz\.pages\.dev$/;
    if (safeRegex.test(origin)) {
      return origin
    }

    return null
  },
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
}))

const tableName = process.env.DYNAMODB_TABLE || 'dev-persona-stats'
const soulDrinkTable = process.env.SOUL_DRINK_TABLE || 'souldrink-stats'
const auditTable = process.env.AUDIT_VERDICTS_TABLE || 'audit-verdicts'
const AUDIT_VERDICT_TTL_DAYS = Number(process.env.AUDIT_VERDICT_TTL_DAYS || '30')
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-southeast-1' })
const docClient = DynamoDBDocumentClient.from(client)

// Alerting target initialization check
const webhookUrl = process.env.DISCORD_WEBHOOK_URL
if (!webhookUrl) {
  logger.warn('WARNING: DISCORD_WEBHOOK_URL environment variable is missing. Unhandled service errors will fail to trigger Discord alerting.')
}

// Root endpoint for health check
app.get('/', (c) => {
  return c.json({ status: 'ok', service: 'dev-persona-api' })
})

const devPersonaPayloadSchema = z.object({
  archetypeId: z.enum([
    'deadline_necromancer',
    'emotional_support',
    'dopamine_investor',
    'productivity_tourist',
    'functional_zombie',
    'chaos_ceo',
    'accidental_genius'
  ])
})

const soulDrinkPayloadSchema = z.object({
  result_id: z.string().min(1).max(50)
})

// POST /api/results - Increment count for an archetype
app.post('/api/results', async (c) => {
  try {
    // Parse body safely, checking length to prevent resource exhaustion attacks
    const bodyText = await c.req.text()
    if (bodyText.length > 500) {
      return c.json({ error: 'Payload too large' }, 413)
    }

    let body
    try {
      body = JSON.parse(bodyText)
    } catch {
      return c.json({ error: 'Invalid JSON' }, 400)
    }

    const validation = devPersonaPayloadSchema.safeParse(body)
    if (!validation.success) {
      return c.json({ error: 'Invalid payload schema', details: validation.error.format() }, 400)
    }

    const { archetypeId } = validation.data

    // Update DynamoDB item: increment count by 1 (creates item if not exists)
    const command = new UpdateCommand({
      TableName: tableName,
      Key: { archetypeId },
      UpdateExpression: 'SET #c = if_not_exists(#c, :start) + :inc',
      ExpressionAttributeNames: {
        '#c': 'count'
      },
      ExpressionAttributeValues: {
        ':start': 0,
        ':inc': 1
      },
      ReturnValues: 'ALL_NEW'
    })

    const response = await docClient.send(command)

    logger.info('Archetype result recorded successfully', {
      ...getLogContext(c),
      archetypeId,
      updatedCount: response.Attributes?.count || 1
    })

    return c.json({
      success: true,
      archetypeId,
      updatedCount: response.Attributes?.count || 1
    })
  } catch (error: any) {
    logger.error('Error recording result', { ...getLogContext(c), error: error.message, stack: error.stack })
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

// GET /api/stats - Get counts for all archetypes
app.get('/api/stats', async (c) => {
  try {
    // Enable browser and CDN caching for stats (10s fresh, 30s stale-while-revalidate)
    c.header('Cache-Control', 'public, max-age=10, stale-while-revalidate=30')

    let items: any[] = []
    let lastEvaluatedKey: Record<string, any> | undefined = undefined

    do {
      const command: ScanCommand = new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: lastEvaluatedKey,
        Limit: 50
      })
      const response = await docClient.send(command)
      items = items.concat(response.Items || [])
      lastEvaluatedKey = response.LastEvaluatedKey
    } while (lastEvaluatedKey)

    // Map DynamoDB items to simple key-value object
    const stats: Record<string, number> = {}
    
    // Seed default counts with 0
    const defaultArchetypes = [
      'deadline_necromancer',
      'emotional_support',
      'dopamine_investor',
      'productivity_tourist',
      'functional_zombie',
      'chaos_ceo',
      'accidental_genius'
    ]
    defaultArchetypes.forEach(id => {
      stats[id] = 0
    })

    // Populate with real data from DynamoDB
    items.forEach(item => {
      if (item.archetypeId && typeof item.count === 'number') {
        stats[item.archetypeId] = item.count
      }
    })

    // Calculate total plays
    const totalPlays = Object.values(stats).reduce((acc, curr) => acc + curr, 0)

    return c.json({
      success: true,
      totalPlays,
      stats
    })
  } catch (error: any) {
    logger.error('Error fetching stats', { ...getLogContext(c), error: error.message, stack: error.stack })
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

// POST /api/stats - Increment count for a specific result_id (Soul Drink)
app.post('/api/stats', async (c) => {
  try {
    const bodyText = await c.req.text()
    if (bodyText.length > 200) {
      return c.json({ error: 'Payload too large' }, 413)
    }

    let body
    try {
      body = JSON.parse(bodyText)
    } catch {
      return c.json({ error: 'Invalid JSON' }, 400)
    }

    const validation = soulDrinkPayloadSchema.safeParse(body)
    if (!validation.success) {
      return c.json({ error: 'Invalid payload schema', details: validation.error.format() }, 400)
    }

    const { result_id: resultId } = validation.data

    const command = new UpdateCommand({
      TableName: soulDrinkTable,
      Key: { result_id: resultId },
      UpdateExpression: 'ADD #count :inc',
      ExpressionAttributeNames: { '#count': 'count' },
      ExpressionAttributeValues: { ':inc': 1 },
      ReturnValues: 'UPDATED_NEW'
    })

    const response = await docClient.send(command)

    logger.info('Soul Drink result recorded successfully', {
      ...getLogContext(c),
      resultId,
      newCount: response.Attributes?.count
    })

    return c.json({
      success: true,
      result_id: resultId,
      new_count: response.Attributes?.count
    })
  } catch (error: any) {
    logger.error('Error updating Soul Drink stats', { ...getLogContext(c), error: error.message, stack: error.stack })
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

// GET /api/stats/:id - Fetch count for a specific result_id (Soul Drink)
app.get('/api/stats/:id', async (c) => {
  const resultId = c.req.param('id')

  try {
    const command = new GetCommand({
      TableName: soulDrinkTable,
      Key: { result_id: resultId }
    })

    const response = await docClient.send(command)

    return c.json({
      result_id: resultId,
      count: response.Item?.count || 0
    })
  } catch (error: any) {
    logger.error('Error fetching Soul Drink stats', { ...getLogContext(c), error: error.message, stack: error.stack })
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

// POST /api/audit/verdict — validate evidence, calculate results, and save verdict
app.post('/api/audit/verdict', async (c) => {
  try {
    const body = await c.req.json()
    const validation = submitVerdictSchema.safeParse(body)
    if (!validation.success) {
      return c.json({ error: 'Invalid input schema', details: validation.error.format() }, 400)
    }

    const { evidenceLog } = validation.data
    const verdictBase = calculateVerdict(evidenceLog)

    // Save verdict to database with enhanced audit trail metadata
    const verdictId = randomUUID()
    const now = new Date()
    const ttlSeconds = Math.floor(now.getTime() / 1000) + AUDIT_VERDICT_TTL_DAYS * 24 * 60 * 60

    // Calculate anonymized privacy-compliant logs for correlation
    const rawIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
    const rawUa = c.req.header('user-agent') || 'unknown'
    const ipHash = createHash('sha256').update(rawIp).digest('hex')
    const uaHash = createHash('sha256').update(rawUa).digest('hex')
    const countryCode = c.req.header('cf-ipcountry') || 'XX'

    await docClient.send(new PutCommand({
      TableName: auditTable,
      Item: {
        verdict_id: verdictId,
        archetype: verdictBase.archetype,
        contradiction_index: verdictBase.contradictionIndex,
        archetype_scores: verdictBase.archetypeScores,
        is_secret: verdictBase.isSecret,
        created_at: now.toISOString(),
        submitted_at: now.toISOString(),
        ip_hash: ipHash,
        user_agent_hash: uaHash,
        country_code: countryCode,
        ttl_expires_at: ttlSeconds,
      },
    }))

    logger.info('Audit verdict calculated and saved successfully', {
      ...getLogContext(c),
      verdictId,
      archetype: verdictBase.archetype,
      isSecret: verdictBase.isSecret
    })

    return c.json({
      success: true,
      verdictId,
      archetype: verdictBase.archetype,
      contradictionIndex: verdictBase.contradictionIndex,
      archetypeScores: verdictBase.archetypeScores,
      isSecret: verdictBase.isSecret
    })
  } catch (error: any) {
    logger.error('Error saving audit verdict', { ...getLogContext(c), error: error.message, stack: error.stack })
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

// GET /api/audit/verdict/:verdictId — fetch verdict by ID, 404 if not found
app.get('/api/audit/verdict/:verdictId', async (c) => {
  const verdictId = c.req.param('verdictId')
  try {
    const { Item } = await docClient.send(new GetCommand({
      TableName: auditTable,
      Key: { verdict_id: verdictId },
    }))
    if (!Item) return c.json({ error: 'Verdict not found' }, 404)
    return c.json({
      verdictId: Item.verdict_id,
      archetype: Item.archetype,
      isSecret: Item.is_secret,
    })
  } catch (error: any) {
    logger.error('Error fetching audit verdict', { ...getLogContext(c), error: error.message, stack: error.stack })
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

// POST /api/audit/impression — fire-and-forget A/B impression logging
app.post('/api/audit/impression', async (c) => {
  try {
    const body = await c.req.json()
    logger.info('AB impression logged', { ...getLogContext(c), impression: body })
  } catch {
    // Best-effort; ignore parse errors
  }
  return c.json({ success: true })
})

// Global Error Handler with Discord Alerting (Sanitized & Correlated)
app.onError(async (err, c) => {
  const logContext = getLogContext(c)
  logger.error('Unhandled Exception occurred', { ...logContext, error: err.message, stack: err.stack })

  if (webhookUrl) {
    try {
      // Sanitize error info: do NOT leak details/stack traces to external alert payloads
      const payload = {
        embeds: [{
          title: '🚨 Backend Service Error (500)',
          color: 16711680, // Hex: 0xff0000
          fields: [
            { name: 'Request ID', value: logContext.requestId, inline: true },
            { name: 'Method', value: logContext.method, inline: true },
            { name: 'URL', value: logContext.url, inline: true },
            { name: 'Error Name', value: err.name || 'Error', inline: true },
            { name: 'Info', value: 'Detailed stack trace is logged securely in AWS CloudWatch logs.' }
          ],
          timestamp: new Date().toISOString()
        }]
      }

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(alertErr => {
        logger.error('Failed to dispatch Discord Alert', { ...logContext, error: alertErr.message, stack: alertErr.stack })
      })
    } catch (constructErr: any) {
      logger.error('Failed to construct Discord alert payload', { ...logContext, error: constructErr.message, stack: constructErr.stack })
    }
  }

  // Generic internal server error response returned to client (prevents information disclosure)
  return c.json({ error: 'Internal Server Error' }, 500)
})

export const handler = handle(app)
