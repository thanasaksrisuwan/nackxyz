import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'
import { cors } from 'hono/cors'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand, ScanCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { submitVerdictSchema, calculateVerdict } from './verdictCalculator'

export const app = new Hono()

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

    // Check Cloudflare Pages subdomains for this repo (e.g. preview deployments)
    // Supports domains like xxx.nackxyz.pages.dev or xxx-nackxyz.pages.dev
    if (origin.endsWith('.pages.dev') && (origin.includes('nackxyz') || origin.includes('dev-persona') || origin.includes('aws-lab'))) {
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

// Root endpoint for health check
app.get('/', (c) => {
  return c.json({ status: 'ok', service: 'dev-persona-api' })
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

    const { archetypeId } = body

    if (!archetypeId) {
      return c.json({ error: 'archetypeId is required' }, 400)
    }

    const validArchetypes = [
      'deadline_necromancer',
      'emotional_support',
      'dopamine_investor',
      'productivity_tourist',
      'functional_zombie',
      'chaos_ceo',
      'accidental_genius'
    ]

    if (!validArchetypes.includes(archetypeId)) {
      return c.json({ error: 'Invalid archetypeId' }, 400)
    }

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

    return c.json({
      success: true,
      archetypeId,
      updatedCount: response.Attributes?.count || 1
    })
  } catch (error: any) {
    console.error('Error recording result:', error)
    return c.json({ error: 'Internal Server Error', message: error.message }, 500)
  }
})

// GET /api/stats - Get counts for all archetypes
app.get('/api/stats', async (c) => {
  try {
    const command = new ScanCommand({
      TableName: tableName
    })

    const response = await docClient.send(command)
    const items = response.Items || []

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
    console.error('Error fetching stats:', error)
    return c.json({ error: 'Internal Server Error', message: error.message }, 500)
  }
})

// POST /api/stats - Increment count for a specific result_id (Soul Drink)
app.post('/api/stats', async (c) => {
  try {
    const body = await c.req.json()
    const resultId = body.result_id

    if (!resultId) {
      return c.json({ error: 'result_id is required' }, 400)
    }

    const command = new UpdateCommand({
      TableName: soulDrinkTable,
      Key: { result_id: resultId },
      UpdateExpression: 'ADD #count :inc',
      ExpressionAttributeNames: { '#count': 'count' },
      ExpressionAttributeValues: { ':inc': 1 },
      ReturnValues: 'UPDATED_NEW'
    })

    const response = await docClient.send(command)

    return c.json({
      success: true,
      result_id: resultId,
      new_count: response.Attributes?.count
    })
  } catch (error: any) {
    console.error('Error updating Soul Drink stats:', error)
    return c.json({ error: 'Failed to update stats' }, 500)
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
    console.error('Error fetching Soul Drink stats:', error)
    return c.json({ error: 'Failed to fetch stats' }, 500)
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

    // Save verdict to database
    const verdictId = randomUUID()
    const now = new Date()
    const ttlSeconds = Math.floor(now.getTime() / 1000) + AUDIT_VERDICT_TTL_DAYS * 24 * 60 * 60

    await docClient.send(new PutCommand({
      TableName: auditTable,
      Item: {
        verdict_id: verdictId,
        archetype: verdictBase.archetype,
        contradiction_index: verdictBase.contradictionIndex,
        archetype_scores: verdictBase.archetypeScores,
        is_secret: verdictBase.isSecret,
        created_at: now.toISOString(),
        ttl_expires_at: ttlSeconds,
      },
    }))

    return c.json({
      success: true,
      verdictId,
      archetype: verdictBase.archetype,
      contradictionIndex: verdictBase.contradictionIndex,
      archetypeScores: verdictBase.archetypeScores,
      isSecret: verdictBase.isSecret
    })
  } catch (error: any) {
    console.error('Error saving audit verdict:', error)
    return c.json({ error: 'Failed to save verdict', message: error.message }, 500)
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
    console.error('Error fetching audit verdict:', error)
    return c.json({ error: 'Failed to fetch verdict' }, 500)
  }
})

// POST /api/audit/impression — fire-and-forget A/B impression logging
app.post('/api/audit/impression', async (c) => {
  try {
    const body = await c.req.json()
    console.log('AB impression:', JSON.stringify(body))
  } catch {
    // Best-effort; ignore parse errors
  }
  return c.json({ success: true })
})

// Global Error Handler with Discord Alerting
app.onError(async (err, c) => {
  console.error('Unhandled Exception:', err)

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (webhookUrl) {
    try {
      const payload = {
        embeds: [{
          title: '🚨 Backend Service Error (500)',
          color: 16711680, // Hex: 0xff0000
          fields: [
            { name: 'Method', value: c.req.method, inline: true },
            { name: 'URL', value: c.req.url, inline: true },
            { name: 'Message', value: err.message || 'Unknown error' },
            { name: 'Stack Trace', value: `\`\`\`javascript\n${(err.stack || '').slice(0, 800)}\n\`\`\`` }
          ],
          timestamp: new Date().toISOString()
        }]
      }

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(alertErr => {
        console.error('Failed to dispatch Discord Alert:', alertErr)
      })
    } catch (constructErr) {
      console.error('Failed to construct Discord alert payload:', constructErr)
    }
  }

  return c.json({ error: 'Internal Server Error', message: err.message }, 500)
})

export const handler = handle(app)
