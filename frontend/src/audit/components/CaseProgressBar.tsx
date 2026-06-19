'use client';

// src/audit/components/CaseProgressBar.tsx

import { auditTokens } from '../tokens';

interface CaseProgressBarProps {
  currentCase: number; // 1-based
}

export function CaseProgressBar({ currentCase }: CaseProgressBarProps) {
  const totalCases = 8;

  return (
    <div className="w-full flex flex-col gap-3.5 py-2">
      {/* Sleek Monospace Label */}
      <div className="flex items-center justify-between text-[11px] font-mono tracking-[0.2em] uppercase text-zinc-500">
        <span>Investigation Status</span>
        <span className="font-bold text-red-400">
          Case {currentCase} <span className="text-zinc-600">/</span> {totalCases}
        </span>
      </div>

      {/* Segmented Progress Indicator */}
      <div className="grid grid-cols-8 gap-2 w-full">
        {Array.from({ length: totalCases }).map((_, index) => {
          const caseNum = index + 1;
          const isCompleted = caseNum < currentCase;
          const isActive = caseNum === currentCase;

          return (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isCompleted
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 opacity-90'
                  : isActive
                  ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse'
                  : 'bg-zinc-800'
              }`}
              style={{
                boxShadow: isActive ? '0 0 10px rgba(255, 77, 77, 0.5)' : undefined,
              }}
              aria-hidden="true"
            />
          );
        })}
      </div>
    </div>
  );
}

