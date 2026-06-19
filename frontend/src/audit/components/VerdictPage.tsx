'use client';

import { useRef } from 'react';
import { m } from 'framer-motion';
import { Gavel, Award, Sparkles } from 'lucide-react';
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function VerdictPage({ verdictResult, defendantVerdict }: VerdictPageProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const archetype = archetypes[verdictResult.archetype];
  const challengeUrl = buildChallengeUrl(verdictResult.verdictId);
  const isSecret = archetype.isSecret;

  return (
    <m.main
      className="flex min-h-screen flex-col items-center gap-8 px-4 py-12 text-center relative overflow-hidden bg-[#09090b]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div
        className={`absolute bottom-1/4 right-1/4 w-80 h-80 ${
          isSecret ? 'bg-amber-500/5' : 'bg-purple-600/10'
        } rounded-full blur-3xl pointer-events-none`}
      />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Verdict Detail Card */}
      <m.section
        className="glass-premium max-w-2xl w-full p-8 sm:p-10 rounded-3xl border border-white/10 flex flex-col items-center gap-5 shadow-2xl relative z-10"
        variants={itemVariants}
      >
        {/* Animated Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-bold uppercase tracking-wider">
          <Gavel className="w-3.5 h-3.5" />
          <span>Verdict Declared</span>
        </div>

        {/* Archetype Title */}
        <div className="flex flex-col gap-2">
          <h1
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight uppercase font-sans`}
            style={{ color: isSecret ? auditTokens.gold : auditTokens.purple }}
          >
            {archetype.nameThai}
          </h1>
          <p className="text-zinc-500 text-xs font-mono tracking-widest uppercase flex items-center justify-center gap-1">
            {isSecret && <Sparkles className="w-3.5 h-3.5 text-yellow-500" />}
            {archetype.nameEn}
          </p>
        </div>

        {/* Divider */}
        <div className="w-12 h-0.5 bg-zinc-800 rounded-full" />

        {/* Description */}
        <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-[500px]">
          {archetype.descriptionThai}
        </p>
      </m.section>

      {defendantVerdict && (
        <m.div className="w-full max-w-2xl relative z-10" variants={itemVariants}>
          <SideBySideComparison defendantVerdict={defendantVerdict} challengerVerdict={verdictResult} />
        </m.div>
      )}

      {/* Share card & action area */}
      <m.div className="flex flex-col items-center gap-6 relative z-10 w-full" variants={itemVariants}>
        <VerdictShareCard verdictResult={verdictResult} challengeUrl={challengeUrl} cardRef={cardRef} />
        <ShareButton cardRef={cardRef} challengeUrl={challengeUrl} />
        <ChallengeLinkDisplay challengeUrl={challengeUrl} />
      </m.div>
    </m.main>
  );
}
