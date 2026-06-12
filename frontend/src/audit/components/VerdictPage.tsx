'use client';

import { useRef } from 'react';
import type { GetVerdictResponse, VerdictResult } from '../types';
import { archetypes } from '../data/archetypes';
import { auditTokens } from '../tokens';
import ChallengeLinkDisplay from './ChallengeLinkDisplay';
import ShareButton from './ShareButton';
import SideBySideComparison from './SideBySideComparison';
import VerdictShareCard from './VerdictShareCard';

interface VerdictPageProps {
  verdictResult: VerdictResult;
  defendantVerdict?: GetVerdictResponse;
}

function buildChallengeUrl(verdictId: string) {
  const path = `/audit/challenge?id=${verdictId}`;
  return `${window.location.origin}${path}`;
}

export default function VerdictPage({ verdictResult, defendantVerdict }: VerdictPageProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const archetype = archetypes[verdictResult.archetype];
  const challengeUrl = buildChallengeUrl(verdictResult.verdictId);

  return (
    <main
      className="flex min-h-screen flex-col items-center gap-8 px-4 py-10 text-center"
      style={{ backgroundColor: auditTokens.bg, color: auditTokens.textPrimary }}
    >
      <section className="max-w-2xl">
        <p className="mb-3 text-xs uppercase tracking-[0.24em]" style={{ color: auditTokens.accentRed }}>
          Verdict
        </p>
        <h1 className="mb-3 text-4xl font-black leading-tight" style={{ color: archetype.isSecret ? auditTokens.gold : auditTokens.purple }}>
          {archetype.nameThai}
        </h1>
        <p className="text-sm" style={{ color: auditTokens.textMuted }}>
          {archetype.nameEn}
        </p>
        <p className="mt-4 text-base leading-7" style={{ color: auditTokens.textPrimary }}>
          {archetype.descriptionThai}
        </p>
      </section>

      {defendantVerdict && (
        <SideBySideComparison defendantVerdict={defendantVerdict} challengerVerdict={verdictResult} />
      )}

      <VerdictShareCard verdictResult={verdictResult} challengeUrl={challengeUrl} cardRef={cardRef} />
      <ShareButton cardRef={cardRef} challengeUrl={challengeUrl} />
      <ChallengeLinkDisplay challengeUrl={challengeUrl} />
    </main>
  );
}
