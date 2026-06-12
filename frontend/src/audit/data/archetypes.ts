import type { ArchetypeId, ArchetypeDefinition } from '../types';

export const archetypes: Record<ArchetypeId, ArchetypeDefinition> = {
  ETERNAL_OPTIMIST: {
    id: 'ETERNAL_OPTIMIST',
    nameThai: 'นักฝันอมตะ',
    nameEn: 'The Eternal Optimist',
    descriptionThai: 'เชื่อว่าทุกอย่างจะดีขึ้นเอง ไม่ยอมรับความจริง',
    isSecret: false,
    cardAccentColor: '#B388FF',
  },
  STRATEGIC_PROCRASTINATOR: {
    id: 'STRATEGIC_PROCRASTINATOR',
    nameThai: 'นักผัดวันผู้ยิ่งใหญ่',
    nameEn: 'The Strategic Procrastinator',
    descriptionThai: 'มีแผนทุกอย่างแต่ไม่เคยลงมือทำ',
    isSecret: false,
    cardAccentColor: '#B388FF',
  },
  PRODUCTIVITY_PERFORMER: {
    id: 'PRODUCTIVITY_PERFORMER',
    nameThai: 'นักแสดงความขยัน',
    nameEn: 'The Productivity Performer',
    descriptionThai: 'ดูเหมือนทำงานหนักแต่ผลงานจริงคือศูนย์',
    isSecret: false,
    cardAccentColor: '#B388FF',
  },
  VICTIM_ARCHITECT: {
    id: 'VICTIM_ARCHITECT',
    nameThai: 'สถาปนิกแห่งชะตากรรม',
    nameEn: 'The Victim Architect',
    descriptionThai: 'สร้างปัญหาแล้วโทษทุกอย่างยกเว้นตัวเอง',
    isSecret: false,
    cardAccentColor: '#B388FF',
  },
  ENLIGHTENED_AVOIDER: {
    id: 'ENLIGHTENED_AVOIDER',
    nameThai: 'ผู้รู้แจ้งแห่งการหลีกหนี',
    nameEn: 'The Enlightened Avoider',
    descriptionThai: 'รู้ว่าควรทำอะไร แต่เลือกไม่ทำทุกครั้ง',
    isSecret: false,
    cardAccentColor: '#B388FF',
  },
  WALKING_CONTRADICTION: {
    id: 'WALKING_CONTRADICTION',
    nameThai: 'ความขัดแย้งที่มีชีวิต',
    nameEn: 'Walking Contradiction',
    descriptionThai: 'ระบบไม่สามารถจำแนกคุณได้ — เพราะคุณขัดแย้งในตัวเอง',
    isSecret: true,
    cardAccentColor: '#FFD700',
  },
};
