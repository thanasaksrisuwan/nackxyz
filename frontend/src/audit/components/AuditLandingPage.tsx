'use client';

import { useEffect, useState } from 'react';
import { getOrAssignVariant, headlines } from '../abTest';
import { auditTokens } from '../tokens';
import type { AbVariant } from '../types';

interface AuditLandingPageProps {
  onStart: () => void;
}

export default function AuditLandingPage({ onStart }: AuditLandingPageProps) {
  const [variant, setVariant] = useState<AbVariant | null>(null);

  useEffect(() => {
    const v = getOrAssignVariant();
    
    // Defer state update to avoid synchronous cascading render during hydration mount
    setTimeout(() => {
      setVariant(v);
    }, 0);

    // Fire-and-forget impression event
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/audit/impression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variant: v, timestamp: new Date().toISOString() }),
    }).catch(() => {});
  }, []);

  const headline = variant ? headlines[variant] : '';

  return (
    <div
      style={{
        backgroundColor: auditTokens.bg,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        color: auditTokens.textPrimary,
        fontFamily: 'sans-serif',
        textAlign: 'center',
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          width: '48px',
          height: '4px',
          backgroundColor: auditTokens.accentRed,
          borderRadius: '2px',
          marginBottom: '2rem',
        }}
      />

      {/* A/B variant headline */}
      <h1
        style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          fontWeight: 700,
          lineHeight: 1.3,
          maxWidth: '640px',
          marginBottom: '1.25rem',
          color: auditTokens.textPrimary,
        }}
      >
        {headline}
      </h1>

      {/* Description */}
      <p
        style={{
          fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
          color: auditTokens.textMuted,
          maxWidth: '520px',
          lineHeight: 1.6,
          marginBottom: '2.5rem',
        }}
      >
        ระบบตรวจสอบพฤติกรรมหลอกตัวเอง — 8 Case, Verdict ที่คุณอาจไม่อยากรู้
      </p>

      {/* CTA button */}
      <button
        onClick={onStart}
        style={{
          backgroundColor: auditTokens.accentRed,
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          padding: '0.875rem 2.5rem',
          fontSize: '1.1rem',
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '0.03em',
          transition: 'opacity 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        เริ่มการสอบสวน
      </button>
    </div>
  );
}
