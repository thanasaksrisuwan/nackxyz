'use client';

import React from 'react';
import type { VerdictResult } from '../types';
import { archetypes } from '../data/archetypes';
import { auditTokens } from '../tokens';

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

  const borderStyle: React.CSSProperties = isSecret
    ? { border: `2px dashed ${auditTokens.gold}` }
    : {
        border: `2px solid ${auditTokens.purple}`,
        boxShadow: `0 0 20px rgba(179, 136, 255, 0.5)`,
      };

  const archetypeNameColor = isSecret ? auditTokens.gold : auditTokens.purple;

  return (
    <div
      ref={cardRef}
      style={{
        aspectRatio: '9/16',
        width: '360px',
        backgroundColor: auditTokens.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        boxSizing: 'border-box',
        borderRadius: '12px',
        gap: '0',
        ...borderStyle,
      }}
    >
      {/* [SECRET] badge — only for Walking Contradiction */}
      {isSecret && (
        <div
          style={{
            color: auditTokens.gold,
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            marginBottom: '12px',
            border: `1px solid ${auditTokens.gold}`,
            padding: '2px 10px',
            borderRadius: '4px',
          }}
        >
          [SECRET]
        </div>
      )}

      {/* Small label */}
      <div
        style={{
          color: auditTokens.textMuted,
          fontSize: '10px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: '24px',
        }}
      >
        THE SELF-DECEPTION AUDIT
      </div>

      {/* Archetype Thai name (large, prominent) */}
      <div
        style={{
          color: archetypeNameColor,
          fontSize: '28px',
          fontWeight: 700,
          textAlign: 'center',
          lineHeight: 1.3,
          marginBottom: '8px',
        }}
      >
        {archetype.nameThai}
      </div>

      {/* Archetype English name */}
      <div
        style={{
          color: auditTokens.textPrimary,
          fontSize: '13px',
          textAlign: 'center',
          marginBottom: '20px',
          opacity: 0.85,
        }}
      >
        {archetype.nameEn}
      </div>

      {/* Horizontal divider */}
      <hr
        style={{
          width: '80%',
          border: 'none',
          borderTop: `1px solid rgba(245, 245, 245, 0.15)`,
          margin: '0 0 20px 0',
        }}
      />

      {/* Thai description */}
      <div
        style={{
          color: auditTokens.textPrimary,
          fontSize: '13px',
          textAlign: 'center',
          lineHeight: 1.6,
          maxWidth: '280px',
          marginBottom: '20px',
        }}
      >
        {archetype.descriptionThai}
      </div>

      {/* Horizontal divider */}
      <hr
        style={{
          width: '80%',
          border: 'none',
          borderTop: `1px solid rgba(245, 245, 245, 0.15)`,
          margin: '0 0 20px 0',
        }}
      />

      {/* Challenge URL */}
      <div
        style={{
          color: auditTokens.textMuted,
          fontSize: '11px',
          textAlign: 'center',
          letterSpacing: '0.03em',
          marginBottom: '8px',
          wordBreak: 'break-all',
        }}
      >
        {challengeUrl}
      </div>

      {/* Branding */}
      <div
        style={{
          color: auditTokens.textMuted,
          fontSize: '11px',
          textAlign: 'center',
          opacity: 0.6,
        }}
      >
        souldrink.app
      </div>
    </div>
  );
};

export default VerdictShareCard;
