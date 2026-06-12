import type {
  EvidenceLog,
  ContradictionPair,
  VerdictResult,
  ArchetypeId,
  MainArchetypeId,
  ArchetypeScores,
} from './types';

/**
 * PRECONDITIONS:
 *   - evidenceLog has exactly 8 entries (indices 0–7)
 *   - every entry maps to a valid MainArchetypeId
 *
 * POSTCONDITIONS:
 *   - returns a VerdictResult with a valid ArchetypeId
 *   - archetypeScores sum equals 8
 *   - contradictionIndex is in range [0.0, 1.0]
 *   - if contradictionIndex > 0.5 OR there is a score tie → archetype is WALKING_CONTRADICTION
 */
export function calculateVerdict(
  evidenceLog: EvidenceLog,
  contradictionPairs: ContradictionPair[]
): Omit<VerdictResult, 'verdictId'> {
  // Step 1: Tally scores
  const scores: ArchetypeScores = {
    ETERNAL_OPTIMIST: 0,
    STRATEGIC_PROCRASTINATOR: 0,
    PRODUCTIVITY_PERFORMER: 0,
    VICTIM_ARCHITECT: 0,
    ENLIGHTENED_AVOIDER: 0,
  };
  const choices = Object.values(evidenceLog) as MainArchetypeId[];
  for (const archetype of choices) {
    scores[archetype] += 1;
  }

  // Step 2: Calculate Contradiction_Index
  // Count how many (case_i, case_j) pairs where i < j are contradicting pairs
  let contradictingCount = 0;
  for (let i = 0; i < choices.length; i++) {
    for (let j = i + 1; j < choices.length; j++) {
      const a = choices[i];
      const b = choices[j];
      const isContradiction = contradictionPairs.some(
        ([x, y]) => (a === x && b === y) || (a === y && b === x)
      );
      if (isContradiction) contradictingCount++;
    }
  }
  // Normalize: divide by C(n,2) = n*(n-1)/2 where n = choices.length
  // This guarantees contradictionIndex is in [0.0, 1.0] as required.
  // With 8 choices, max possible contradicting pairs = C(8,2) = 28.
  const n = choices.length;
  const maxPairs = n > 1 ? (n * (n - 1)) / 2 : 1;
  const contradictionIndex = maxPairs > 0 ? contradictingCount / maxPairs : 0;

  // Step 3: Determine winner
  const maxScore = Math.max(...Object.values(scores));
  const winners = (Object.keys(scores) as MainArchetypeId[]).filter(
    (k) => scores[k] === maxScore
  );
  const isTie = winners.length > 1;

  let archetype: ArchetypeId;
  if (contradictionIndex > 0.5 || isTie) {
    archetype = 'WALKING_CONTRADICTION';
  } else {
    archetype = winners[0];
  }

  return {
    archetype,
    archetypeScores: scores,
    contradictionIndex,
    isSecret: archetype === 'WALKING_CONTRADICTION',
  };
}

/**
 * Returns the archetype with the highest score at a checkpoint.
 * In case of tie, returns the first winner (micro-roast text will be generic enough).
 */
export function getLeadingArchetype(evidenceLog: EvidenceLog): MainArchetypeId {
  const scores: ArchetypeScores = {
    ETERNAL_OPTIMIST: 0,
    STRATEGIC_PROCRASTINATOR: 0,
    PRODUCTIVITY_PERFORMER: 0,
    VICTIM_ARCHITECT: 0,
    ENLIGHTENED_AVOIDER: 0,
  };
  for (const archetype of Object.values(evidenceLog) as MainArchetypeId[]) {
    scores[archetype] += 1;
  }
  const max = Math.max(...Object.values(scores));
  return (Object.keys(scores) as MainArchetypeId[]).find((k) => scores[k] === max)!;
}
