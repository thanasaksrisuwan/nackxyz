/**
 * Unit tests for auditReducer
 *
 * Validates: Requirements 3.4, 3.5, 4.1, 4.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { AuditSessionState } from '../types';

// ── sessionStorage must be stubbed BEFORE state.ts is imported ─────────────────
// state.ts calls getOrAssignVariant() at module-evaluation time (initialAuditState).
// vi.hoisted runs before imports, so the stub is in place when the module loads.
const { sessionStorageMock } = vi.hoisted(() => {
  let store: Record<string, string> = { audit_ab_variant: 'A' };
  const mock = {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = { audit_ab_variant: 'A' }; }),
    _reset: () => { store = { audit_ab_variant: 'A' }; },
  };
  vi.stubGlobal('sessionStorage', mock);
  return { sessionStorageMock: mock };
});

import { auditReducer, initialAuditState } from '../state';

beforeEach(() => {
  sessionStorageMock._reset();
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
});

// ── Helper: build a minimal state snapshot ──────────────────────────────────
function makeState(overrides: Partial<AuditSessionState> = {}): AuditSessionState {
  return {
    gameState: 'INVESTIGATING',
    currentCaseIndex: 0,
    evidenceLog: {},
    verdictResult: null,
    abVariant: 'A',
    error: null,
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('auditReducer', () => {
  // ── START_INVESTIGATION ────────────────────────────────────────────────────
  describe('START_INVESTIGATION', () => {
    it('resets evidenceLog to {} and moves to INVESTIGATING at index 0', () => {
      const state = makeState({
        gameState: 'LANDING',
        currentCaseIndex: 5,
        evidenceLog: { 0: 'ETERNAL_OPTIMIST', 1: 'STRATEGIC_PROCRASTINATOR' },
      });

      const next = auditReducer(state, { type: 'START_INVESTIGATION' });

      expect(next.gameState).toBe('INVESTIGATING');
      expect(next.currentCaseIndex).toBe(0);
      expect(next.evidenceLog).toEqual({});
    });
  });

  // ── SUBMIT_EVIDENCE ────────────────────────────────────────────────────────
  describe('SUBMIT_EVIDENCE', () => {
    it('at index 2 → sets gameState to MICRO_ROAST_3 without incrementing currentCaseIndex', () => {
      const state = makeState({ currentCaseIndex: 2 });

      const next = auditReducer(state, {
        type: 'SUBMIT_EVIDENCE',
        caseIndex: 2,
        archetype: 'ETERNAL_OPTIMIST',
      });

      expect(next.gameState).toBe('MICRO_ROAST_3');
      // currentCaseIndex must NOT have been incremented yet
      expect(next.currentCaseIndex).toBe(2);
      // Evidence is recorded
      expect(next.evidenceLog[2]).toBe('ETERNAL_OPTIMIST');
    });

    it('at index 6 → sets gameState to MICRO_ROAST_7 without incrementing currentCaseIndex', () => {
      const state = makeState({ currentCaseIndex: 6 });

      const next = auditReducer(state, {
        type: 'SUBMIT_EVIDENCE',
        caseIndex: 6,
        archetype: 'STRATEGIC_PROCRASTINATOR',
      });

      expect(next.gameState).toBe('MICRO_ROAST_7');
      expect(next.currentCaseIndex).toBe(6);
      expect(next.evidenceLog[6]).toBe('STRATEGIC_PROCRASTINATOR');
    });

    it('at index 7 → sets gameState to CALCULATING', () => {
      const state = makeState({ currentCaseIndex: 7 });

      const next = auditReducer(state, {
        type: 'SUBMIT_EVIDENCE',
        caseIndex: 7,
        archetype: 'PRODUCTIVITY_PERFORMER',
      });

      expect(next.gameState).toBe('CALCULATING');
      expect(next.evidenceLog[7]).toBe('PRODUCTIVITY_PERFORMER');
    });
  });

  // ── CONFIRM_MICRO_ROAST ────────────────────────────────────────────────────
  describe('CONFIRM_MICRO_ROAST', () => {
    it('advances currentCaseIndex by 1 and sets gameState to INVESTIGATING', () => {
      // Simulate having just seen MICRO_ROAST_3 (index still at 2 after SUBMIT_EVIDENCE)
      const state = makeState({ gameState: 'MICRO_ROAST_3', currentCaseIndex: 2 });

      const next = auditReducer(state, { type: 'CONFIRM_MICRO_ROAST' });

      expect(next.gameState).toBe('INVESTIGATING');
      expect(next.currentCaseIndex).toBe(3);
    });

    it('also works after MICRO_ROAST_7 (index 6 → 7)', () => {
      const state = makeState({ gameState: 'MICRO_ROAST_7', currentCaseIndex: 6 });

      const next = auditReducer(state, { type: 'CONFIRM_MICRO_ROAST' });

      expect(next.gameState).toBe('INVESTIGATING');
      expect(next.currentCaseIndex).toBe(7);
    });
  });

  // ── RESTART ────────────────────────────────────────────────────────────────
  describe('RESTART', () => {
    it('preserves abVariant but resets everything else to initial values', () => {
      const state = makeState({
        gameState: 'VERDICT',
        currentCaseIndex: 7,
        evidenceLog: { 0: 'ETERNAL_OPTIMIST', 3: 'VICTIM_ARCHITECT' },
        abVariant: 'C',
        error: 'some error',
        verdictResult: {
          verdictId: 'test-uuid',
          archetype: 'ETERNAL_OPTIMIST',
          archetypeScores: {
            ETERNAL_OPTIMIST: 3,
            STRATEGIC_PROCRASTINATOR: 1,
            PRODUCTIVITY_PERFORMER: 1,
            VICTIM_ARCHITECT: 1,
            ENLIGHTENED_AVOIDER: 2,
          },
          contradictionIndex: 0.5,
          isSecret: false,
        },
      });

      const next = auditReducer(state, { type: 'RESTART' });

      // abVariant is preserved from the pre-restart state
      expect(next.abVariant).toBe('C');

      // Everything else mirrors initialAuditState
      expect(next.gameState).toBe(initialAuditState.gameState);
      expect(next.currentCaseIndex).toBe(0);
      expect(next.evidenceLog).toEqual({});
      expect(next.verdictResult).toBeNull();
      expect(next.error).toBeNull();
    });
  });
});
