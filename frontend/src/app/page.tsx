'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { m } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

export default function HubPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-between px-6 pt-16 pb-24 md:py-16 relative overflow-hidden"
      style={{ backgroundColor: 'var(--audit-bg, #09090b)' }}
    >
      {/* Background glow blobs (placed safely at low z-index) */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/2 left-10 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Header Section */}
      <header className="mb-12 text-center z-10 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 backdrop-blur-md mb-4 hover:border-yellow-500/40 transition-all duration-300">
          <span className="text-sm animate-bounce">🍌</span>
          <span className="text-xs font-black tracking-[0.3em] text-zinc-100 font-mono uppercase">
            NanoBanana Lab
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          เลือกเกมที่ใช่
        </h1>
        <p className="text-zinc-200 text-base mt-4 leading-relaxed max-w-sm mx-auto">
          สามเกมสุดแหวกแนว ค้นหาบุคลิก ความคิด และวิญญาณในตัวคุณ
        </p>
      </header>

      {/* Cards Grid (conforms to 24px gap/spacing) */}
      <m.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl z-10 px-2 my-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Card 1 — Dev Persona */}
        <m.div
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4 hover:border-purple-500/50 transition-all duration-300 shadow-xl shadow-black/40 relative"
          style={{ boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), 0 0 35px -5px rgba(168, 85, 247, 0.1)' }}
        >
          {/* Header row with avatar, badge and progress index (Wayfinding) */}
          <div className="flex gap-4 items-center justify-between">
            <div className="flex gap-3 items-center">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-md shrink-0 relative">
                <Image
                  src="/dev_persona_mascot.jpg"
                  alt="Dev Persona Mascot"
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-mono font-bold tracking-widest text-purple-400 uppercase">
                  GAME 01
                </span>
                <h2 className="text-lg font-black text-white tracking-wide leading-tight">
                  Dev Persona
                </h2>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-zinc-500 px-2 py-0.5 bg-zinc-900 border border-zinc-800/80 rounded-md">
              1 / 3
            </span>
          </div>

          {/* Body Description (High contrast, truncated at 2 lines) */}
          <p className="text-zinc-300 text-sm leading-relaxed min-h-[40px] line-clamp-2 font-medium">
            แบบทดสอบแฉกลยุทธ์พังๆ ที่คุณใช้หลอกตัวเองทุกวัน ค้นหาบุคลิก dev ของคุณใน 8 คำถาม 💻
          </p>

          {/* Primary CTA (Single brand Yellow style across all cards, 44px target) */}
          <div className="mt-auto pt-2">
            <Link
              href="/dev-persona"
              className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all duration-300 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 shadow-md shadow-yellow-500/10 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              เริ่มทำแบบทดสอบ →
            </Link>
          </div>
        </m.div>

        {/* Card 2 — Soul Drink */}
        <m.div
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4 hover:border-yellow-500/50 transition-all duration-300 shadow-xl shadow-black/40 relative"
          style={{ boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), 0 0 35px -5px rgba(234, 179, 8, 0.1)' }}
        >
          {/* Header row with avatar, badge and progress index (Wayfinding) */}
          <div className="flex gap-4 items-center justify-between">
            <div className="flex gap-3 items-center">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-md shrink-0 relative">
                <Image
                  src="/soul_drink_mascot.jpg"
                  alt="Soul Drink Mascot"
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-mono font-bold tracking-widest text-yellow-400 uppercase">
                  GAME 02
                </span>
                <h2 className="text-lg font-black text-white tracking-wide leading-tight">
                  Soul Drink
                </h2>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-zinc-500 px-2 py-0.5 bg-zinc-900 border border-zinc-800/80 rounded-md">
              2 / 3
            </span>
          </div>

          {/* Body Description (High contrast, truncated at 2 lines) */}
          <p className="text-zinc-300 text-sm leading-relaxed min-h-[40px] line-clamp-2 font-medium">
            เครื่องดื่มบอกวิญญาณ ตอบคำถามแล้วค้นพบว่าคุณเป็น กาแฟ ชา หรือน้ำผลไม้ 🍌
          </p>

          {/* Primary CTA (Single brand Yellow style across all cards, 44px target) */}
          <div className="mt-auto pt-2">
            <Link
              href="/soul-drink"
              className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all duration-300 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 shadow-md shadow-yellow-500/10 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              ค้นหาเครื่องดื่ม →
            </Link>
          </div>
        </m.div>

        {/* Card 3 — Audit */}
        <m.div
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4 hover:border-red-500/50 transition-all duration-300 shadow-xl shadow-black/40 relative z-10"
          style={{ boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), 0 0 35px -5px rgba(239, 68, 68, 0.1)' }}
        >
          {/* Header row with avatar, badge and progress index (Wayfinding) */}
          <div className="flex gap-4 items-center justify-between">
            <div className="flex gap-3 items-center">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-md shrink-0 relative">
                <Image
                  src="/audit_mascot.jpg"
                  alt="Audit Mascot"
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-mono font-bold tracking-widest text-red-400 uppercase">
                  GAME 03
                </span>
                <h2 className="text-lg font-black text-white tracking-wide leading-tight">
                  The Audit
                </h2>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-zinc-500 px-2 py-0.5 bg-zinc-900 border border-zinc-800/80 rounded-md">
              3 / 3
            </span>
          </div>

          {/* Body Description (High contrast, truncated at 2 lines) */}
          <p className="text-zinc-300 text-sm leading-relaxed min-h-[40px] line-clamp-2 font-medium">
            พิจารณาหลักฐาน ตัดสินความผิด และพิสูจน์ว่าคุณ อ่านคนออกหรือโดนหลอกง่าย ⚖️
          </p>

          {/* Primary CTA (Single brand Yellow style across all cards, 44px target) */}
          <div className="mt-auto pt-2">
            <Link
              href="/audit"
              className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all duration-300 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 shadow-md shadow-yellow-500/10 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              เข้าสู่ห้องพิจารณา →
            </Link>
          </div>
        </m.div>
      </m.div>

      {/* Footer Section */}
      <footer className="mt-12 z-10 text-center flex flex-col gap-2 pb-8">
        <div className="flex items-center justify-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors duration-200">
          <span className="text-sm">⚡</span>
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase">
            MADE WITH ❤️ BY NANOBANANA LAB
          </p>
        </div>
      </footer>
    </main>
  )
}

