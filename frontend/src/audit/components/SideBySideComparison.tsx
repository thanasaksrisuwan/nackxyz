'use client';

import type { GetVerdictResponse, VerdictResult } from '../types';
import { archetypes } from '../data/archetypes';
import { auditTokens } from '../tokens';

interface SideBySideComparisonProps {
  defendantVerdict: GetVerdictResponse;
  challengerVerdict: VerdictResult;
}

export default function SideBySideComparison({
  defendantVerdict,
  challengerVerdict,
}: SideBySideComparisonProps) {
  const defendant = archetypes[defendantVerdict.archetype];
  const challenger = archetypes[challengerVerdict.archetype];

  return (
    <section className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
      <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.22em]" style={{ color: auditTokens.textMuted }}>
          Defendant
        </p>
        <h2 className="mb-2 text-2xl font-black" style={{ color: defendant.isSecret ? auditTokens.gold : auditTokens.purple }}>
          {defendant.nameThai}
        </h2>
        <p className="text-sm" style={{ color: auditTokens.textPrimary }}>{defendant.nameEn}</p>
        <p className="mt-4 text-sm leading-6" style={{ color: auditTokens.textMuted }}>{defendant.descriptionThai}</p>
      </article>

      <article className="rounded-2xl border p-6 text-center" style={{ borderColor: auditTokens.accentRed, backgroundColor: 'rgba(255,77,77,0.06)' }}>
        <p className="mb-3 text-xs uppercase tracking-[0.22em]" style={{ color: auditTokens.textMuted }}>
          Challenger
        </p>
        <h2 className="mb-2 text-2xl font-black" style={{ color: challenger.isSecret ? auditTokens.gold : auditTokens.purple }}>
          {challenger.nameThai}
        </h2>
        <p className="text-sm" style={{ color: auditTokens.textPrimary }}>{challenger.nameEn}</p>
        <p className="mt-4 text-sm leading-6" style={{ color: auditTokens.textMuted }}>{challenger.descriptionThai}</p>
      </article>
    </section>
  );
}
