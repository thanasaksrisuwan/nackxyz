import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'
import { cors } from 'hono/cors'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'

const app = new Hono()

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
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-southeast-1' })
const docClient = DynamoDBDocumentClient.from(client)

// In-Memory Cache for Statistics to prevent DynamoDB RCU exhaustion
interface CachedStats {
  totalPlays: number
  stats: Record<string, number>
  timestamp: number
}

let cache: CachedStats | null = null
const CACHE_TTL_MS = 10000 // 10 seconds

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
      'chaos_coder',
      'tenx_architect',
      'overflow_paster',
      'clean_coder',
      'grindset_leet',
      'prompt_engineer',
      'terminal_ninja',
      'pixel_perfectionist'
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
    
    // Invalidate local in-memory cache so next read fetches fresh data
    cache = null

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
    const now = Date.now()
    if (cache && (now - cache.timestamp < CACHE_TTL_MS)) {
      return c.json({
        success: true,
        totalPlays: cache.totalPlays,
        stats: cache.stats,
        _cached: true
      })
    }

    const command = new ScanCommand({
      TableName: tableName
    })

    const response = await docClient.send(command)
    const items = response.Items || []

    // Map DynamoDB items to simple key-value object
    const stats: Record<string, number> = {}
    
    // Seed default counts with 0
    const defaultArchetypes = [
      'chaos_coder',
      'tenx_architect',
      'overflow_paster',
      'clean_coder',
      'grindset_leet',
      'prompt_engineer',
      'terminal_ninja',
      'pixel_perfectionist'
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

    // Save to in-memory cache
    cache = {
      totalPlays,
      stats,
      timestamp: now
    }

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

export const handler = handle(app)
