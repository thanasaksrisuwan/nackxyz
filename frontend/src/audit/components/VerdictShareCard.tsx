'use client';

import React from 'react';
import type { VerdictResult } from '../types';
import { archetypes } from '../data/archetypes';

interface VerdictShareCardProps {
  verdictResult: VerdictResult;
  challengeUrl: string;
  cardRef: React.RefObject<HTMLDivElement | null>;
}

export const VerdictShareCard: React.FC<VerdictShareCardProps> = ({
  verdictResult,
  challengeUrl,
  cardRef,
}) => {
  const archetype = archetypes[verdictResult.archetype];
  const isSecret = verdictResult.isSecret;

  // Inline styles required for html2canvas compatibility
  const accentColor = isSecret ? '#FFD700' : '#B388FF';
  const borderStyle: React.CSSProperties = isSecret
    ? { border: '2px dashed #FFD700' }
    : { border: '2px solid #B388FF', boxShadow: '0 0 20px rgba(179, 136, 255, 0.4)' };

  return (
    <div
      ref={cardRef}
      style={{
        aspectRatio: '9/16',
        width: '320px',
        backgroundColor: '#0B0B0C',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 28px',
        boxSizing: 'border-box',
        borderRadius: '16px',
        gap: '0',
        position: 'relative',
        overflow: 'hidden',
        ...borderStyle,
      }}
    >
      {/* Background grid texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }}
      />

      {/* Top glow */}
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, ${accentColor}15 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* [SECRET] badge */}
      {isSecret && (
        <div
          style={{
            color: '#FFD700',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.25em',
            marginBottom: '16px',
            border: '1px solid #FFD700',
            padding: '3px 12px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            position: 'relative',
            zIndex: 1,
          }}
        >
          ✦ SECRET ✦
        </div>
      )}

      {/* Label */}
      <div
        style={{
          color: '#555',
          fontSize: '9px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: '28px',
          position: 'relative',
          zIndex: 1,
          fontFamily: 'monospace',
        }}
      >
        THE SELF-DECEPTION AUDIT
      </div>

      {/* Archetype Thai name */}
      <div
        style={{
          color: accentColor,
          fontSize: '26px',
          fontWeight: 800,
          textAlign: 'center',
          lineHeight: 1.3,
          marginBottom: '8px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {archetype.nameThai}
      </div>

      {/* Archetype English name */}
      <div
        style={{
          color: '#F5F5F5',
          fontSize: '12px',
          textAlign: 'center',
          marginBottom: '24px',
          opacity: 0.7,
          position: 'relative',
          zIndex: 1,
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
        }}
      >
        {archetype.nameEn}
      </div>

      {/* Divider */}
      <div
        style={{
          width: '60%',
          height: '1px',
          background: 'rgba(255,255,255,0.1)',
          marginBottom: '20px',
          position: 'relative',
          zIndex: 1,
        }}
      />

      {/* Thai description */}
      <div
        style={{
          color: '#D4D4D8',
          fontSize: '13px',
          textAlign: 'center',
          lineHeight: 1.65,
          maxWidth: '260px',
          marginBottom: '24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {archetype.descriptionThai}
      </div>

      {/* Divider */}
      <div
        style={{
          width: '60%',
          height: '1px',
          background: 'rgba(255,255,255,0.08)',
          marginBottom: '20px',
          position: 'relative',
          zIndex: 1,
        }}
      />

      {/* Challenge URL */}
      <div
        style={{
          color: '#555',
          fontSize: '10px',
          textAlign: 'center',
          letterSpacing: '0.03em',
          marginBottom: '6px',
          wordBreak: 'break-all',
          maxWidth: '260px',
          position: 'relative',
          zIndex: 1,
          fontFamily: 'monospace',
        }}
      >
        {challengeUrl}
      </div>

      {/* Branding */}
      <div
        style={{
          color: '#444',
          fontSize: '9px',
          textAlign: 'center',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          position: 'relative',
          zIndex: 1,
          fontFamily: 'monospace',
        }}
      >
        🍌 NanoBanana Lab
      </div>
    </div>
  );
};

export default VerdictShareCard;
