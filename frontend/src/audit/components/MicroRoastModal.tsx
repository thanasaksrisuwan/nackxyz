'use client';

// src/audit/components/MicroRoastModal.tsx
// Full-screen micro-roast overlay shown at case 3 and case 7 checkpoints.
// Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6

import { m } from 'framer-motion';
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        pointerEvents: 'all',
      }}
    >
      {/* Animated modal card */}
      <m.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '2.5rem 2rem',
          maxWidth: '480px',
          width: '90%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Roast label */}
        <p
          style={{
            fontSize: '0.75rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#FF4D4D',
            margin: 0,
          }}
        >
          ระบบตรวจพบ
        </p>

        {/* Roast text */}
        <p
          style={{
            fontSize: '1.375rem',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {roastText}
        </p>

        {/* Confirm button — only interaction available */}
        <button
          onClick={onConfirm}
          style={{
            backgroundColor: '#FF4D4D',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            alignSelf: 'center',
            minWidth: '140px',
          }}
        >
          รับทราบ
        </button>
      </m.div>
    </div>
  );
}

export default MicroRoastModal;
