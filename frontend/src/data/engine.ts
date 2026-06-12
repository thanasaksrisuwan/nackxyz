import questionsData from './questions.json'

export interface ArchetypeStats {
  speed: number;       // Coding speed / velocity
  order: number;       // Code organization / neatness
  logic: number;       // Algorithmic / logical depth
  aesthetics: number;   // UI / design polish
}

export interface Archetype {
  id: string;
  title: string;
  emoji: string;
  description: string;
  quote: string;
  gradient: string;
  textColor: string;
  accentColor: string;
  stats: ArchetypeStats;
  roast: string;
  judgements?: string[];
}

export const ARCHETYPES: Record<string, Archetype> = {
  deadline_necromancer: {
    id: 'deadline_necromancer',
    title: 'Deadline Necromancer',
    emoji: '🪄',
    description: 'คุณคือผู้ชุบชีวิตโปรเจกต์จากความตายในคืนสุดท้ายก่อนเดดไลน์ สร้างไฟป่าขึ้นมาเองแล้ววิ่งไปดับไฟของตัวเองเพื่อเอาหน้า ปลุกวิญญาณโค้ดผุๆ ให้วิ่งได้ก่อนเช้าวันจันทร์',
    quote: '"เดดไลน์ไม่ใช่ขีดจำกัด แต่เป็นความเร็วต้นในการเร่งงาน"',
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    textColor: 'text-violet-200',
    accentColor: '#8b5cf6',
    stats: { speed: 99, order: 15, logic: 80, aesthetics: 40 },
    roast: 'คุณเขียนโค้ดได้เร็วเป็น 10 เท่าในเวลา 2 ชั่วโมงสุดท้าย แต่ถ้ามีเวลา 2 สัปดาห์ คุณจะนอนดูแมวในยูทูปอยู่ 13 วันกับ 22 ชั่วโมง'
  },
  emotional_support: {
    id: 'emotional_support',
    title: 'Emotional Support Human',
    emoji: '🧸',
    description: 'แบตสำรองฉุกเฉินของมนุษยชาติ ปลอบใจเพื่อนเก่งมาก ทักษะจิตวิทยาเป็นเลิศ แต่ห้องนอนและตารางงานตัวเองเละเทะจนเยียวยาไม่ได้',
    quote: '"ไม่เป็นไรนะแก บั๊กนี้ใครๆ ก็เจอกันได้ เดี๋ยวเราค่อยๆ ร้องไห้แล้วแก้ไปด้วยกัน"',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    textColor: 'text-emerald-100',
    accentColor: '#10b981',
    stats: { speed: 45, order: 20, logic: 50, aesthetics: 80 },
    roast: 'ปลอบใจคนอื่นเก่งสุดขีด แต่ห้องตัวเองซักผ้าแล้วยังไม่ได้ตากมา 3 วัน ปัญหาชีวิตรุมเร้าแต่พร้อมนั่งฟังเพื่อนบ่นเรื่องบั๊ก 4 ชั่วโมง'
  },
  dopamine_investor: {
    id: 'dopamine_investor',
    title: 'Dopamine Investor',
    emoji: '💸',
    description: 'มนุษย์ Flash Sale เดินได้ ผู้ใช้เงินเยียวยาจิตใจที่เกิดจากการดองงานของตัวเอง ซื้อคอร์สเรียน 50 คอร์ส (เรียนจบ 0) ซื้ออุปกรณ์ระดับท็อปเพื่อมาเขียนควิซตลกๆ',
    quote: '"การช็อปปิ้งคือการลงทุนรูปแบบหนึ่ง เดี๋ยวถ้าคีย์บอร์ดใหม่มาถึง งานจะเสร็จใน 5 นาที"',
    gradient: 'from-amber-400 via-orange-500 to-yellow-600',
    textColor: 'text-amber-100',
    accentColor: '#f59e0b',
    stats: { speed: 50, order: 45, logic: 55, aesthetics: 90 },
    roast: 'มีคีย์บอร์ด Custom ราคาหมื่นห้า โต๊ะคอมปรับระดับหลักหมื่น แต่เอามาเปิดส่องหน้าจอดองงานและสกรอลล์หาของใน Shopee'
  },
  productivity_tourist: {
    id: 'productivity_tourist',
    title: 'The Productivity Tourist',
    emoji: '🎒',
    description: 'นักท่องเที่ยวสาย Productivity ผู้เปลี่ยนแอปจดโน้ตและเปลี่ยนธีมหน้าจอ Notion ทุกๆ 2 วัน ดูคลิปสอนจัดเวลาชีวิต 4 ชั่วโมง แต่งานจริงคืบหน้า 0 นาที',
    quote: '"ขอเวลาอีก 2 ชั่วโมงจัดโครงสร้าง Obsidian แป๊บ คราวนี้ระบบงานจะไร้รอยต่อแน่ๆ"',
    gradient: 'from-rose-500 via-red-600 to-amber-700',
    textColor: 'text-rose-200',
    accentColor: '#ef4444',
    stats: { speed: 10, order: 90, logic: 30, aesthetics: 70 },
    roast: 'คุณมีคู่มือจัดการชีวิตที่สมบูรณ์แบบ มีระบบ GTD ลื่นไหล แต่ไม่มีผลงานชิ้นไหนถูกเขียนออกมาใช้จริงเลยสักกะอย่าง'
  },
  functional_zombie: {
    id: 'functional_zombie',
    title: 'Functional Zombie',
    emoji: '🧟',
    description: 'ถ้ากลุ่มนี้กำลังจะตาย คุณคือศพเดียวที่ยังกดส่งไฟล์ถูกเวอร์ชัน แววตาไร้วิญญาณ ไหลไปเรื่อยๆ ตามแรงโน้มถ่วงของระบบองค์กร ทำงานด้วยระบบประสาทอัตโนมัติ',
    quote: '"ครับ... ได้ครับ... กำลังทำอยู่ครับ... (พิมพ์ด้วยตาที่กึ่งปิดกึ่งเปิด)"',
    gradient: 'from-zinc-500 via-slate-600 to-neutral-800',
    textColor: 'text-zinc-200',
    accentColor: '#71717a',
    stats: { speed: 60, order: 70, logic: 60, aesthetics: 30 },
    roast: 'คุณมีชีวิตรอดด้วยคาเฟอีนและน้ำตาล แววตาไร้ประกายไฟ แต่อีเมลรายงานบั๊กและส่งไฟล์กลับไม่เคยพลาด น่ากลัวในความเสถียรแบบไร้วิญญาณ'
  },
  chaos_ceo: {
    id: 'chaos_ceo',
    title: 'Chaos CEO',
    emoji: '👑',
    description: 'บ้าอำนาจและชอบควบคุมทุกอย่าง (Control Freak) เพราะไม่เชื่อใจว่ามนุษย์หน้าไหนจะทำได้ดั่งใจ ชนทุกปัญหาและทำให้เรื่องยุ่งเหยิงฉิบหายสำเร็จได้จริงแบบปาฏิหาริย์',
    quote: '"เดี๋ยวฉันจัดการเอง หลบไป! (แล้วลงมาเขียนโค้ดสปาเก็ตตี้ที่ไม่มีใครกล้าแตะ)"',
    gradient: 'from-amber-600 via-yellow-500 to-cyan-500',
    textColor: 'text-amber-200',
    accentColor: '#d97706',
    stats: { speed: 95, order: 30, logic: 70, aesthetics: 60 },
    roast: 'คุณคือระเบิดเวลาที่แบกทีมสำเร็จแบบถูลู่ถูกัง คนอื่นกลัวคุณมากกว่าบั๊กในโค้ดเสียอีก'
  },
  accidental_genius: {
    id: 'accidental_genius',
    title: 'Accidental Genius',
    emoji: '🎲',
    description: 'ขี้เกียจวางแผน ไร้ระบบระเบียบขั้นสุด เป็นไอ้คนดวงดีที่ทำอะไรมั่วๆ หน้างาน แต่ดันเวิร์กและผลลัพธ์ออกมาเสถียรแบบไร้สาเหตุจนทุกคนหมั่นไส้',
    quote: '"เหรอ? กดยังไงก็ไม่รู้แหละ แต่อยู่ดีๆ มันก็รันผ่านแล้ว ชิลๆ"',
    gradient: 'from-purple-500 via-indigo-500 to-emerald-500',
    textColor: 'text-purple-100',
    accentColor: '#a855f7',
    stats: { speed: 85, order: 10, logic: 95, aesthetics: 40 },
    roast: 'คุณไม่ใช่คนเก่ง คุณเป็นเพียงตัวบั๊กในระบบสถิติความน่าจะเป็นที่เทพธิดาแห่งโชคลาภอุ้มไว้เท่านั้น'
  }
}

