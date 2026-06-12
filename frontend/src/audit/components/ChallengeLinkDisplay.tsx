'use client';

import { useState } from 'react';
import { auditTokens } from '../tokens';

interface ChallengeLinkDisplayProps {
  challengeUrl: string;
}

export default function ChallengeLinkDisplay({ challengeUrl }: ChallengeLinkDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(challengeUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-2 text-xs uppercase tracking-[0.22em]" style={{ color: auditTokens.textMuted }}>
        Challenge Link
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <code className="flex-1 break-all rounded-lg bg-black/40 px-3 py-3 text-sm" style={{ color: auditTokens.textPrimary }}>
          {challengeUrl}
        </code>
        <button
          type="button"
          onClick={copyLink}
          className="rounded-lg px-4 py-3 text-sm font-bold"
          style={{ backgroundColor: auditTokens.accentRed, color: '#fff' }}
        >
          {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
        </button>
      </div>
    </section>
  );
}
