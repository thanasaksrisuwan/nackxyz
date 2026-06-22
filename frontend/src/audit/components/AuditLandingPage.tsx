'use client';

import { useEffect, useState } from 'react';
import { m } from 'framer-motion';
import { Gavel, Scale, Eye, AlertTriangle } from 'lucide-react';
import { getOrAssignVariant, headlines } from '../abTest';
import type { AbVariant } from '../types';

interface AuditLandingPageProps {
  onStart: () => void;
}

const floatingVariants = {
  animate: {
    y: [0, -8, 0],
    rotate: [0, 1, -1, 0],
    transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const features = [
  { icon: Scale, label: '8 Case Studies', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  { icon: Eye, label: 'Real-time Analysis', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { icon: AlertTriangle, label: 'Brutal Honesty', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
];

export default function AuditLandingPage({ onStart }: AuditLandingPageProps) {
  const [variant, setVariant] = useState<AbVariant | null>(null);

  useEffect(() => {
    const v = getOrAssignVariant();
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
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12 relative overflow-hidden"
      style={{ backgroundColor: '#09090b' }}
    >
      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-red-500/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-600/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-48 h-48 bg-amber-500/4 rounded-full blur-3xl pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <m.div
        className="w-full max-w-sm flex flex-col items-center text-center gap-7 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Mascot / Icon */}
        <m.div variants={itemVariants}>
          <m.div
            className="w-24 h-24 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-xl relative"
            style={{ boxShadow: '0 0 40px -5px rgba(239, 68, 68, 0.25)' }}
            variants={floatingVariants}
            animate="animate"
          >
            <Gavel className="w-12 h-12 text-red-400" />
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 border-2 border-zinc-950 animate-pulse" />
          </m.div>
        </m.div>

        {/* Badge */}
        <m.div variants={itemVariants}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold tracking-widest text-red-400 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            GAME 03 — THE AUDIT
          </span>
        </m.div>

        {/* Headline */}
        <m.div className="flex flex-col gap-3" variants={itemVariants}>
          <h1
            className="text-3xl font-black tracking-tight text-white leading-tight min-h-[72px] flex items-center justify-center"
            style={{ textShadow: '0 0 40px rgba(239,68,68,0.2)' }}
          >
            {headline || 'ระบบตรวจจับการหลอกตัวเอง'}
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-[300px] mx-auto">
            8 Case Study ที่เขียนจากพฤติกรรมจริง — Verdict ที่คุณอาจไม่อยากรู้
          </p>
        </m.div>

        {/* Feature badges */}
        <m.div className="flex flex-wrap gap-2 justify-center" variants={itemVariants}>
          {features.map(({ icon: Icon, label, color, bg }) => (
            <span
              key={label}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${bg} ${color}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </span>
          ))}
        </m.div>

        {/* CTA Button */}
        <m.div className="w-full" variants={itemVariants}>
          <m.button
            onClick={onStart}
            whileHover={{ scale: 1.02, boxShadow: '0 0 30px -5px rgba(239, 68, 68, 0.5)' }}
            whileTap={{ scale: 0.97 }}
            className="w-full h-12 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer text-white"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: '0 4px 20px -5px rgba(239, 68, 68, 0.4)',
            }}
          >
            <Gavel className="w-4 h-4" />
            เริ่มการสอบสวน
          </m.button>
        </m.div>

        {/* Disclaimer */}
        <m.p className="text-zinc-600 text-[11px] font-mono" variants={itemVariants}>
          ⚖️ ผลลัพธ์อาจเจ็บปวด — แต่นั่นคือความจริง
        </m.p>
      </m.div>
    </div>
  );
}
