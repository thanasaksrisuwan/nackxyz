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
          <m.div
            key="calculating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-testid="calculating-view"
          >
            <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-8 relative overflow-hidden" style={{ backgroundColor: '#09090b' }}>
              {/* Ambient glow */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-red-500/8 rounded-full blur-3xl pointer-events-none" />

              {/* Spinner */}
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
                <div className="absolute inset-0 rounded-full border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <div className="absolute inset-3 rounded-full border-2 border-t-transparent border-r-red-400/50 border-b-transparent border-l-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
              </div>

              {/* Text */}
              <div className="flex flex-col items-center gap-3 text-center">
                <h3 className="text-xl font-bold text-white tracking-wide">กำลังวิเคราะห์หลักฐาน...</h3>
                <p className="text-sm text-zinc-500 font-mono italic max-w-[260px] leading-relaxed">
                  &ldquo;ระบบกำลังประมวลผลพฤติกรรมที่คุณพยายามซ่อน&rdquo;
                </p>
              </div>

              {/* Animated segment dots */}
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-red-500"
                    style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </div>
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
