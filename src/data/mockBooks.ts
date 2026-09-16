import { Book } from '@/types';

export const INITIAL_BOOKS: Book[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'คู่มือพัฒนา Media Player PRO (Python PyQt6)',
    author: 'ผลงานจากใบงานที่ 1 (Selected Topics)',
    description: 'คู่มือการพัฒนาแอปพลิเคชันเล่นเพลงระดับมืออาชีพ ด้วย Python, PyQt6 และ PyInstaller พร้อมฟังก์ชัน Playlist, Seek Bar, Volume Control และการจัดการข้อผิดพลาด',
    price: 199,
    cover_image: '/covers/cover-lab1.png',
    file_path: 'ebook-lab1.pdf'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'คู่มือพัฒนา Tarot App สุ่มไพ่ 3 ใบ + BGM',
    author: 'ผลงานจากใบงานที่ 2 (Selected Topics)',
    description: 'คู่มือพัฒนาแอปทำนายไพ่ทาโรต์ 3 ใบ Past / Present / Future แบบไม่ซ้ำกัน พร้อมระบบเพลงประกอบ BGM ต่อเนื่อง และกลไก Fallback ป้องกันโปรแกรม Crash',
    price: 250,
    cover_image: '/covers/cover-lab2.png',
    file_path: 'ebook-lab2.pdf'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    title: 'คู่มือพัฒนา SQLite Task Manager PRO',
    author: 'ผลงานจากใบงานที่ 3 (Selected Topics)',
    description: 'คู่มือพัฒนาระบบบริหารจัดการงานและฐานข้อมูล SQLite รองรับระบบ Login ปลอดภัย, Dashboard สถิติแบบเรียลไทม์, ถังขยะกู้คืน และการ Export/Import CSV',
    price: 299,
    cover_image: '/covers/cover-lab3.png',
    file_path: 'ebook-lab3.pdf'
  }
];
