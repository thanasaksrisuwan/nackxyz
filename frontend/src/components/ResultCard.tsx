import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import html2canvas from 'html2canvas'
import { ARCHETYPES, Archetype } from '../data/engine'
import { Download, RefreshCw, Share2, Award, Zap, Shield, Sparkles, Check } from 'lucide-react'
import confetti from 'canvas-confetti'

interface ResultCardProps {
  archetype: Archetype
  rarityPercent: number
  totalPlays: number
  onRestart: () => void
}

export default function ResultCard({ archetype, rarityPercent, totalPlays, onRestart }: ResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [hasCopied, setHasCopied] = useState(false)

  // Trigger confetti when ResultCard loads
  React.useEffect(() => {
    const duration = 2.5 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      // Confetti on left and right sides
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  const handleDownloadImage = async () => {
    if (!cardRef.current || isDownloading) return
    setIsDownloading(true)
    
    try {
      // Force short delay to ensure UI states are settled
      await new Promise(r => setTimeout(r, 100))
      
      const element = cardRef.current
      const canvas = await html2canvas(element, {
        scale: 2, // Double quality
        backgroundColor: '#09090b',
        useCORS: true,
        logging: false,
        allowTaint: true,
        // Match aspect ratio exactly
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      })
      
      const image = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `dev_persona_${archetype.id}.png`
      link.href = image
      link.click()
    } catch (error) {
      console.error('Failed to generate image:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = async () => {
    if (hasCopied) return
    try {
      await navigator.clipboard.writeText(
        `I got "${archetype.title}" ${archetype.emoji} (Top ${rarityPercent}% rarity) on the Dev Persona Quiz! Find your coding vibe here: ${window.location.origin}`
      )
      setHasCopied(true)
      setTimeout(() => setHasCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  return (
    <div className="w-full flex flex-col items-center gap-8 px-6 pb-12">
      {/* 9:16 ASPECT RATIO CARD CONTAINER */}
      <div className="w-full max-w-[380px] shrink-0 select-none">
        <div
          ref={cardRef}
          className={`w-full aspect-[9/16] rounded-[32px] bg-gradient-to-b ${archetype.gradient} p-6 flex flex-col justify-between text-white shadow-2xl relative overflow-hidden border border-white/10`}
          style={{ contentVisibility: 'auto' }}
        >
          {/* Neon Orb background effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          
          {/* Grid background effect */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

          {/* CARD HEADER */}
          <div className="z-10 flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-white/70 uppercase">DEV PERSONA CARD</p>
              <h3 className="text-xl font-bold tracking-tight mt-1 flex items-center gap-1.5">
                <span>{archetype.emoji}</span>
                <span>{archetype.title}</span>
              </h3>
            </div>
            <div className="glass px-2.5 py-1 rounded-full border border-white/10 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3 h-3 text-yellow-300" />
              <span>Top {rarityPercent}% Rarity</span>
            </div>
          </div>

          {/* CHARACTER QUOTE & ROAST */}
          <div className="z-10 bg-black/30 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex flex-col gap-2.5 my-4">
            <p className="text-sm font-semibold italic text-white/90 leading-relaxed">
              {archetype.quote}
            </p>
            <div className="w-full h-[1px] bg-white/10" />
            <p className="text-xs text-white/70 leading-relaxed font-mono">
              <span className="text-red-300/90 font-bold uppercase mr-1">System Roast:</span>
              {archetype.roast}
            </p>
          </div>

          {/* STATS VISUALIZATION */}
          <div className="z-10 flex flex-col gap-3">
            <p className="text-[9px] font-black tracking-[0.20em] text-white/60 uppercase">CHARACTER STATS</p>
            
            <div className="flex flex-col gap-2 bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/5">
              {/* Speed Stat */}
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-white/80 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Velocity</span>
                </span>
                <span className="font-mono font-bold text-amber-300">{archetype.stats.speed}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${archetype.stats.speed}%` }} />
              </div>

              {/* Order Stat */}
              <div className="flex items-center justify-between text-[11px] mt-1">
                <span className="font-semibold text-white/80 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span>Cleanliness</span>
                </span>
                <span className="font-mono font-bold text-emerald-300">{archetype.stats.order}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${archetype.stats.order}%` }} />
              </div>

              {/* Logic Stat */}
              <div className="flex items-center justify-between text-[11px] mt-1">
                <span className="font-semibold text-white/80 flex items-center gap-1">
                  <Award className="w-3 h-3 text-cyan-400" />
                  <span>Algorithms</span>
                </span>
                <span className="font-mono font-bold text-cyan-300">{archetype.stats.logic}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${archetype.stats.logic}%` }} />
              </div>

              {/* Aesthetics Stat */}
              <div className="flex items-center justify-between text-[11px] mt-1">
                <span className="font-semibold text-white/80 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-pink-400" />
                  <span>Aesthetics</span>
                </span>
                <span className="font-mono font-bold text-pink-300">{archetype.stats.aesthetics}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-pink-400 rounded-full" style={{ width: `${archetype.stats.aesthetics}%` }} />
              </div>
            </div>
          </div>

          {/* CARD FOOTER */}
          <div className="z-10 flex justify-between items-end mt-4 border-t border-white/10 pt-4">
            <div>
              <p className="text-[8px] text-white/50 tracking-wider">TOTAL PARTICIPANTS</p>
              <p className="text-sm font-extrabold font-mono text-white/95">{totalPlays.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-white/90 font-mono tracking-tighter">dev-persona.pages.dev</span>
            </div>
          </div>
        </div>
      </div>

      {/* SHARE & ACTION CONTROLS */}
      <div className="w-full max-w-[380px] flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownloadImage}
          disabled={isDownloading}
          className="w-full h-12 bg-white text-zinc-950 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors shadow-lg"
        >
          {isDownloading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating Image...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Save Card to Device</span>
            </>
          )}
        </motion.button>

        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className={`h-11 rounded-xl flex items-center justify-center gap-2 border font-semibold text-xs transition-colors ${
              hasCopied
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
            }`}
          >
            {hasCopied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Copy Share Link</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRestart}
            className="h-11 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retake Quiz</span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
