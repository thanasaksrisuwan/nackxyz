'use client';

// src/audit/components/CaseProgressBar.tsx

import { auditTokens } from '../tokens';

interface CaseProgressBarProps {
  currentCase: number; // 1-based
}

export function CaseProgressBar({ currentCase }: CaseProgressBarProps) {
  return (
    <div
      style={{ backgroundColor: auditTokens.bg }}
      className="flex items-center justify-center py-2"
    >
      <span
        className="text-sm font-mono tracking-widest uppercase"
        style={{ color: auditTokens.accentRed }}
      >
        Case {currentCase}
      </span>
      <span
        className="text-sm font-mono tracking-widest"
        style={{ color: auditTokens.textMuted }}
      >
        /8
      </span>
    </div>
  );
}
