import { Book } from '@/types';

export const INITIAL_BOOKS: Book[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'Clean Code: ศิลปะแห่งการเขียนโค้ดให้อ่านง่าย',
    author: 'Robert C. Martin (แปลไทยฉบับสรุป)',
    description: 'คู่มือระดับตำนานสำหรับโปรแกรมเมอร์ยุคใหม่ สอนหลักการเขียนโค้ดที่สะอาด เป็นระเบียบ ดูแลรักษาง่าย และลดหนี้ทางเทคนิคในระบบขนาดใหญ่',
    price: 299,
    cover_image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=600&auto=format&fit=crop&q=80',
    file_path: 'clean-code-summary.pdf'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'Vibe Coding with AI: สร้างเว็บและแอปไวในพริบตา',
    author: 'Tech Pioneer Team',
    description: 'เจาะลึกกระบวนการทำงานร่วมกับ AI ยุคใหม่ เปลี่ยนไอเดียในหัวให้กลายเป็นโปรดักต์จริงแบบ Step-by-Step โดยไม่ต้องเริ่มเขียนจากศูนย์',
    price: 350,
    cover_image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    file_path: 'vibe-coding-guide.pdf'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    title: 'Full-Stack Architecture ยุคคลาวด์',
    author: 'Dev Mastery Studio',
    description: 'เรียนรู้โครงสร้างสถาปัตยกรรม Next.js, Supabase, Serverless และ Mobile WebViewer ครบวงจรตั้งแต่เริ่มต้นพัฒนาจนถึง Production จริง',
    price: 420,
    cover_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    file_path: 'fullstack-cloud-arch.pdf'
  }
];