export const ROAST_MESSAGES = [
  'Inspecting your commit history...',
  'Judging your variable names...',
  'Counting linting errors...',
  'Checking your StackOverflow search logs...',
  'Analyzing your relationship with Claude/ChatGPT...',
  'Calculating your O(N) emotional stability...',
  'Detecting unused variables in your brain...',
  'Checking if you actually write tests...'
]

export const generateJudgement = (tags: string[]): string[] => {
  const sentences: string[] = []
  
  if (tags.includes('จัดระบบ')) {
    sentences.push("ศาลพิจารณาแล้วเห็นว่า จำเลยใช้เวลาไปกับการเตรียมตัวและเลือกเครื่องมือ มากกว่าเวลาลงมือทำจริงถึง 312%")
  }
  if (tags.includes('ดองงาน')) {
    sentences.push("จากหลักฐานมัดตัว จำเลยเชื่อมั่นอย่างฝังหัวว่า 'Future Me' หรือตัวเองในอนาคต เป็นยอดมนุษย์ที่เก่งกว่าปัจจุบันเสมอ")
  }
  if (tags.includes('หนีปัญหา')) {
    sentences.push("จำเลยมีพฤติกรรมเปลี่ยนคำว่า 'เดี๋ยวค่อยทำ' ให้กลายเป็น 'ทำไมกูยังไม่ทำ' ซ้ำๆ จนเข้าขั้นสันดาน")
  }
  if (tags.includes('แบกเพื่อน')) {
    sentences.push("พบหลักฐานแน่ชัดว่า จำเลยเป็นแบตสำรองฉุกเฉินระดับโลก ใจดีกับคนอื่นไปทั่วแต่ปล่อยชีวิตตัวเองไฟลุกท่วม")
  }
  if (tags.includes('ช็อปปิ้ง')) {
    sentences.push("จำเลยมักพยายามหาซื้ออุปกรณ์ไอทีราคาแพงเพื่ออ้างว่า 'ช่วยแก้ไขจิตใจและการดองงาน'")
  }
  if (tags.includes('ลนลาน')) {
    sentences.push("จำเลยมักแก้บั๊กบนโปรดักชันด้วยความตระหนกสูง โดยอัดความเร็วการพิมพ์โค้ดเหมือนนกพิราบจิกคีย์บอร์ด")
  }
  if (tags.includes('ส่งเดช')) {
    sentences.push("จำเลยมีประวัติโยนบั๊กให้เพื่อนร่วมทีมแล้วปิดคอมพาร์ทิชันนอน เพื่อรักษาความสงบสุขส่วนตน")
  }

  if (sentences.length === 0) {
    sentences.push("ศาลไม่พบคุณความดีใดๆ ในการกระทำ มีเพียงร่องรอยการขยับเมาส์ไปวันๆ เพื่อหลบหน้าหัวหน้า")
    sentences.push("จำเลยมักเลี่ยงการตอบคำถามสำคัญด้วยการพิมพ์คำว่า 'ครับ... ได้ครับ... กำลังทำอยู่ครับ'")
  }

  return sentences.slice(0, 3)
}

