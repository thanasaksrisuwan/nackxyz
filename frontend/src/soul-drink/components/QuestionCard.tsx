'use client';

import { m } from 'framer-motion';
import type { Option, Question } from '../data/questions';
import { useState } from 'react';

interface QuestionCardProps {
  question: Question;
  onAnswer: (option: Option) => void;
  currentIndex: number;
  totalQuestions: number;
}

export default function QuestionCard({ question, onAnswer, currentIndex, totalQuestions }: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleSelect = (option: Option, index: number) => {
    if (selectedOption !== null) return; // Prevent multi-clicks
    setSelectedOption(index);
    
    // Auto-advance with 400ms delay to show active state
    setTimeout(() => {
      onAnswer(option);
      setSelectedOption(null);
    }, 400);
  };

  return (
    <m.div
      key={question?.id ?? currentIndex}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5 max-w-md w-full mx-auto relative z-10 shadow-xl shadow-black/40"
      style={{ boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), 0 0 35px -5px rgba(234, 179, 8, 0.1)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold tracking-widest bg-zinc-900 text-yellow-300 border border-yellow-900/60 uppercase px-2.5 py-0.5 rounded-md w-fit">
          คำถามที่ {currentIndex + 1} / {totalQuestions}
        </span>
        <div className="flex gap-1.5">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 w-3 rounded-full transition-all duration-350 ${i <= currentIndex ? 'bg-yellow-400' : 'bg-zinc-800'}`}
            />
          ))}
        </div>
      </div>

      <h2 className="text-xl font-extrabold text-white tracking-wide leading-snug">
        {question?.text ?? "กำลังโหลดคำถาม..."}
      </h2>

      <div className="flex flex-col gap-3 mt-2" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {question?.options?.map((option, index) => (
          <m.button
            key={index}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(option, index)}
            className={`
              relative p-4 text-left rounded-xl border transition-all duration-200 cursor-pointer flex items-center min-h-[52px]
              ${selectedOption === index 
                ? 'border-yellow-400 bg-yellow-950/20' 
                : 'border-zinc-850 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700'
              }
            `}
          >
            <span className={`text-sm font-bold ${selectedOption === index ? 'text-yellow-400' : 'text-zinc-200'}`}>
              {option.text}
            </span>
            
            {/* Active Highlight Ring */}
            {selectedOption === index && (
              <m.div 
                layoutId="outline"
                className="absolute inset-0 border-2 border-yellow-400 rounded-xl pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </m.button>
        ))}
      </div>
    </m.div>
  );
}
