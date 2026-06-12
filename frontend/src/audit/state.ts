import type { AuditSessionState, AuditAction } from './types';
import { getOrAssignVariant } from './abTest';

export const initialAuditState: AuditSessionState = {
  gameState: 'LANDING',
  currentCaseIndex: 0,
  evidenceLog: {},
  verdictResult: null,
  abVariant: getOrAssignVariant(),
  error: null,
};

export function auditReducer(state: AuditSessionState, action: AuditAction): AuditSessionState {
  switch (action.type) {
    case 'START_INVESTIGATION':
      return { ...state, gameState: 'INVESTIGATING', currentCaseIndex: 0, evidenceLog: {} };

    case 'SUBMIT_EVIDENCE': {
      const newLog = { ...state.evidenceLog, [action.caseIndex]: action.archetype };
      const nextIndex = action.caseIndex + 1;
      if (action.caseIndex === 2) return { ...state, evidenceLog: newLog, gameState: 'MICRO_ROAST_3' };
      if (action.caseIndex === 6) return { ...state, evidenceLog: newLog, gameState: 'MICRO_ROAST_7' };
      if (action.caseIndex === 7) return { ...state, evidenceLog: newLog, gameState: 'CALCULATING' };
      return { ...state, evidenceLog: newLog, currentCaseIndex: nextIndex };
    }

    case 'CONFIRM_MICRO_ROAST':
      return { ...state, gameState: 'INVESTIGATING', currentCaseIndex: state.currentCaseIndex + 1 };

    case 'SET_VERDICT':
      return { ...state, verdictResult: action.verdict, gameState: 'VERDICT' };

    case 'SET_ERROR':
      return { ...state, error: action.message, gameState: 'ERROR' };

    case 'RESTART':
      return { ...initialAuditState, abVariant: state.abVariant };

    default:
      return state;
  }
}
