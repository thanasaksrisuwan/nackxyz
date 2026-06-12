'use client';

// src/audit/components/ErrorView.tsx
import React from 'react';
import { auditTokens } from '../tokens';

interface ErrorViewProps {
  message: string;
  onRestart: () => void;
}

const ErrorView: React.FC<ErrorViewProps> = ({ message, onRestart }) => {
  const displayMessage = message || 'เกิดข้อผิดพลาดบางอย่าง';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: auditTokens.bg,
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <p
        style={{
          color: auditTokens.textPrimary,
          fontSize: '1.125rem',
          textAlign: 'center',
          marginBottom: '32px',
          maxWidth: '400px',
          lineHeight: 1.6,
        }}
      >
        {displayMessage}
      </p>

      <button
        onClick={onRestart}
        style={{
          backgroundColor: auditTokens.accentRed,
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 32px',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '0.02em',
        }}
      >
        เริ่มใหม่
      </button>
    </div>
  );
};

export default ErrorView;
