'use client';

// src/audit/components/EvidenceCard.tsx

import React from 'react';
import type { AuditEvidence } from '../types';
import { auditTokens } from '../tokens';

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
    <button
      type="button"
      role="button"
      aria-pressed={isSelected}
      aria-disabled={isBlocked}
      disabled={false} // keep focusable; we block via pointer-events + logic
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        backgroundColor: auditTokens.bg,
        color: auditTokens.textPrimary,
        border: isSelected
          ? `2px solid ${auditTokens.accentRed}`
          : '2px solid rgba(255, 255, 255, 0.12)',
        boxShadow: isSelected
          ? `0 0 12px 2px rgba(255, 77, 77, 0.45)`
          : 'none',
        pointerEvents: isBlocked ? 'none' : 'auto',
        cursor: isBlocked ? 'default' : 'pointer',
        opacity: isDisabled && !isSelected ? 0.45 : 1,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease, transform 0.1s ease',
      }}
      className="
        w-full rounded-lg px-4 py-3
        text-left text-sm leading-relaxed
        font-medium
        focus:outline-none
        focus-visible:ring-2 focus-visible:ring-[#FF4D4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0C]
        hover:[&:not([data-blocked])]:border-white/30
        active:[&:not([data-blocked])]:scale-[0.98]
      "
      data-blocked={isBlocked ? 'true' : undefined}
      data-selected={isSelected ? 'true' : undefined}
    >
      <span className="block" lang="th">
        {evidence.text}
      </span>

      {isSelected && (
        <span
          aria-hidden="true"
          className="mt-2 block text-xs"
          style={{ color: auditTokens.accentRed }}
        >
          ✓ เลือกแล้ว
        </span>
      )}
    </button>
  );
};

export default EvidenceCard;
