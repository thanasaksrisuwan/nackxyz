'use client';

import { useState } from 'react';
import html2canvas from 'html2canvas';
import { auditTokens } from '../tokens';

interface ShareButtonProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
  challengeUrl: string;
}

export default function ShareButton({ cardRef, challengeUrl }: ShareButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'retry'>('idle');

  const renderCard = async () => {
    if (!cardRef.current) throw new Error('card not mounted');
    return html2canvas(cardRef.current, {
      scale: 2,
      backgroundColor: auditTokens.bg,
      useCORS: true,
    });
  };

  const downloadCard = async () => {
    try {
      const canvas = await renderCard();
      const link = document.createElement('a');
      link.download = 'self-deception-audit.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      setStatus('idle');
    } catch {
      setStatus('retry');
    }
  };

  const shareVerdict = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'The Self-Deception Audit',
          text: 'เข้ามาดู Verdict นี้แล้วขึ้นให้ปากคำต่อ',
          url: challengeUrl,
        });
        setStatus('idle');
        return;
      }

      await navigator.clipboard.writeText(challengeUrl);
      setStatus('copied');
      window.setTimeout(() => setStatus('idle'), 1600);
    } catch {
      try {
        await navigator.clipboard.writeText(challengeUrl);
        setStatus('copied');
        window.setTimeout(() => setStatus('idle'), 1600);
      } catch {
        setStatus('retry');
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      <button
        type="button"
        onClick={shareVerdict}
        className="rounded-lg px-5 py-3 text-sm font-bold"
        style={{ backgroundColor: auditTokens.accentRed, color: '#fff' }}
      >
        แชร์ Verdict
      </button>
      <button
        type="button"
        onClick={downloadCard}
        className="rounded-lg border px-5 py-3 text-sm font-bold"
        style={{ borderColor: auditTokens.purple, color: auditTokens.textPrimary }}
      >
        ดาวน์โหลดการ์ด
      </button>
      <span className="min-h-5 text-sm" style={{ color: status === 'retry' ? auditTokens.accentRed : auditTokens.textMuted }}>
        {status === 'copied' ? 'คัดลอกลิงก์แล้ว' : status === 'retry' ? 'ลองอีกครั้ง' : ''}
      </span>
    </div>
  );
}
