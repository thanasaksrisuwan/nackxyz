'use client';

// src/audit/components/CasePlayer.tsx

import React, { useState, useRef } from 'react';
import type { AuditCase, AuditEvidence, MainArchetypeId } from '../types';
import { auditTokens } from '../tokens';
import { CaseProgressBar } from './CaseProgressBar';
import { EvidenceCard } from './EvidenceCard';

interface CasePlayerProps {
  auditCase: AuditCase;           // current case (from auditCases array)
  caseNumber: number;             // 1-based for display
  onSubmitEvidence: (caseIndex: number, archetype: MainArchetypeId) => void;
}

export function CasePlayer({ auditCase, caseNumber, onSubmitEvidence }: CasePlayerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSelect = (evidence: AuditEvidence) => {
    if (isSubmitting || selectedId !== null) return;

    // Immediately mark selected for visual feedback
    setSelectedId(evidence.id);
    setIsSubmitting(true);

    // After 400ms delay, dispatch the action
    timerRef.current = setTimeout(() => {
      onSubmitEvidence(caseNumber - 1, evidence.archetype);
    }, 400);
  };

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div
      style={{
        backgroundColor: auditTokens.bg,
        color: auditTokens.textPrimary,
        minHeight: '100%',
      }}
      className="flex flex-col px-4 py-6 gap-6"
    >
      {/* Progress bar — no back button */}
      <CaseProgressBar currentCase={caseNumber} />

      {/* Case prompt */}
      <p
        lang="th"
        className="text-base leading-relaxed text-center px-2"
        style={{ color: auditTokens.textPrimary }}
      >
        {auditCase.text}
      </p>

      {/* Evidence cards */}
      <div className="flex flex-col gap-3">
        {auditCase.evidences.map((evidence) => {
          const isSelected = selectedId === evidence.id;
          const isDisabled = isSubmitting && !isSelected;

          return (
            <EvidenceCard
              key={evidence.id}
              evidence={evidence}
              onSelect={handleSelect}
              isSelected={isSelected}
              isDisabled={isDisabled}
            />
          );
        })}
      </div>
    </div>
  );
}

export default CasePlayer;
