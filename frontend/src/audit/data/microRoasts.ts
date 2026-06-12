// src/audit/data/microRoasts.ts
// Micro-roast copy shown in MicroRoastModal at case 3 and case 7 checkpoints.
// Each Thai string must be ≤80 chars.
// Requirements: 4.3, 4.6

import type { MicroRoastEntry } from '../types';

export const microRoasts: MicroRoastEntry[] = [
  {
    archetype: 'ETERNAL_OPTIMIST',
    texts: ['ดีมากที่คิดบวก แต่ความจริงไม่ได้รอคุณ'],
  },
  {
    archetype: 'STRATEGIC_PROCRASTINATOR',
    texts: ['แผนสวยมาก แต่แผนไม่ใช่ action'],
  },
  {
    archetype: 'PRODUCTIVITY_PERFORMER',
    texts: ['Busy ≠ Productive — ระบบบันทึกไว้แล้ว'],
  },
  {
    archetype: 'VICTIM_ARCHITECT',
    texts: ['โชคร้ายจริงๆ ที่ทุกอย่างเป็นความผิดของคนอื่น'],
  },
  {
    archetype: 'ENLIGHTENED_AVOIDER',
    texts: ['รู้แล้ว แต่ก็ยังไม่ทำ — classic'],
  },
];