export function calculateResult(answers: Record<number, number>): Archetype {
  const scores: Record<string, number> = {
    deadline_necromancer: 0,
    emotional_support: 0,
    dopamine_investor: 0,
    productivity_tourist: 0,
    functional_zombie: 0
  }

  const tags: string[] = []

  // Iterate over each question answered
  Object.entries(answers).forEach(([qIdStr, optionIdx]) => {
    const qId = parseInt(qIdStr, 10)
    const question = questionsData.find(q => q.id === qId)
    if (!question) return

    const option = question.options[optionIdx]
    if (!option) return

    // Add scores from the option
    Object.entries(option.scores).forEach(([archetype, val]) => {
      if (scores[archetype] !== undefined && typeof val === 'number') {
        scores[archetype] += val
      }
    })

    // Accumulate tags if present
    const opt = option as { text: string; scores: Record<string, number | undefined>; tags?: string[] }
    if (opt.tags) {
      tags.push(...opt.tags)
    }
  })

  // 1. Check for Mythic Rare (5% drop rate)
  const isMythicChance = Math.random() < 0.05

  // 2. Check for extreme pattern (same option index selected 5 or more times)
  const selectedIndexes = Object.values(answers)
  const indexCounts: Record<number, number> = {}
  selectedIndexes.forEach(idx => {
    indexCounts[idx] = (indexCounts[idx] || 0) + 1
  })
  const isExtremePattern = Object.values(indexCounts).some(count => count >= 5)

  if (isMythicChance || isExtremePattern) {
    const mythics = ['chaos_ceo', 'accidental_genius']
    const selectedMythicId = mythics[Math.floor(Math.random() * mythics.length)]
    const archetype = { ...ARCHETYPES[selectedMythicId] }
    
    // Generate custom judgements even for mythics
    archetype.judgements = generateJudgement(tags)
    return archetype
  }

  // Find the archetype with the highest score
  let maxScore = -1
  let maxId = 'functional_zombie'

  const order = Object.keys(scores)
  order.forEach(id => {
    if (scores[id] > maxScore) {
      maxScore = scores[id]
      maxId = id
    }
  })

  const finalArchetype = { ...ARCHETYPES[maxId] }
  finalArchetype.judgements = generateJudgement(tags)

  return finalArchetype
}
