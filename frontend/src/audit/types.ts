// src/audit/types.ts

export type ArchetypeId =
  | 'ETERNAL_OPTIMIST'
  | 'STRATEGIC_PROCRASTINATOR'
  | 'PRODUCTIVITY_PERFORMER'
  | 'VICTIM_ARCHITECT'
  | 'ENLIGHTENED_AVOIDER'
  | 'WALKING_CONTRADICTION';

// The 5 main archetypes that evidence maps to (no Walking Contradiction)
export type MainArchetypeId = Exclude<ArchetypeId, 'WALKING_CONTRADICTION'>;

export type AbVariant = 'A' | 'B' | 'C';

export type AuditGameState =
  | 'LANDING'
  | 'INVESTIGATING'
  | 'MICRO_ROAST_3'
  | 'MICRO_ROAST_7'
  | 'CALCULATING'
  | 'VERDICT'
  | 'ERROR';

// --- Static Data Types ---

export interface AuditEvidence {
  id: string;           // e.g. "c1_e1"
  text: string;         // Thai, ≤60 chars
  archetype: MainArchetypeId;
}

export interface AuditCase {
  id: number;           // 1–8
  text: string;         // Case prompt in Thai
  evidences: [AuditEvidence, AuditEvidence, AuditEvidence, AuditEvidence]; // exactly 4
}

export interface ArchetypeDefinition {
  id: ArchetypeId;
  nameThai: string;           // e.g. "นักฝันอมตะ"
  nameEn: string;             // e.g. "The Eternal Optimist"
  descriptionThai: string;    // ≤50 chars, shown on Verdict card
  isSecret: boolean;
  cardAccentColor: string;    // hex
}

export interface MicroRoastEntry {
  archetype: MainArchetypeId;
  texts: string[];   // at least 1 Thai string ≤80 chars
}

// --- Session/Runtime Types ---

// Maps case index (0-7) to the chosen evidence's archetype
export type EvidenceLog = Partial<Record<number, MainArchetypeId>>;

// Accumulated score per archetype
export type ArchetypeScores = Record<MainArchetypeId, number>;

// A pair of directly opposing archetypes for Contradiction_Index calculation
export type ContradictionPair = [MainArchetypeId, MainArchetypeId];

// --- Verdict Types ---

export interface VerdictResult {
  verdictId: string;        // UUID v4
  archetype: ArchetypeId;
  archetypeScores: ArchetypeScores;
  contradictionIndex: number;  // 0.0–1.0
  isSecret: boolean;
}

// --- API Payload Types ---

export interface SaveVerdictRequest {
  verdictId: string;
  archetype: ArchetypeId;
  contradictionIndex: number;
  archetypeScores: ArchetypeScores;
}

export interface SaveVerdictResponse {
  success: boolean;
  verdictId: string;
}

export interface GetVerdictResponse {
  verdictId: string;
  archetype: ArchetypeId;
  isSecret: boolean;
}

// --- React State (useReducer) ---

export interface AuditSessionState {
  gameState: AuditGameState;
  currentCaseIndex: number;         // 0-7
  evidenceLog: EvidenceLog;         // answers so far
  verdictResult: VerdictResult | null;
  abVariant: AbVariant;
  error: string | null;
}

export type AuditAction =
  | { type: 'START_INVESTIGATION' }
  | { type: 'SUBMIT_EVIDENCE'; caseIndex: number; archetype: MainArchetypeId }
  | { type: 'CONFIRM_MICRO_ROAST' }
  | { type: 'SET_VERDICT'; verdict: VerdictResult }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'RESTART' };
