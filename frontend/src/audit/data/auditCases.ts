import type { AuditCase } from '../types';

/**
 * All 8 investigation cases for the Self-Deception Audit.
 *
 * Rules enforced per case:
 *  - Exactly 4 evidences
 *  - Each evidence maps to exactly 1 MainArchetypeId
 *  - Evidence text ≤ 60 Thai characters
 *  - At least 3 distinct archetypes covered per case
 *  - Scenarios follow a morning-to-end-of-day arc (Cases 1–8)
 */
export const auditCases: AuditCase[] = [
  // ── Case 1: Morning alarm / waking up ────────────────────────────────────
  {
    id: 1,
    text: 'ตื่นนอนตอนเช้า นาฬิกาปลุกดังเป็นครั้งที่สาม คุณ...',
    evidences: [
      {
        id: 'c1_e1',
        text: 'กด snooze ไปเรื่อยๆ เดี๋ยวพรุ่งนี้ตื่นเร็วแทน',
        archetype: 'ETERNAL_OPTIMIST',
      },
      {
        id: 'c1_e2',
        text: 'วางแผนไว้แล้วว่าจะลุกตอน 6 แต่ขอแค่อีก 5 นาที',
        archetype: 'STRATEGIC_PROCRASTINATOR',
      },
      {
        id: 'c1_e3',
        text: 'โพสต์ story "morning routine" ทั้งที่ยังนอนอยู่',
        archetype: 'PRODUCTIVITY_PERFORMER',
      },
      {
        id: 'c1_e4',
        text: 'นาฬิกาเสีย — ไม่ใช่ความผิดของฉัน',
        archetype: 'VICTIM_ARCHITECT',
      },
    ],
  },

  // ── Case 2: Breakfast / morning routine planning ─────────────────────────
  {
    id: 2,
    text: 'ถึงเวลาอาหารเช้า คุณมีแผนว่าวันนี้จะเริ่มต้นดีๆ แต่...',
    evidences: [
      {
        id: 'c2_e1',
        text: 'ข้ามมื้อเช้าไป เดี๋ยวพรุ่งนี้ค่อยเริ่ม routine ใหม่',
        archetype: 'ETERNAL_OPTIMIST',
      },
      {
        id: 'c2_e2',
        text: 'นั่งวางตารางมื้ออาหารทั้งสัปดาห์แทนที่จะกินข้าว',
        archetype: 'STRATEGIC_PROCRASTINATOR',
      },
      {
        id: 'c2_e3',
        text: 'ถ่ายรูปสมูทตี้สวยๆ แล้วไม่ได้ดื่มเพราะนั่งแก้ angle',
        archetype: 'PRODUCTIVITY_PERFORMER',
      },
      {
        id: 'c2_e4',
        text: 'ไม่มีเวลาทำอาหารเพราะคนอื่นทำให้ตื่นสาย',
        archetype: 'VICTIM_ARCHITECT',
      },
    ],
  },

  // ── Case 3: Work / study task avoidance ──────────────────────────────────
  {
    id: 3,
    text: 'มีงานสำคัญที่ต้องส่งวันนี้ คุณเปิดคอมแล้ว...',
    evidences: [
      {
        id: 'c3_e1',
        text: 'บอกตัวเองว่าจะทำได้ทันแน่นอน ยังมีเวลาอีกเยอะ',
        archetype: 'ETERNAL_OPTIMIST',
      },
      {
        id: 'c3_e2',
        text: 'เปิด notion วางโครงร่างงานละเอียดมาก แต่ไม่ลงมือเขียน',
        archetype: 'STRATEGIC_PROCRASTINATOR',
      },
      {
        id: 'c3_e3',
        text: 'เปิด tab งานทิ้งไว้แล้วไป organize desktop แทน',
        archetype: 'PRODUCTIVITY_PERFORMER',
      },
      {
        id: 'c3_e4',
        text: 'ทำไม่ได้เพราะ wifi บ้านแย่ — ระบบมันไม่เอื้อ',
        archetype: 'VICTIM_ARCHITECT',
      },
    ],
  },

  // ── Case 4: Social media / distraction ───────────────────────────────────
  {
    id: 4,
    text: 'คุณตั้งใจจะทำงานให้เสร็จ แต่มือหยิบโทรศัพท์ขึ้นมา...',
    evidences: [
      {
        id: 'c4_e1',
        text: 'เลื่อนฟีดแป๊บเดียวพอ แล้วจะกลับมาโฟกัสทันที',
        archetype: 'ETERNAL_OPTIMIST',
      },
      {
        id: 'c4_e2',
        text: 'บันทึก content ที่มีประโยชน์ไว้ดูทีหลัง — นี่คือการลงทุน',
        archetype: 'STRATEGIC_PROCRASTINATOR',
      },
      {
        id: 'c4_e3',
        text: 'โพสต์ "deep work session 🔥" แล้วใช้เวลา 20 นาทีรอยอด like',
        archetype: 'PRODUCTIVITY_PERFORMER',
      },
      {
        id: 'c4_e4',
        text: 'algorithm มันดึงดูดโดยตั้งใจ — ไม่ใช่ความผิดฉัน',
        archetype: 'ENLIGHTENED_AVOIDER',
      },
    ],
  },

  // ── Case 5: Meeting / commitment situation ────────────────────────────────
  {
    id: 5,
    text: 'มีนัดประชุมกับทีมบ่ายนี้ที่คุณลืมเตรียมสไลด์...',
    evidences: [
      {
        id: 'c5_e1',
        text: 'ทำสไลด์แบบ improvise ได้สิ พูดเก่งอยู่แล้ว',
        archetype: 'ETERNAL_OPTIMIST',
      },
      {
        id: 'c5_e2',
        text: 'นั่ง research ข้อมูลเพิ่มจนไม่มีเวลาทำสไลด์เลย',
        archetype: 'STRATEGIC_PROCRASTINATOR',
      },
      {
        id: 'c5_e3',
        text: 'ส่ง slack แจ้งว่า "กำลังสรุปข้อมูล" ทั้งที่ยังไม่ได้เปิดไฟล์',
        archetype: 'PRODUCTIVITY_PERFORMER',
      },
      {
        id: 'c5_e4',
        text: 'ไม่ได้เตรียมเพราะไม่มีใครบอกว่า agenda คืออะไร',
        archetype: 'VICTIM_ARCHITECT',
      },
    ],
  },

  // ── Case 6: Afternoon slump / energy ─────────────────────────────────────
  {
    id: 6,
    text: 'บ่ายสามโมง พลังงานดิ่ง ทำอะไรไม่ออก คุณ...',
    evidences: [
      {
        id: 'c6_e1',
        text: 'กาแฟแก้วนี้จะทำให้โฟกัสได้ทั้งคืนแน่เลย',
        archetype: 'ETERNAL_OPTIMIST',
      },
      {
        id: 'c6_e2',
        text: 'เปิด YouTube หา productivity hack สำหรับ afternoon slump',
        archetype: 'STRATEGIC_PROCRASTINATOR',
      },
      {
        id: 'c6_e3',
        text: 'กรอก time tracker ว่า "analysis" ทั้งที่กำลังนั่ง멍',
        archetype: 'PRODUCTIVITY_PERFORMER',
      },
      {
        id: 'c6_e4',
        text: 'รู้อยู่ว่าควรเดินออกกำลังกาย แต่วันนี้ขอพักก่อน',
        archetype: 'ENLIGHTENED_AVOIDER',
      },
    ],
  },

  // ── Case 7: Evening plans / promises to self ──────────────────────────────
  {
    id: 7,
    text: 'หกโมงเย็น งานยังไม่เสร็จ คุณตัดสินใจว่า...',
    evidences: [
      {
        id: 'c7_e1',
        text: 'พรุ่งนี้จะตื่นแต่เช้าแล้วทำให้เสร็จก่อนเที่ยง',
        archetype: 'ETERNAL_OPTIMIST',
      },
      {
        id: 'c7_e2',
        text: 'วางแผนตาราง sprint ใหม่สำหรับพรุ่งนี้แทนที่จะทำงานเลย',
        archetype: 'STRATEGIC_PROCRASTINATOR',
      },
      {
        id: 'c7_e3',
        text: 'โพสต์ story "overtime life 😤" เพื่อให้คนรู้ว่าทำงานหนัก',
        archetype: 'PRODUCTIVITY_PERFORMER',
      },
      {
        id: 'c7_e4',
        text: 'รู้ว่าควรนั่งทำต่อ แต่เลือกดู series แทน — พักสมองก็สำคัญ',
        archetype: 'ENLIGHTENED_AVOIDER',
      },
    ],
  },

  // ── Case 8: Bedtime reflection / end of day ───────────────────────────────
  {
    id: 8,
    text: 'ก่อนนอน คุณนึกทบทวนว่าวันนี้ทำอะไรสำเร็จบ้าง...',
    evidences: [
      {
        id: 'c8_e1',
        text: 'พรุ่งนี้จะดีกว่านี้แน่ๆ วันนี้แค่วอร์มอัพ',
        archetype: 'ETERNAL_OPTIMIST',
      },
      {
        id: 'c8_e2',
        text: 'เปิด journal เขียน goal พรุ่งนี้แทนที่จะสรุปวันนี้',
        archetype: 'STRATEGIC_PROCRASTINATOR',
      },
      {
        id: 'c8_e3',
        text: 'นับ task ที่ "ทำ" ทั้งวัน ทั้งที่ส่วนใหญ่ยังค้างอยู่',
        archetype: 'PRODUCTIVITY_PERFORMER',
      },
      {
        id: 'c8_e4',
        text: 'วันนี้ไม่ได้เรื่องเพราะสภาพแวดล้อมมันไม่เอื้อให้ทำงาน',
        archetype: 'VICTIM_ARCHITECT',
      },
    ],
  },
];
