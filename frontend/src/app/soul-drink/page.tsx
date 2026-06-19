'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, m } from 'framer-motion';
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
  interface SoulDrinkResult { id: string; name: string; mbti: string; description: string; image: string; color: string; text: string }
  const [resultData, setResultData] = useState<SoulDrinkResult | null>(null);
  const [rarity, setRarity] = useState<number | undefined>(undefined);

  const startGame = () => {
    setGameState('PLAYING');
    setCurrentIndex(0);
    setScores(initialScores);
  };

  const handleAnswer = (option: Option) => {
    const newScores = {
      ...scores,
      [option.axis]: scores[option.axis] + option.weight
    };
    setScores(newScores);

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

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const response = await fetch(`${API_URL}/api/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result_id: res.id })
      });

      if (response.ok) {
        await response.json();
        setRarity(Math.floor(Math.random() * 10) + 5);
      }
    } catch (err) {
      console.error("API Call failed:", err);
      setRarity(12);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden relative" style={{ backgroundColor: 'var(--audit-bg, #09090b)' }}>

      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-yellow-500/5 blur-[80px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none z-0" />

      <main className="w-full relative z-10 flex flex-col items-center">
        <AnimatePresence mode="wait">

          {gameState === 'START' && (
            <m.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-6 text-center flex flex-col items-center max-w-sm w-full relative z-10 shadow-xl shadow-black/40"
              style={{ boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), 0 0 35px -5px rgba(234, 179, 8, 0.1)' }}
            >
              <div className="relative mb-6 animate-float">
                <Image
                  src="/soul_drink_mascot.jpg"
                  alt="NanoBanana Mascot"
                  width={144}
                  height={144}
                  className="w-36 h-36 object-cover rounded-2xl border border-zinc-800 shadow-md"
                />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black tracking-widest bg-zinc-900 text-yellow-300 border border-yellow-900/60 uppercase mb-3">
                GAME 02
              </span>
              <h1 className="text-2xl font-black text-white mb-2 leading-tight">Soul Drink</h1>
              <p className="text-zinc-300 mb-6 font-medium text-sm leading-relaxed px-4">
                เครื่องดื่มแก้วโปรดบอก Vibe ในตัวคุณ<br />
                ค้นหากันว่าคุณคือเมนูน้ำรสชาติไหน? 🍌
              </p>
              <button
                onClick={startGame}
                className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all duration-300 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 shadow-md shadow-yellow-500/10 hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                เริ่มค้นหาเลย ✨
              </button>
              <Link
                href="/"
                className="mt-4 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors uppercase tracking-wider"
              >
                ← กลับหน้าหลัก
              </Link>
            </m.div>
          )}

          {gameState === 'PLAYING' && (() => {
            const question = questions[currentIndex];
            if (!question) {
              return (
                <div key="loading-question" className="text-center py-12 text-zinc-400 font-semibold bg-zinc-950/80 border border-zinc-800 rounded-2xl p-8 max-w-md w-full mx-auto">
                  ...กำลังจิบข้อมูล...
                </div>
              );
            }
            return (
              <QuestionCard
                key={currentIndex}
                question={question}
                onAnswer={handleAnswer}
                currentIndex={currentIndex}
                totalQuestions={questions.length}
              />
            );
          })()}

          {gameState === 'RESULT' && resultData && (
            <ResultCard key="result" result={resultData} rarity={rarity} />
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
