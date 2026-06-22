'use client'

import React, { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import questionsData from '../../data/questions.json'
import { calculateResult, Archetype, ROAST_MESSAGES } from '../../data/engine'
import ProgressBar from '../../components/ProgressBar'
import QuestionCard from '../../components/QuestionCard'
import ResultCard from '../../components/ResultCard'
import { Sparkles, Terminal, Zap, Code } from 'lucide-react'

import { getApiUrl } from '../../utils/api'

const API_BASE_URL = getApiUrl()

const landingVersions = [
  { title: "เรารู้ข้ออ้างที่คุณใช้หลอกตัวเอง", subtitle: "แบบทดสอบแฉกลยุทธ์พังๆ ที่คุณใช้หลอกตัวเองทุกวัน 💻" },
  { title: "เราจะเดาได้ว่าคุณจัดการชีวิตพังๆ แบบไหน", subtitle: "แฉสันดานดิบในการเอาชีวิตรอดผ่านควิซ 8 ข้อ 💻" },
  { title: "เพื่อนคุณน่าจะตอบควิซนี้แทนคุณได้แม่นกว่า", subtitle: "จริงไหมที่คนรอบตัวรู้จักข้ออ้างหลอกตัวเองของคุณดีกว่าตัวคุณเอง? กดท้าพิสูจน์! 💻" }
]

export default function Home() {
  const [isMounted, setIsMounted] = useState(false)
  const [gameState, setGameState] = useState<'hero' | 'quiz' | 'calculating' | 'result'>('hero')
  const [heroContent, setHeroContent] = useState(landingVersions[0])

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<Archetype | null>(null)
  
  // Stats loaded from API
  const [rarityPercent, setRarityPercent] = useState<number>(12.5)
  const [totalPlays, setTotalPlays] = useState<number>(1000)
  
  // Roast message animation index
  const [roastIdx, setRoastIdx] = useState(0)

  // Set mounted + randomize heroContent on client only (fix Hydration Mismatch #418)
  useEffect(() => {
    setHeroContent(landingVersions[Math.floor(Math.random() * landingVersions.length)])
    setIsMounted(true)
  }, [])

  // Rotate roast messages during calculation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    if (gameState === 'calculating') {
      interval = setInterval(() => {
        setRoastIdx(prev => (prev + 1) % ROAST_MESSAGES.length)
      }, 700)
    }
    return () => clearInterval(interval)
  }, [gameState])

  // Don't render randomized content until client has mounted (prevents SSR/CSR mismatch)
  if (!isMounted) return null

  const handleStartQuiz = () => {
    setAnswers({})
    setCurrentQuestionIdx(0)
    setGameState('quiz')
  }

  const handleAnswerSelect = (optionIdx: number) => {
    const questionId = questionsData[currentQuestionIdx].id
    const updatedAnswers = { ...answers, [questionId]: optionIdx }
    setAnswers(updatedAnswers)

    if (currentQuestionIdx < questionsData.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1)
    } else {
      // Last question answered -> Start calculation
      setGameState('calculating')
      const calculatedResult = calculateResult(updatedAnswers)
      setResult(calculatedResult)
      
      // Submit results & fetch stats in background
      submitAndFetchStats(calculatedResult.id)
    }
  }

  const submitAndFetchStats = async (archetypeId: string) => {
    try {
      // 1. Submit the user's archetype to register the count
      let currentArchetypeCount = 1
      let totalCount = 1000

      if (API_BASE_URL) {
        try {
          const submitRes = await fetch(`${API_BASE_URL}/api/results`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ archetypeId })
          })
          if (submitRes.ok) {
            const data = await submitRes.json()
            currentArchetypeCount = data.updatedCount || 1
          }

          // 2. Fetch global statistics
          const statsRes = await fetch(`${API_BASE_URL}/api/stats`)
          if (statsRes.ok) {
            const data = await statsRes.json()
            totalCount = data.totalPlays || 1000
            const stats = data.stats || {}
            currentArchetypeCount = stats[archetypeId] || currentArchetypeCount
          }
        } catch (apiErr) {
          console.warn('API error, using mock calculations:', apiErr)
        }
      }

      // Calculate real-time percentage
      // If no API config, generate a deterministic fallback based on ID
      if (!API_BASE_URL) {
        const fallbacks: Record<string, { count: number; total: number }> = {
          deadline_necromancer: { count: 85, total: 600 },
          emotional_support: { count: 120, total: 600 },
          dopamine_investor: { count: 145, total: 600 },
          productivity_tourist: { count: 74, total: 600 },
          functional_zombie: { count: 110, total: 600 },
          chaos_ceo: { count: 25, total: 600 },
          accidental_genius: { count: 30, total: 600 }
        }
        const set = fallbacks[archetypeId] || { count: 75, total: 600 }
        currentArchetypeCount = set.count
        totalCount = set.total
      }

      const calculatedPercent = Number(((currentArchetypeCount / totalCount) * 100).toFixed(1))
      setRarityPercent(calculatedPercent)
      setTotalPlays(totalCount)
    } catch (e) {
      console.error('Error calculating statistics:', e)
    } finally {
      // Ensure the calculation loader shows for at least 2.5 seconds to build suspense
      setTimeout(() => {
        setGameState('result')
      }, 2500)
    }
  }

  return (
    <main className="mobile-container flex flex-col justify-between items-center py-8 relative overflow-hidden bg-[#09090b]">
      {/* GLOW BACKGROUND BLURS */}
      <div className="absolute top-10 left-10 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER LOGO */}
      <header className="w-full flex items-center justify-center gap-2 mb-4 z-10 shrink-0">
        <Terminal className="w-5 h-5 text-purple-400" />
        <span className="text-xs font-black tracking-[0.25em] text-zinc-300 font-mono">DEV PERSONA VIBE</span>
      </header>

      {/* STATE MACHINE CONTAINER */}
      <div className="w-full flex-grow flex items-center justify-center z-10 py-4">
        <AnimatePresence mode="wait">
          {/* HERO SCREEN */}
          {gameState === 'hero' && (
            <m.div
              key="hero"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="w-full px-6 flex flex-col items-center text-center gap-7"
            >
              {/* Floating badges */}
              <div className="flex flex-wrap gap-2.5 justify-center max-w-[320px]">
                <span className="glass px-3 py-1 rounded-full text-xs font-bold text-cyan-400 border border-cyan-500/20 flex items-center gap-1 select-none">
                  <Code className="w-3.5 h-3.5" /> next.js
                </span>
                <span className="glass px-3 py-1 rounded-full text-xs font-bold text-amber-400 border border-amber-500/20 flex items-center gap-1 select-none">
                  <Zap className="w-3.5 h-3.5" /> serverless
                </span>
                <span className="glass px-3 py-1 rounded-full text-xs font-bold text-purple-400 border border-purple-500/20 flex items-center gap-1 select-none">
                  <Sparkles className="w-3.5 h-3.5" /> O(1) optimization
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight min-h-[72px] flex items-center justify-center">
                  {heroContent.title}
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-[320px] mx-auto min-h-[40px]">
                  {heroContent.subtitle}
                </p>
              </div>

              <m.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStartQuiz}
                className="w-full max-w-[280px] h-13 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-[15px] shadow-lg shadow-purple-500/20 hover:brightness-110 transition-all outline-none"
              >
                Find Your Vibe
              </m.button>
            </m.div>
          )}

          {/* QUIZ SCREEN */}
          {gameState === 'quiz' && (
            <div className="w-full flex flex-col gap-6">
              <ProgressBar current={currentQuestionIdx + 1} total={questionsData.length} />
              <AnimatePresence mode="wait">
                {(() => {
                  const question = questionsData[currentQuestionIdx];
                  if (!question) {
                    return (
                      <div key="loading-question" className="text-center py-12 text-zinc-400 font-semibold bg-zinc-900/30 backdrop-blur rounded-3xl p-8 border border-zinc-800/30 w-full">
                        ...กำลังโหลดคำถาม...
                      </div>
                    );
                  }
                  return (
                    <QuestionCard
                      key={currentQuestionIdx}
                      question={question}
                      questionNumber={currentQuestionIdx + 1}
                      onSelect={handleAnswerSelect}
                    />
                  );
                })()}
              </AnimatePresence>
            </div>
          )}

          {/* CALCULATING SCREEN */}
          {gameState === 'calculating' && (
            <m.div
              key="calculating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full px-6 flex flex-col items-center justify-center text-center gap-6"
            >
              {/* Spinning Loader */}
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-purple-400 border-r-cyan-400 animate-spin" />
              </div>

              <div className="flex flex-col gap-2.5">
                <h3 className="text-lg font-bold text-white tracking-wide">Compiling results...</h3>
                <AnimatePresence mode="wait">
                  <m.p
                    key={roastIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="text-sm font-mono text-zinc-400 italic max-w-[280px] h-10"
                  >
                    &ldquo;{ROAST_MESSAGES[roastIdx]}&rdquo;
                  </m.p>
                </AnimatePresence>
              </div>
            </m.div>
          )}

          {/* RESULT SCREEN */}
          {gameState === 'result' && result && (
            <m.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <ResultCard
                archetype={result}
                rarityPercent={rarityPercent}
                totalPlays={totalPlays}
                onRestart={handleStartQuiz}
              />
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <footer className="w-full flex flex-col items-center gap-1.5 shrink-0 z-10">
        <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
          MADE FOR DEVELOPERS WITH ❤️
        </p>
      </footer>
    </main>
  )
}
