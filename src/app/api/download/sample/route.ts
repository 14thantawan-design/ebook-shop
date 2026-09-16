import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { INITIAL_BOOKS } from '@/data/mockBooks';
import { resolveBookForOrder } from '@/lib/orderStore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId') || 'unknown';
  const bookId = searchParams.get('bookId');
  const file = searchParams.get('file');

  // Determine which book PDF to serve accurately
  const book = resolveBookForOrder(orderId, bookId);
  const pdfFileName = file || book.file_path || 'ebook-lab1.pdf';
  const filePath = path.join(process.cwd(), 'public', 'ebooks', pdfFileName);

  if (fs.existsSync(filePath)) {
    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pdfFileName}"`,
      },
    });
  }

  // Fallback text if file not found
  const content = `=====================================================
ขอบคุณสำหรับการสั่งซื้อ E-book จำลอง (DEMO ONLY)
=====================================================
รหัสคำสั่งซื้อ: ${orderId}
หนังสือ: ${book.title}
วันที่ดาวน์โหลด: ${new Date().toLocaleString('th-TH')}
=====================================================`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="ebook-demo-${orderId}.txt"`,
    },
  });
}
