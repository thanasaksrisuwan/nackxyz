'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuditGame from '../AuditGame';
import type { GetVerdictResponse } from '../types';
import { archetypes } from '../data/archetypes';
import { auditTokens } from '../tokens';

export default function ChallengePage() {
  const searchParams = useSearchParams();
  const verdictId = searchParams.get('id') ?? '';
  const [defendantVerdict, setDefendantVerdict] = useState<GetVerdictResponse | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found' | 'error'>('loading');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchVerdict() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/audit/verdict/${verdictId}`);
        if (cancelled) return;

        if (response.status === 404) {
          setStatus('not-found');
          return;
        }

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = (await response.json()) as GetVerdictResponse;
        setDefendantVerdict(data);
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    fetchVerdict();

    return () => {
      cancelled = true;
    };
  }, [verdictId]);

  if (started && verdictId && defendantVerdict) {
    return <AuditGame challengeVerdictId={verdictId} defendantVerdict={defendantVerdict} />;
  }

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: auditTokens.bg, color: auditTokens.textPrimary }}>
        กำลังโหลด Verdict...
      </main>
    );
  }

  if (status === 'not-found') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center" style={{ backgroundColor: auditTokens.bg, color: auditTokens.textPrimary }}>
        <h1 className="text-2xl font-black">ไม่พบ Verdict นี้</h1>
        <Link className="rounded-lg px-5 py-3 font-bold" style={{ backgroundColor: auditTokens.accentRed, color: '#fff' }} href="/audit">
          เริ่มการสอบสวนของคุณเอง
        </Link>
      </main>
    );
  }

  if (status === 'error' || !defendantVerdict) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center" style={{ backgroundColor: auditTokens.bg, color: auditTokens.textPrimary }}>
        <p>โหลด Verdict ไม่สำเร็จ</p>
        <Link className="rounded-lg px-5 py-3 font-bold" style={{ backgroundColor: auditTokens.accentRed, color: '#fff' }} href="/audit">
          เริ่มใหม่
        </Link>
      </main>
    );
  }

  const defendant = archetypes[defendantVerdict.archetype];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center" style={{ backgroundColor: auditTokens.bg, color: auditTokens.textPrimary }}>
      <p className="text-xs uppercase tracking-[0.24em]" style={{ color: auditTokens.accentRed }}>
        Challenge Link
      </p>
      <h1 className="max-w-2xl text-3xl font-black leading-tight">
        คุณกำลังทำ Investigation เดียวกับ Defendant ที่ถูกจัดเป็น
        <span style={{ color: defendant.isSecret ? auditTokens.gold : auditTokens.purple }}> {defendant.nameThai}</span>
      </h1>
      <p className="max-w-xl leading-7" style={{ color: auditTokens.textMuted }}>
        ทำให้ครบ 8 Case แล้วระบบจะเทียบ Verdict ของคุณกับเจ้าของลิงก์แบบไม่อ้อมค้อม
      </p>
      <button
        type="button"
        onClick={() => setStarted(true)}
        className="rounded-lg px-6 py-3 font-bold"
        style={{ backgroundColor: auditTokens.accentRed, color: '#fff' }}
      >
        เริ่มการสอบสวน
      </button>
    </main>
  );
}
