'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { questions, calculateResult } from '../../soul-drink/data/questions';
import type { Option, Axis } from '../../soul-drink/data/questions';
import QuestionCard from '../../soul-drink/components/QuestionCard';
import ResultCard from '../../soul-drink/components/ResultCard';

type GameState = 'START' | 'PLAYING' | 'RESULT';
type Scores = Record<Axis, number>;

const initialScores: Scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

export default function SoulDrinkRoot() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Scores>(initialScores);
  const [resultData, setResultData] = useState<any>(null);
  const [rarity, setRarity] = useState<number | undefined>(undefined);

  const startGame = () => {
    setGameState('PLAYING');
    setCurrentIndex(0);
    setScores(initialScores);
  };

  const handleAnswer = (option: Option) => {
    // 1. Accumulate Score
    const newScores = {
      ...scores,
      [option.axis]: scores[option.axis] + option.weight
    };
    setScores(newScores);

    // 2. Advance to next or finish
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishGame(newScores);
    }
  };

  const finishGame = async (finalScores: Scores) => {
    const res = calculateResult(finalScores);
    setResultData(res);
    setGameState('RESULT');

    // Call backend API to record stat
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const response = await fetch(`${API_URL}/api/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result_id: res.id })
      });

      if (response.ok) {
        await response.json();
        // Mock rarity between 5-15%
        setRarity(Math.floor(Math.random() * 10) + 5);
      }
    } catch (err) {
      console.error("API Call failed (which is normal if backend isn't running yet):", err);
      // Fallback rarity
      setRarity(12);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-100/50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">

      {/* Decorative Blur Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-yellow-300/20 blur-[80px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-300/20 blur-[100px] pointer-events-none" />

      <main className="w-full relative z-10 flex flex-col items-center">
        <AnimatePresence mode="wait">

          {gameState === 'START' && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card max-w-sm w-full p-8 text-center flex flex-col items-center border-yellow-200/50"
            >
              <div className="relative mb-6 animate-float">
                <img
                  src="/nanobanana_mascot.png"
                  alt="NanoBanana Mascot"
                  className="w-48 h-48 object-contain drop-shadow-xl"
                />
              </div>
              <h1 className="text-3xl font-extrabold mb-1 tracking-tight text-amber-950 font-sans">Soul Drink</h1>
              <h2 className="text-sm font-bold text-amber-600 mb-4 tracking-wider uppercase">by NanoBanana 🍌</h2>
              <p className="text-gray-600 mb-8 font-medium text-sm leading-relaxed">
                เครื่องดื่มแก้วโปรดบอก Vibe ในตัวคุณ<br />
                มาค้นหากันว่าตัวตนจริงๆ ของคุณคือเมนูกล้วยปั่นรสชาติไหน?
              </p>
              <button
                onClick={startGame}
                className="banana-btn w-full text-lg animate-glow"
              >
                เริ่มค้นหาเลย ✨
              </button>
              <Link
                href="/"
                className="mt-4 text-sm text-amber-700/60 hover:text-amber-700 transition-colors"
              >
                ← กลับหน้าหลัก
              </Link>
            </motion.div>
          )}

          {gameState === 'PLAYING' && (
            <QuestionCard
              key={currentIndex}
              question={questions[currentIndex]}
              onAnswer={handleAnswer}
              currentIndex={currentIndex}
              totalQuestions={questions.length}
            />
          )}

          {gameState === 'RESULT' && resultData && (
            <ResultCard key="result" result={resultData} rarity={rarity} />
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
