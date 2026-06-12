'use client';

import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { useRef, useState } from 'react';
import { Download } from 'lucide-react';

interface ResultCardProps {
  result: {
    id: string;
    name: string;
    mbti: string;
    description: string;
    image: string;
    color: string;
    text: string;
  };
  rarity?: number;
}

export default function ResultCard({ result, rarity }: ResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveImage = async () => {
    if (!cardRef.current) return;
    setIsSaving(true);
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: null
      });
      
      const image = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.href = image;
      link.download = `SoulDrink_${result.mbti}.jpg`;
      link.click();
    } catch (err) {
      console.error('Failed to save image:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="w-full flex justify-center"
      >
        {/* 9:16 Aspect Ratio Card for Social Media */}
        <div 
          ref={cardRef}
          className={`relative w-full aspect-[9/16] max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col bg-gradient-to-br ${result.color}`}
        >
          {/* Top Section */}
          <div className="p-8 flex-1 flex flex-col items-center text-center justify-center relative z-10">
            <img 
              src={result.image} 
              alt={result.name}
              className="w-40 h-40 object-contain mb-6 drop-shadow-lg rounded-2xl bg-white/20 p-2 border border-white/20"
            />
            <div className="bg-white/30 backdrop-blur-md px-4 py-1.5 rounded-full mb-4">
              <span className={`text-sm font-bold tracking-widest ${result.text}`}>
                VIBE: {result.mbti}
              </span>
            </div>
            <h1 className={`text-4xl font-extrabold mb-4 leading-tight ${result.text}`}>
              {result.name}
            </h1>
            <p className={`text-lg opacity-90 font-medium leading-relaxed ${result.text}`}>
              {result.description}
            </p>
          </div>

          {/* Bottom Stats Section */}
          <div className="bg-white/25 backdrop-blur-xl p-6 border-t border-white/20">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white/70">
                  Rarity Score
                </p>
                <p className="text-2xl font-black text-white">
                  {rarity ? `${rarity}%` : '...'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-white/70">
                  Soul Drink
                </p>
                <p className="text-sm font-bold text-white">
                  Personality Test
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-4 px-4 pb-8" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
        <button 
          onClick={() => window.location.reload()}
          className="apple-btn flex-1 bg-white/75 backdrop-blur-lg border border-yellow-200/50 text-amber-950 flex items-center justify-center gap-2 hover:bg-white cursor-pointer"
        >
          เริ่มใหม่
        </button>
        <button 
          onClick={handleSaveImage}
          disabled={isSaving}
          className="apple-btn flex-[2] bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-950 shadow-md shadow-yellow-500/20 hover:shadow-yellow-500/40 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
        >
          {isSaving ? (
             <span className="animate-pulse">กำลังบันทึก...</span>
          ) : (
            <>
              <Download size={20} />
              บันทึกรูปภาพ
            </>
          )}
        </button>
      </div>
    </div>
  );
}
