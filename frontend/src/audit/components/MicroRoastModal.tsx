'use client';

// src/audit/components/MicroRoastModal.tsx
// Full-screen micro-roast overlay shown at case 3 and case 7 checkpoints.
// Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6

import { m, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import type { EvidenceLog } from '../types';
import { getLeadingArchetype } from '../verdictCalculator';
import { microRoasts } from '../data/microRoasts';

interface MicroRoastModalProps {
  evidenceLog: EvidenceLog;
  onConfirm: () => void;
}

export function MicroRoastModal({ evidenceLog, onConfirm }: MicroRoastModalProps) {
  const leadingArchetype = getLeadingArchetype(evidenceLog);
  const entry = microRoasts.find((r) => r.archetype === leadingArchetype);
  // Fallback to first text of first entry if somehow no match (should never happen)
  const roastText = entry?.texts[0] ?? microRoasts[0].texts[0];

  return (
    // Backdrop: full-screen, blocks all background interaction
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-5 bg-black/80 backdrop-blur-sm">
      <AnimatePresence>
        {/* Animated modal card */}
        <m.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-7 text-center flex flex-col items-center gap-5 shadow-2xl relative overflow-hidden"
          style={{ boxShadow: '0 0 60px -10px rgba(239, 68, 68, 0.3), 0 20px 50px rgba(0,0,0,0.5)' }}
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.06)_0%,transparent_70%)] pointer-events-none" />

          {/* Alert Icon */}
          <div className="relative z-10 w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-400" />
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-zinc-950 animate-pulse" />
          </div>

          {/* Roast label */}
          <div className="relative z-10 flex items-center gap-2">
            <div className="h-px w-8 bg-red-500/40" />
            <p className="text-[10px] font-mono font-bold tracking-widest text-red-400 uppercase">
              ระบบตรวจพบ
            </p>
            <div className="h-px w-8 bg-red-500/40" />
          </div>

          {/* Roast text */}
          <p className="relative z-10 text-xl font-black text-white leading-snug tracking-tight max-w-[280px]">
            {roastText}
          </p>

          {/* Divider */}
          <div className="w-full h-px bg-zinc-800 relative z-10" />

          {/* Confirm button */}
          <m.button
            onClick={onConfirm}
            whileHover={{ scale: 1.02, boxShadow: '0 0 25px -5px rgba(239,68,68,0.5)' }}
            whileTap={{ scale: 0.97 }}
            className="relative z-10 w-full h-11 rounded-xl font-bold text-sm uppercase tracking-wider text-white cursor-pointer transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            }}
          >
            รับทราบ — สู้ต่อ
          </m.button>

          <p className="relative z-10 text-[10px] text-zinc-600 font-mono">
            อีก {Object.keys(evidenceLog).length >= 7 ? 1 : 8 - Object.keys(evidenceLog).length} Case ก่อนถึง Verdict สุดท้าย
          </p>
        </m.div>
      </AnimatePresence>
    </div>
  );
}

export default MicroRoastModal;
