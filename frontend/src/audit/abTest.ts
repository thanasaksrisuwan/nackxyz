import type { AbVariant } from './types';

const AB_KEY = 'audit_ab_variant';
const VARIANTS: AbVariant[] = ['A', 'B', 'C'];

export function getOrAssignVariant(): AbVariant {
  // Guard against SSR — localStorage is only available in the browser.
  if (typeof window === 'undefined') return 'A';
  const stored = localStorage.getItem(AB_KEY) as AbVariant | null;
  if (stored && VARIANTS.includes(stored)) return stored;
  const picked = VARIANTS[Math.floor(Math.random() * 3)];
  localStorage.setItem(AB_KEY, picked);
  return picked;
}

// Three headline variants (Thai, no "Quiz"/"Personality"/"Type"/"Result")
export const headlines: Record<AbVariant, string> = {
  A: 'คุณโกหกตัวเองเรื่องอะไรบ้าง? ระบบกำลังตรวจสอบ',
  B: 'ถึงเวลาเผชิญหน้ากับข้อแก้ตัวของคุณ',
  C: 'คณะลูกขุนดิจิทัลกำลังรอ — คุณพร้อมขึ้นให้ปากคำหรือยัง?',
};
