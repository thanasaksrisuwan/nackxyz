'use client';

// src/audit/components/ErrorView.tsx
import React from 'react';
import { m } from 'framer-motion';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface ErrorViewProps {
  message: string;
  onRestart: () => void;
}

const ErrorView: React.FC<ErrorViewProps> = ({ message, onRestart }) => {
  const displayMessage = message || 'เกิดข้อผิดพลาดบางอย่าง';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 gap-7 relative overflow-hidden"
      style={{ backgroundColor: '#09090b' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.05)_0%,transparent_70%)] pointer-events-none" />

      {/* Icon */}
      <m.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center"
      >
        <AlertOctagon className="w-8 h-8 text-red-400" />
      </m.div>

      {/* Message */}
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="flex flex-col items-center gap-2 text-center"
      >
        <h2 className="text-lg font-bold text-white">เกิดข้อผิดพลาด</h2>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-[300px]">
          {displayMessage}
        </p>
      </m.div>

      {/* Restart button */}
      <m.button
        onClick={onRestart}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 px-6 h-11 rounded-xl font-bold text-sm text-white cursor-pointer transition-all"
        style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
      >
        <RefreshCw className="w-4 h-4" />
        เริ่มใหม่
      </m.button>
    </div>
  );
};

export default ErrorView;
