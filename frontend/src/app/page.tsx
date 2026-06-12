'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export default function HubPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden"
      style={{ backgroundColor: 'var(--audit-bg, #09090b)' }}
    >
      {/* Background glow blobs */}
      <div className="absolute top-10 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-48 h-48 bg-yellow-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="mb-12 text-center z-10">
        <p className="text-xs font-black tracking-[0.3em] text-zinc-500 font-mono uppercase mb-3">
          NanoBanana Lab
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          เลือกเกมที่ใช่
        </h1>
        <p className="text-zinc-400 text-sm mt-3 max-w-xs mx-auto">
          สามเกม สามบุคลิก เล่นเพื่อค้นหาตัวตนของคุณ
        </p>
      </header>

      {/* Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Card 1 — Dev Persona */}
        <motion.div
          variants={cardVariants}
          className="glass-premium rounded-3xl p-7 flex flex-col gap-5 neon-glow-purple"
        >
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-purple-400 uppercase">
              Game 01
            </span>
            <h2 className="text-2xl font-extrabold text-white leading-snug">
              Dev Persona Vibe
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              แบบทดสอบแฉกลยุทธ์พังๆ ที่คุณใช้หลอกตัวเองทุกวัน
              ค้นหาบุคลิก dev ของคุณใน 8 คำถาม 💻
            </p>
          </div>
          <div className="mt-auto">
            <Link
              href="/dev-persona"
              className="inline-flex items-center justify-center w-full h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-purple-500/20 hover:brightness-110 transition-all"
            >
              เริ่มทำแบบทดสอบ →
            </Link>
          </div>
        </motion.div>

        {/* Card 2 — Soul Drink */}
        <motion.div
          variants={cardVariants}
          className="glass-premium rounded-3xl p-7 flex flex-col gap-5 neon-glow-cyan"
        >
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-yellow-400 uppercase">
              Game 02
            </span>
            <h2 className="text-2xl font-extrabold text-white leading-snug">
              Soul Drink
            </h2>
          </div>

          <div className="flex justify-center">
            <Image
              src="/nanobanana_mascot.png"
              alt="NanoBanana Mascot"
              width={120}
              height={120}
              className="animate-float drop-shadow-lg"
            />
          </div>

          <p className="text-zinc-400 text-sm leading-relaxed">
            เครื่องดื่มบอกวิญญาณ ตอบคำถามแล้วค้นพบว่าคุณเป็น
            กาแฟ ชา หรือน้ำผลไม้ 🍌
          </p>

          <div className="mt-auto">
            <Link
              href="/soul-drink"
              className="banana-btn w-full text-sm"
            >
              ค้นหาเครื่องดื่มของคุณ →
            </Link>
          </div>
        </motion.div>

        {/* Card 3 — Audit */}
        <motion.div
          variants={cardVariants}
          className="glass-premium rounded-3xl p-7 flex flex-col gap-5 sm:col-span-2 lg:col-span-1"
          style={{ boxShadow: '0 0 40px -5px rgba(255, 77, 77, 0.3)' }}
        >
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-red-400 uppercase">
              Game 03
            </span>
            <h2 className="text-2xl font-extrabold text-white leading-snug">
              The Audit
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              พิจารณาหลักฐาน ตัดสินความผิด และพิสูจน์ว่าคุณ
              อ่านคนออกหรือโดนหลอกง่าย ⚖️
            </p>
          </div>
          <div className="mt-auto">
            <Link
              href="/audit"
              className="inline-flex items-center justify-center w-full h-12 rounded-2xl border border-red-500/40 text-red-300 font-bold text-sm hover:bg-red-500/10 hover:border-red-400/60 transition-all"
            >
              เข้าสู่ห้องพิจารณา →
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <footer className="mt-16 z-10">
        <p className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase">
          MADE WITH ❤️ BY NANOBANANA LAB
        </p>
      </footer>
    </main>
  )
}
