export type Axis = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

export interface Option {
  text: string;
  axis: Axis;
  weight: number;
}

export interface Question {
  id: number;
  text: string;
  options: Option[];
}

export const questions: Question[] = [
  {
    id: 1,
    text: "เวลาเดินเข้าร้านกาแฟที่คุ้นเคย คุณมักจะสั่ง...",
    options: [
      { text: "เมนูประจำ อร่อยชัวร์ไม่ต้องคิดเยอะ (เช่น อเมริกาโน่/เอสเปรสโซ่)", axis: "S", weight: 1 },
      { text: "ขอลองเมนู Seasonal หรืออะไรแปลกใหม่ดูบ้าง", axis: "N", weight: 1 }
    ]
  },
  {
    id: 2,
    text: "วันหยุดยาว ถ้าไม่ได้ไปเที่ยว คุณจะทำอะไร?",
    options: [
      { text: "จัดห้อง เคลียร์คิว เตรียมความพร้อมสำหรับวีคถัดไป", axis: "J", weight: 1 },
      { text: "นอนไถฟีด ปล่อยจอย ค่อยคิดหน้างานว่าจะทำอะไร", axis: "P", weight: 1 }
    ]
  },
  {
    id: 3,
    text: "เวลาเพื่อนทักมาบ่นเรื่องงาน คุณจะตอบสนองแบบไหน?",
    options: [
      { text: "วิเคราะห์ปัญหาและแนะนำวิธีแก้ไปตรงๆ", axis: "T", weight: 1 },
      { text: "รับฟัง ให้กำลังใจ และบอกว่า 'ไม่เป็นไรนะ แกทำดีที่สุดแล้ว'", axis: "F", weight: 1 }
    ]
  },
  {
    id: 4,
    text: "ถ้าต้องเลือกบรรยากาศร้านนั่งชิล คุณชอบแบบไหน?",
    options: [
      { text: "ร้านไวบ์สนุก เพลงตื๊ดหน่อย เจอคนเยอะๆ", axis: "E", weight: 1 },
      { text: "ร้านสไตล์โฮมมี่ เพลงเบาๆ นั่งคุยกับเพื่อนสนิทไม่กี่คน", axis: "I", weight: 1 }
    ]
  },
  {
    id: 5,
    text: "เวลาเจอเมนูที่เขียนอธิบายซับซ้อนมากๆ คุณจะ...",
    options: [
      { text: "อ่านส่วนผสมทีละตัวว่ามีอะไรบ้าง แล้วค่อยตัดสินใจ", axis: "S", weight: 1 },
      { text: "จินตนาการรสชาติจากชื่อเมนู ถ้ารู้สึกว้าวก็สั่งเลย", axis: "N", weight: 1 }
    ]
  },
  {
    id: 6,
    text: "ถ้าเพื่อนจู่ๆ ชวนไปเที่ยวคาเฟ่เปิดใหม่ตอนนี้เลย...",
    options: [
      { text: "ไปสิ! เปลี่ยนชุดแปปนึง ออกเลย!", axis: "P", weight: 1 },
      { text: "ขอเช็คตารางก่อน วันนี้มีแพลนทำอย่างอื่นไว้หรือเปล่า", axis: "J", weight: 1 }
    ]
  },
  {
    id: 7,
    text: "เวลาเลือกร้านอาหารสำหรับนัดบอด คุณให้ความสำคัญกับอะไร?",
    options: [
      { text: "รีวิวคะแนนความอร่อยและความคุ้มค่า", axis: "T", weight: 1 },
      { text: "บรรยากาศดี ถ่ายรูปสวย ให้ความรู้สึกโรแมนติก", axis: "F", weight: 1 }
    ]
  },
  {
    id: 8,
    text: "ตอนรอเครื่องดื่มที่บาร์ คุณมักจะ...",
    options: [
      { text: "ชวนบาริสต้าคุย หรือทักทายคนรอบๆ", axis: "E", weight: 1 },
      { text: "หยิบมือถือมาเล่น หรือมองนู่นนี่เงียบๆ", axis: "I", weight: 1 }
    ]
  }
];

export const calculateResult = (scores: Record<Axis, number>) => {
  const EorI = scores.E > scores.I ? 'E' : 'I';
  const SorN = scores.S > scores.N ? 'S' : 'N';
  const TorF = scores.T > scores.F ? 'T' : 'F';
  const JorP = scores.J > scores.P ? 'J' : 'P';
  
  const mbti = `${EorI}${SorN}${TorF}${JorP}`;

  // Simplify result mappings into 4 archetypes for this demo
  if (['INTJ', 'ISTP', 'INTP', 'ISTJ'].includes(mbti)) {
    return {
      id: "The_Espresso_Banana",
      name: "Espresso Banana Latte",
      mbti,
      description: "สายเข้มแต่แฝงความน่ารัก เด็ดขาด ลุยงานเงียบๆ มีเหตุผลสูง แต่ก็ชอบความหอมหวานของกล้วยหอมทองเพื่อชาร์จพลัง!",
      image: "/banana_espresso.png",
      color: "from-[#4a2c11] to-[#f4c430]",
      text: "text-white"
    };
  }
  
  if (['INFP', 'ISFJ', 'INFJ', 'ISFP'].includes(mbti)) {
    return {
      id: "The_Matcha_Banana",
      name: "Matcha Banana Cloud",
      mbti,
      description: "สายละมุน โลกส่วนตัวสูง อ่อนโยน เข้าอกเข้าใจผู้อื่น เหมือนมัทฉะแท้เข้มข้นที่ผสมผสานความนุ่มละมุนของกล้วยปั่นได้อย่างลงตัว",
      image: "/banana_matcha.png",
      color: "from-[#2d5a27] to-[#e4d96f]",
      text: "text-white"
    };
  }

  if (['ENFJ', 'ESFP', 'ENFP', 'ESFJ'].includes(mbti)) {
    return {
      id: "The_Tropical_Banana",
      name: "Tropical Mango Banana",
      mbti,
      description: "สายร่าเริง พลังงานล้นเหลือ รสชาติเปรี้ยวอมหวานของมะม่วงและกล้วยหอมที่ใครกินก็ต้องยิ้มและอยากปาร์ตี้ต่อทันที!",
      image: "/banana_tropical.png",
      color: "from-[#ff6b6b] to-[#fbc531]",
      text: "text-white"
    };
  }

  // ENTP, ESTJ, ENTJ, ESTP
  return {
    id: "The_Sesame_Banana",
    name: "Sesame Banana Charcoal",
    mbti,
    description: "สายครีเอทีฟสุดล้ำ มีความเท่ มีสไตล์ชัดเจน ท้าทายสิ่งเดิมๆ ด้วยความลงตัวของงาดำคั่วหอมๆ และกล้วยหอมสุดชิค",
    image: "/banana_sesame.png",
    color: "from-[#2f3640] to-[#fbc531]",
    text: "text-white"
  };
};
