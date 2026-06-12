import { describe, it, expect } from 'vitest';
import { calculateVerdict } from '../verdictCalculator';
import type { EvidenceLog, ContradictionPair, MainArchetypeId } from '../types';

// The real contradiction pairs from the project data
const contradictionPairs: ContradictionPair[] = [
  ['ETERNAL_OPTIMIST', 'VICTIM_ARCHITECT'],
  ['STRATEGIC_PROCRASTINATOR', 'PRODUCTIVITY_PERFORMER'],
  ['ENLIGHTENED_AVOIDER', 'ETERNAL_OPTIMIST'],
];

/** Build an EvidenceLog with exactly 8 entries from a flat array of archetypes */
function makeLog(archetypes: MainArchetypeId[]): EvidenceLog {
  const log: EvidenceLog = {};
  archetypes.forEach((a, i) => { log[i] = a; });
  return log;
}

describe('calculateVerdict', () => {
  // Test 1: All 8 answers to the same archetype → that archetype wins, contradictionIndex = 0
  it('returns the dominant archetype when all 8 answers are the same', () => {
    const log = makeLog([
      'ETERNAL_OPTIMIST', 'ETERNAL_OPTIMIST', 'ETERNAL_OPTIMIST', 'ETERNAL_OPTIMIST',
      'ETERNAL_OPTIMIST', 'ETERNAL_OPTIMIST', 'ETERNAL_OPTIMIST', 'ETERNAL_OPTIMIST',
    ]);

    const result = calculateVerdict(log, contradictionPairs);

    expect(result.archetype).toBe('ETERNAL_OPTIMIST');
    expect(result.contradictionIndex).toBe(0);
    expect(result.archetypeScores.ETERNAL_OPTIMIST).toBe(8);
  });

  // Test 2: 4 answers each to two OPPOSITE archetypes → WALKING_CONTRADICTION (index > 0.5)
  it('returns WALKING_CONTRADICTION when split evenly between two opposing archetypes', () => {
    // ETERNAL_OPTIMIST ↔ VICTIM_ARCHITECT is a contradiction pair
    const log = makeLog([
      'ETERNAL_OPTIMIST', 'ETERNAL_OPTIMIST', 'ETERNAL_OPTIMIST', 'ETERNAL_OPTIMIST',
      'VICTIM_ARCHITECT', 'VICTIM_ARCHITECT', 'VICTIM_ARCHITECT', 'VICTIM_ARCHITECT',
    ]);

    const result = calculateVerdict(log, contradictionPairs);

    expect(result.archetype).toBe('WALKING_CONTRADICTION');
    expect(result.contradictionIndex).toBeGreaterThan(0.5);
    expect(result.isSecret).toBe(true);
  });

  // Test 3: Exact tie between two NON-opposing archetypes → WALKING_CONTRADICTION due to tie
  it('returns WALKING_CONTRADICTION on an exact score tie between two archetypes', () => {
    // ETERNAL_OPTIMIST and STRATEGIC_PROCRASTINATOR are NOT a contradiction pair,
    // but a tie still triggers WALKING_CONTRADICTION
    const log = makeLog([
      'ETERNAL_OPTIMIST', 'ETERNAL_OPTIMIST', 'ETERNAL_OPTIMIST', 'ETERNAL_OPTIMIST',
      'STRATEGIC_PROCRASTINATOR', 'STRATEGIC_PROCRASTINATOR', 'STRATEGIC_PROCRASTINATOR', 'STRATEGIC_PROCRASTINATOR',
    ]);

    const result = calculateVerdict(log, contradictionPairs);

    expect(result.archetype).toBe('WALKING_CONTRADICTION');
    expect(result.isSecret).toBe(true);
  });

  // Test 4: contradictionIndex stays within [0.0, 1.0] for a variety of valid inputs
  it('always produces a contradictionIndex within [0.0, 1.0]', () => {
    const cases: EvidenceLog[] = [
      // All same
      makeLog(['PRODUCTIVITY_PERFORMER', 'PRODUCTIVITY_PERFORMER', 'PRODUCTIVITY_PERFORMER', 'PRODUCTIVITY_PERFORMER',
               'PRODUCTIVITY_PERFORMER', 'PRODUCTIVITY_PERFORMER', 'PRODUCTIVITY_PERFORMER', 'PRODUCTIVITY_PERFORMER']),
      // All different
      makeLog(['ETERNAL_OPTIMIST', 'STRATEGIC_PROCRASTINATOR', 'PRODUCTIVITY_PERFORMER', 'VICTIM_ARCHITECT',
               'ENLIGHTENED_AVOIDER', 'ETERNAL_OPTIMIST', 'STRATEGIC_PROCRASTINATOR', 'PRODUCTIVITY_PERFORMER']),
      // Maximum contradictions (alternating opposing pair)
      makeLog(['ETERNAL_OPTIMIST', 'VICTIM_ARCHITECT', 'ETERNAL_OPTIMIST', 'VICTIM_ARCHITECT',
               'ETERNAL_OPTIMIST', 'VICTIM_ARCHITECT', 'ETERNAL_OPTIMIST', 'VICTIM_ARCHITECT']),
      // Mixed contradictions
      makeLog(['STRATEGIC_PROCRASTINATOR', 'PRODUCTIVITY_PERFORMER', 'STRATEGIC_PROCRASTINATOR', 'PRODUCTIVITY_PERFORMER',
               'ENLIGHTENED_AVOIDER', 'ETERNAL_OPTIMIST', 'VICTIM_ARCHITECT', 'VICTIM_ARCHITECT']),
    ];

    for (const log of cases) {
      const result = calculateVerdict(log, contradictionPairs);
      expect(result.contradictionIndex).toBeGreaterThanOrEqual(0.0);
      expect(result.contradictionIndex).toBeLessThanOrEqual(1.0);
    }
  });

  // Test 5: archetypeScores values sum to 8 when evidenceLog has 8 entries
  it('produces archetypeScores that sum to exactly 8', () => {
    const log = makeLog([
      'ETERNAL_OPTIMIST', 'ETERNAL_OPTIMIST', 'STRATEGIC_PROCRASTINATOR', 'PRODUCTIVITY_PERFORMER',
      'VICTIM_ARCHITECT', 'ENLIGHTENED_AVOIDER', 'ETERNAL_OPTIMIST', 'VICTIM_ARCHITECT',
    ]);

    const result = calculateVerdict(log, contradictionPairs);

    const total = Object.values(result.archetypeScores).reduce((sum, v) => sum + v, 0);
    expect(total).toBe(8);
  });
});
