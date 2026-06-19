import { z } from 'zod'
import { auditCases } from '../../frontend/src/audit/data/auditCases'

export const MainArchetypeEnum = z.enum([
  'ETERNAL_OPTIMIST',
  'STRATEGIC_PROCRASTINATOR',
  'PRODUCTIVITY_PERFORMER',
  'VICTIM_ARCHITECT',
  'ENLIGHTENED_AVOIDER'
])

export const TOTAL_CASES = auditCases.length

export const submitVerdictSchema = z.object({
  evidenceLog: z.record(
    z.string().refine(
      (val) => {
        const num = Number(val)
        return !isNaN(num) && num >= 0 && num < TOTAL_CASES
      },
      { message: `Keys must be indices from 0 to ${TOTAL_CASES - 1}` }
    ),
    MainArchetypeEnum
  ).refine(
    (log) => Object.keys(log).length === TOTAL_CASES,
    { message: `Must have exactly ${TOTAL_CASES} answered cases` }
  )
})

export const contradictionPairs = [
  ['ETERNAL_OPTIMIST',          'VICTIM_ARCHITECT'],
  ['STRATEGIC_PROCRASTINATOR',  'PRODUCTIVITY_PERFORMER'],
  ['ENLIGHTENED_AVOIDER',       'ETERNAL_OPTIMIST'],
]

export interface ArchetypeScores {
  ETERNAL_OPTIMIST: number
  STRATEGIC_PROCRASTINATOR: number
  PRODUCTIVITY_PERFORMER: number
  VICTIM_ARCHITECT: number
  ENLIGHTENED_AVOIDER: number
}

export function calculateVerdict(evidenceLog: Record<string, string>) {
  const scores: ArchetypeScores = {
    ETERNAL_OPTIMIST: 0,
    STRATEGIC_PROCRASTINATOR: 0,
    PRODUCTIVITY_PERFORMER: 0,
    VICTIM_ARCHITECT: 0,
    ENLIGHTENED_AVOIDER: 0,
  }

  const choices = Object.keys(evidenceLog)
    .sort((a, b) => Number(a) - Number(b))
    .map(key => evidenceLog[key])

  for (const archetype of choices) {
    if (archetype in scores) {
      scores[archetype as keyof ArchetypeScores] += 1
    }
  }

  let contradictingCount = 0
  for (let i = 0; i < choices.length; i++) {
    for (let j = i + 1; j < choices.length; j++) {
      const a = choices[i]
      const b = choices[j]
      const isContradiction = contradictionPairs.some(
        ([x, y]) => (a === x && b === y) || (a === y && b === x)
      )
      if (isContradiction) contradictingCount++
    }
  }

  const n = choices.length
  const maxPairs = n > 1 ? (n * (n - 1)) / 2 : 1
  const contradictionIndex = maxPairs > 0 ? contradictingCount / maxPairs : 0

  const maxScore = Math.max(...Object.values(scores))
  const winners = (Object.keys(scores) as Array<keyof ArchetypeScores>).filter(
    (k) => scores[k] === maxScore
  )
  const isTie = winners.length > 1

  let archetype: string
  if (contradictionIndex > 0.5 || isTie) {
    archetype = 'WALKING_CONTRADICTION'
  } else {
    archetype = winners[0]
  }

  return {
    archetype,
    archetypeScores: scores,
    contradictionIndex,
    isSecret: archetype === 'WALKING_CONTRADICTION'
  }
}
