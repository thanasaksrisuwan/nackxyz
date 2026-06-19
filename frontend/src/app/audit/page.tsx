import type { Metadata } from 'next';
import AuditGameLauncher from './AuditGameLauncher';

export const metadata: Metadata = {
  title: "Self-Deception Audit - NanoBanana Lab",
  description: "แบบทดสอบประเมินระดับการหลอกตัวเอง ค้นหาสันดานดิบในการทำงานของคุณ ⚖️",
};

export default function AuditPage() {
  return <AuditGameLauncher />;
}
