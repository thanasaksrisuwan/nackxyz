'use client';

import { useEffect, useReducer } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { auditReducer, initialAuditState } from './state';
import { calculateVerdict } from './verdictCalculator';
import { contradictionPairs } from './data/contradictionPairs';
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
  const [state, dispatch] = useReducer(auditReducer, initialAuditState);
  const { gameState, evidenceLog, error, currentCaseIndex, verdictResult } = state;

  // Trigger verdict calculation when entering CALCULATING state.
  // useEffect runs after render, so this is a lazy trigger — not on render itself.
  useEffect(() => {
    if (gameState !== 'CALCULATING') return;

    let cancelled = false;

    async function runCalculation() {
      const verdictBase = calculateVerdict(evidenceLog, contradictionPairs);
      const verdictId = crypto.randomUUID();

      const payload = {
        verdictId,
        archetype: verdictBase.archetype,
        contradictionIndex: verdictBase.contradictionIndex,
        archetypeScores: verdictBase.archetypeScores,
      };

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/audit/verdict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        if (cancelled) return;

        const verdictResult: VerdictResult = {
          ...verdictBase,
          verdictId,
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
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AuditLandingPage
              onStart={() => dispatch({ type: 'START_INVESTIGATION' })}
            />
          </motion.div>
        );

      case 'INVESTIGATING':
        return (
          <motion.div key="investigating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CasePlayer
              auditCase={auditCases[currentCaseIndex]}
              caseNumber={currentCaseIndex + 1}
              onSubmitEvidence={(caseIndex, archetype) => {
                dispatch({ type: 'SUBMIT_EVIDENCE', caseIndex, archetype });
              }}
            />
          </motion.div>
        );

      case 'MICRO_ROAST_3':
      case 'MICRO_ROAST_7':
        return (
          <motion.div key={gameState} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MicroRoastModal
              evidenceLog={evidenceLog}
              onConfirm={() => dispatch({ type: 'CONFIRM_MICRO_ROAST' })}
            />
          </motion.div>
        );

      case 'CALCULATING':
        return (
          <motion.div key="calculating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div data-testid="calculating-view">กำลังวิเคราะห์...</div>
          </motion.div>
        );

      case 'VERDICT':
        return (
          <motion.div key="verdict" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {verdictResult && (
              <VerdictPage
                verdictResult={verdictResult}
                defendantVerdict={challengeVerdictId ? defendantVerdict : undefined}
              />
            )}
          </motion.div>
        );

      case 'ERROR':
        return (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ErrorView
              message={error ?? 'เกิดข้อผิดพลาด'}
              onRestart={() => dispatch({ type: 'RESTART' })}
            />
          </motion.div>
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      {renderView()}
    </AnimatePresence>
  );
}
