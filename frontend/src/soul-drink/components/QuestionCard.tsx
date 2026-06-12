'use client';

import { motion } from 'framer-motion';
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
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="glass-card w-full max-w-md mx-auto p-6 flex flex-col gap-6 border-yellow-100/50"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-amber-800/60 uppercase tracking-wider">
          คำถามที่ {currentIndex + 1} / {totalQuestions}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 w-4 rounded-full transition-colors duration-300 ${i <= currentIndex ? 'bg-yellow-400' : 'bg-amber-100/40'}`}
            />
          ))}
        </div>
      </div>

      <h2 className="text-2xl font-bold leading-snug text-amber-950 font-sans">
        {question.text}
      </h2>

      <div className="flex flex-col gap-3 mt-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(option, index)}
            className={`
              relative p-5 text-left rounded-2xl border-2 transition-all duration-200 cursor-pointer
              ${selectedOption === index 
                ? 'border-yellow-400 bg-yellow-50/50' 
                : 'border-transparent bg-white/50 hover:bg-white/80 hover:border-yellow-100'
              }
            `}
          >
            <span className={`text-base font-bold ${selectedOption === index ? 'text-amber-900' : 'text-gray-700'}`}>
              {option.text}
            </span>
            
            {/* Active Highlight Ring */}
            {selectedOption === index && (
              <motion.div 
                layoutId="outline"
                className="absolute inset-0 border-2 border-yellow-400 rounded-2xl pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
