import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId') || 'unknown';

  const content = `=====================================================
ขอบคุณสำหรับการสั่งซื้อ E-book จำลอง (DEMO ONLY)
=====================================================
รหัสคำสั่งซื้อ: ${orderId}
วันที่ดาวน์โหลด: ${new Date().toLocaleString('th-TH')}

นี่คือไฟล์ตัวอย่าง E-book สำหรับส่งงานใบงาน Vibe Coding: E-book Shop
ระบบการส่งมอบไฟล์ทำงานผ่าน Temporary Signed URL จาก Supabase Private Storage
ปลอดภัยและไม่เปิดเผยไฟล์สาธารณะถาวร
=====================================================`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="ebook-demo-${orderId}.txt"`,
    },
  });
}
