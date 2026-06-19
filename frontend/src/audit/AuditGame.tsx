'use client';

import { useEffect, useReducer } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { auditReducer, initialAuditState } from './state';
import { auditCases } from './data/auditCases';
import type { GetVerdictResponse, VerdictResult } from './types';
import AuditLandingPage from './components/AuditLandingPage';
import CasePlayer from './components/CasePlayer';
import MicroRoastModal from './components/MicroRoastModal';
import VerdictPage from './components/VerdictPage';
import ErrorView from './components/ErrorView';

// ---------------------------------------------------------------------------
// AuditGame
// ---------------------------------------------------------------------------

interface AuditGameProps {
  challengeVerdictId?: string;
  defendantVerdict?: GetVerdictResponse;
}

export default function AuditGame({ challengeVerdictId, defendantVerdict }: AuditGameProps) {
  const [state, dispatch] = useReducer(auditReducer, initialAuditState, (initial) => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nanobanana_audit_state');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.gameState && parsed.gameState !== 'VERDICT' && parsed.gameState !== 'ERROR') {
            return {
              ...initial,
              ...parsed,
            };
          }
        }
      } catch (e) {
        console.warn('Failed to load saved state:', e);
      }
    }
    return initial;
  });
  const { gameState, evidenceLog, error, currentCaseIndex, verdictResult } = state;

  // Save state to localStorage to prevent data loss on refresh
  useEffect(() => {
    if (gameState !== 'VERDICT' && gameState !== 'ERROR') {
      try {
        localStorage.setItem(
          'nanobanana_audit_state',
          JSON.stringify({
            gameState,
            currentCaseIndex,
            evidenceLog,
          })
        );
      } catch (e) {
        console.warn('Failed to save state:', e);
      }
    } else {
      try {
        localStorage.removeItem('nanobanana_audit_state');
      } catch (e) {
        // ignore
      }
    }
  }, [gameState, currentCaseIndex, evidenceLog]);

  // Trigger verdict calculation when entering CALCULATING state.
  // useEffect runs after render, so this is a lazy trigger — not on render itself.
  useEffect(() => {
    if (gameState !== 'CALCULATING') return;

    let cancelled = false;

    async function runCalculation() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/audit/verdict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ evidenceLog }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (cancelled) return;

        const verdictResult: VerdictResult = {
          verdictId: data.verdictId,
          archetype: data.archetype,
          contradictionIndex: data.contradictionIndex,
          archetypeScores: data.archetypeScores,
          isSecret: data.isSecret,
        };

        dispatch({ type: 'SET_VERDICT', verdict: verdictResult });
      } catch {
        if (cancelled) return;
        dispatch({
          type: 'SET_ERROR',
          message: 'เกิดข้อผิดพลาดในการบันทึกผล กรุณาลองใหม่อีกครั้ง',
        });
      }
    }

    runCalculation();

    return () => {
      cancelled = true;
    };
  }, [gameState]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const renderView = () => {
    switch (gameState) {
      case 'LANDING':
        return (
          <m.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AuditLandingPage
              onStart={() => dispatch({ type: 'START_INVESTIGATION' })}
            />
          </m.div>
        );

      case 'INVESTIGATING':
        return (
          <m.div key="investigating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CasePlayer
              auditCase={auditCases[currentCaseIndex]}
              caseNumber={currentCaseIndex + 1}
              onSubmitEvidence={(caseIndex, archetype) => {
                dispatch({ type: 'SUBMIT_EVIDENCE', caseIndex, archetype });
              }}
            />
          </m.div>
        );

      case 'MICRO_ROAST_3':
      case 'MICRO_ROAST_7':
        return (
          <m.div key={gameState} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MicroRoastModal
              evidenceLog={evidenceLog}
              onConfirm={() => dispatch({ type: 'CONFIRM_MICRO_ROAST' })}
            />
          </m.div>
        );

      case 'CALCULATING':
        return (
          <m.div key="calculating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div data-testid="calculating-view">กำลังวิเคราะห์...</div>
          </m.div>
        );

      case 'VERDICT':
        return (
          <m.div key="verdict" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {verdictResult && (
              <VerdictPage
                verdictResult={verdictResult}
                defendantVerdict={challengeVerdictId ? defendantVerdict : undefined}
              />
            )}
          </m.div>
        );

      case 'ERROR':
        return (
          <m.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ErrorView
              message={error ?? 'เกิดข้อผิดพลาด'}
              onRestart={() => dispatch({ type: 'RESTART' })}
            />
          </m.div>
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      {renderView()}
    </AnimatePresence>
  );
}
