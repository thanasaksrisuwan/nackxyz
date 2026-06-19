'use client';

import dynamic from 'next/dynamic';

const AuditGame = dynamic(() => import('../../audit/AuditGame'), {
  loading: () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b]">
      <div className="text-zinc-400 text-sm font-mono animate-pulse">
        ⚖️ กำลังตั้งศาลท้าพิสูจน์คำลวง... กรุณารอสักครู่
      </div>
    </div>
  ),
  ssr: false
});

export default function AuditGameLauncher() {
  return <AuditGame />;
}
