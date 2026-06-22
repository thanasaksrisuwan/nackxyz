'use client';

// src/audit/components/CasePlayer.tsx

import React, { useState, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import type { AuditCase, AuditEvidence, MainArchetypeId } from '../types';
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
      className="min-h-screen flex flex-col px-4 py-6 gap-6 relative overflow-hidden"
      style={{ backgroundColor: '#09090b' }}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Progress bar — no back button */}
      <div className="relative z-10">
        <CaseProgressBar currentCase={caseNumber} />
      </div>

      {/* Case prompt */}
      <AnimatePresence mode="wait">
        <m.div
          key={caseNumber}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative z-10 bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5 shadow-xl"
          style={{ boxShadow: '0 0 30px -5px rgba(239,68,68,0.08)' }}
        >
          {/* Label */}
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-red-400 uppercase">
              Case File {caseNumber.toString().padStart(2, '0')}
            </span>
          </div>
          <p
            lang="th"
            className="text-base leading-relaxed text-zinc-100 font-medium"
          >
            {auditCase.text}
          </p>
        </m.div>
      </AnimatePresence>

      {/* Evidence cards */}
      <div className="flex flex-col gap-3 relative z-10">
        <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase text-center">
          เลือกหลักฐานที่ตรงกับตัวคุณมากที่สุด
        </p>
        {auditCase.evidences.map((evidence, idx) => {
          const isSelected = selectedId === evidence.id;
          const isDisabled = isSubmitting && !isSelected;

          return (
            <m.div
              key={evidence.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.3, ease: 'easeOut' }}
            >
              <EvidenceCard
                evidence={evidence}
                onSelect={handleSelect}
                isSelected={isSelected}
                isDisabled={isDisabled}
              />
            </m.div>
          );
        })}
      </div>
    </div>
  );
}

export default CasePlayer;
