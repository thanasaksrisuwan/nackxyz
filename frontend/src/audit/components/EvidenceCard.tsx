'use client';

// src/audit/components/EvidenceCard.tsx

import React from 'react';
import { m } from 'framer-motion';
import { Check } from 'lucide-react';
import type { AuditEvidence } from '../types';

interface EvidenceCardProps {
  evidence: AuditEvidence;
  onSelect: (evidence: AuditEvidence) => void;
  isSelected: boolean;
  isDisabled: boolean;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  evidence,
  onSelect,
  isSelected,
  isDisabled,
}) => {
  const handleClick = () => {
    if (!isDisabled && !isSelected) {
      onSelect(evidence);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isDisabled && !isSelected) {
      e.preventDefault();
      onSelect(evidence);
    }
  };

  const isBlocked = isDisabled || isSelected;

  return (
    <m.button
      type="button"
      role="button"
      aria-pressed={isSelected}
      aria-disabled={isBlocked}
      disabled={false} // keep focusable; we block via pointer-events + logic
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      whileHover={isBlocked ? {} : { scale: 1.01, y: -1 }}
      whileTap={isBlocked ? {} : { scale: 0.99 }}
      className={`
        w-full rounded-xl px-4 py-3.5
        text-left text-sm leading-relaxed font-medium
        border-2 transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950
        ${isSelected
          ? 'border-red-500 bg-red-500/10 text-zinc-100'
          : isDisabled
          ? 'border-zinc-800/50 bg-zinc-950/50 text-zinc-600 opacity-40 pointer-events-none'
          : 'border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-200 cursor-pointer'
        }
      `}
      style={
        isSelected
          ? { boxShadow: '0 0 16px -3px rgba(239, 68, 68, 0.4)' }
          : undefined
      }
      data-blocked={isBlocked ? 'true' : undefined}
      data-selected={isSelected ? 'true' : undefined}
    >
      <div className="flex items-start gap-3">
        {/* Selection indicator */}
        <div
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
            isSelected
              ? 'border-red-500 bg-red-500'
              : 'border-zinc-700 bg-transparent'
          }`}
        >
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>

        <div className="flex flex-col gap-1">
          <span lang="th" className="block leading-relaxed">
            {evidence.text}
          </span>

          {isSelected && (
            <m.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-mono text-red-400 font-bold"
            >
              ✓ บันทึกหลักฐานแล้ว
            </m.span>
          )}
        </div>
      </div>
    </m.button>
  );
};

export default EvidenceCard;
