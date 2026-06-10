import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Code, Server, Terminal, Sparkles, AlertCircle } from 'lucide-react'

interface Option {
  text: string
  scores: Record<string, number | undefined>
}

interface Question {
  id: number
  text: string
  options: Option[]
}

interface QuestionCardProps {
  question: Question
  questionNumber: number
  onSelect: (optionIdx: number) => void
}

export default function QuestionCard({ question, questionNumber, onSelect }: QuestionCardProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  const handleOptionTap = (idx: number) => {
    if (selectedIdx !== null) return // Prevent duplicate taps
    setSelectedIdx(idx)
    
    // Auto-advance after 400ms for tactile feedback
    setTimeout(() => {
      onSelect(idx)
      setSelectedIdx(null) // Reset for next question
    }, 450)
  }

  // Letters to assign to options
  const optionLetters = ['A', 'B', 'C', 'D']

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      className="w-full flex flex-col gap-6 px-6"
    >
      {/* Question Text Card */}
      <div className="w-full glass rounded-3xl p-6 relative overflow-hidden shadow-xl border border-zinc-700/30">
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
        
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 font-mono text-xs font-bold border border-purple-500/20 mb-4">
          {questionNumber}
        </span>
        
        <h2 className="text-xl font-bold tracking-tight text-white leading-snug">
          {question.text}
        </h2>
      </div>

      {/* Options Stack */}
      <div className="flex flex-col gap-3.5">
        {question.options.map((option, idx) => {
          const isSelected = selectedIdx === idx
          const isAnySelected = selectedIdx !== null
          
          return (
            <motion.button
              key={idx}
              disabled={isAnySelected}
              onClick={() => handleOptionTap(idx)}
              whileHover={isAnySelected ? {} : { scale: 1.015, y: -1 }}
              whileTap={isAnySelected ? {} : { scale: 0.98 }}
              className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 relative overflow-hidden select-none outline-none ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_20px_-3px_rgba(16,185,129,0.3)]'
                  : isAnySelected
                  ? 'border-zinc-800 bg-zinc-900/30 text-zinc-500 opacity-60'
                  : 'border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-800/60 hover:border-zinc-700 text-zinc-300'
              }`}
            >
              {/* Tactical background highlight pulse */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 bg-emerald-500/5"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 2, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />
              )}

              {/* Option Letter Bubble */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold border transition-colors duration-300 shrink-0 ${
                  isSelected
                    ? 'bg-emerald-500 text-white border-emerald-400'
                    : isAnySelected
                    ? 'bg-zinc-900 text-zinc-600 border-zinc-800'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700/50'
                }`}
              >
                {optionLetters[idx]}
              </div>

              {/* Option Text */}
              <span className="text-[15px] font-medium leading-relaxed">
                {option.text}
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
