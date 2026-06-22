import { describe, it, expect } from 'vitest'
import { calculateVerdict, submitVerdictSchema } from './verdictCalculator'

describe('Verdict Calculator Unit Tests', () => {
  it('should correctly tally scores and determine the winning archetype', () => {
    // Normal case: Eternal Optimist dominates (score = 8)
    const log = {
      "0": "ETERNAL_OPTIMIST",
      "1": "ETERNAL_OPTIMIST",
      "2": "ETERNAL_OPTIMIST",
      "3": "ETERNAL_OPTIMIST",
      "4": "ETERNAL_OPTIMIST",
      "5": "ETERNAL_OPTIMIST",
      "6": "ETERNAL_OPTIMIST",
      "7": "ETERNAL_OPTIMIST"
    }

    const result = calculateVerdict(log)
    expect(result.archetype).toBe('ETERNAL_OPTIMIST')
    expect(result.contradictionIndex).toBe(0)
    expect(result.isSecret).toBe(false)
    expect(result.archetypeScores.ETERNAL_OPTIMIST).toBe(8)
  })

  it('should flag walking contradiction when contradiction index is high (> 0.5)', () => {
    // Eternal Optimist (x4) vs Victim Architect (x4) - heavily contradicting
    const log = {
      "0": "ETERNAL_OPTIMIST",
      "1": "ETERNAL_OPTIMIST",
      "2": "ETERNAL_OPTIMIST",
      "3": "ETERNAL_OPTIMIST",
      "4": "VICTIM_ARCHITECT",
      "5": "VICTIM_ARCHITECT",
      "6": "VICTIM_ARCHITECT",
      "7": "VICTIM_ARCHITECT"
    }

    const result = calculateVerdict(log)
    expect(result.archetype).toBe('WALKING_CONTRADICTION')
    expect(result.contradictionIndex).toBeGreaterThan(0.5)
    expect(result.isSecret).toBe(true)
  })

  it('should flag walking contradiction on score ties', () => {
    // Tie between ENLIGHTENED_AVOIDER (x4) and STRATEGIC_PROCRASTINATOR (x4) - no direct contradiction but tie
    const log = {
      "0": "ENLIGHTENED_AVOIDER",
      "1": "ENLIGHTENED_AVOIDER",
      "2": "ENLIGHTENED_AVOIDER",
      "3": "ENLIGHTENED_AVOIDER",
      "4": "STRATEGIC_PROCRASTINATOR",
      "5": "STRATEGIC_PROCRASTINATOR",
      "6": "STRATEGIC_PROCRASTINATOR",
      "7": "STRATEGIC_PROCRASTINATOR"
    }

    const result = calculateVerdict(log)
    expect(result.archetype).toBe('WALKING_CONTRADICTION')
    expect(result.isSecret).toBe(true)
  })
})

describe('Submit Verdict Zod Schema Tests', () => {
  it('should validate complete valid logs successfully', () => {
    const payload = {
      evidenceLog: {
        "0": "ETERNAL_OPTIMIST",
        "1": "STRATEGIC_PROCRASTINATOR",
        "2": "PRODUCTIVITY_PERFORMER",
        "3": "VICTIM_ARCHITECT",
        "4": "ENLIGHTENED_AVOIDER",
        "5": "ETERNAL_OPTIMIST",
        "6": "STRATEGIC_PROCRASTINATOR",
        "7": "PRODUCTIVITY_PERFORMER"
      }
    }

    const validation = submitVerdictSchema.safeParse(payload)
    expect(validation.success).toBe(true)
  })

  it('should fail validation when log has missing questions', () => {
    const payload = {
      evidenceLog: {
        "0": "ETERNAL_OPTIMIST",
        "1": "STRATEGIC_PROCRASTINATOR"
      }
    }

    const validation = submitVerdictSchema.safeParse(payload)
    expect(validation.success).toBe(false)
  })

  it('should fail validation when keys are out of bounds', () => {
    const payload = {
      evidenceLog: {
        "0": "ETERNAL_OPTIMIST",
        "1": "STRATEGIC_PROCRASTINATOR",
        "2": "PRODUCTIVITY_PERFORMER",
        "3": "VICTIM_ARCHITECT",
        "4": "ENLIGHTENED_AVOIDER",
        "5": "ETERNAL_OPTIMIST",
        "6": "STRATEGIC_PROCRASTINATOR",
        "9": "PRODUCTIVITY_PERFORMER" // key 9 is invalid for 8 total cases
      }
    }

    const validation = submitVerdictSchema.safeParse(payload)
    expect(validation.success).toBe(false)
  })
})

describe('Hono Error Handler Tests', () => {
  it('should trigger custom global error handler and return 500 on unhandled exception', async () => {
    const { app } = await import('./index')

    // Register a temporary test error route
    app.get('/api/test-unhandled-error', () => {
      throw new Error('Simulated backend failure')
    })

    const res = await app.request('/api/test-unhandled-error')
    expect(res.status).toBe(500)

    const data = await res.json()
    expect(data.error).toBe('Internal Server Error')
    expect(data.message).toBeUndefined()
  })
})

