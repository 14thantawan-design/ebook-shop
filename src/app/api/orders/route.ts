import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { INITIAL_BOOKS } from '@/data/mockBooks';
import { generateMockOrderId, saveOrderToStore } from '@/lib/orderStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookId, customerName, customerEmail } = body;

    if (!bookId || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน (bookId, customerName, customerEmail)' },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { error: 'รูปแบบอีเมลไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // Find book to get price and title
    let book = INITIAL_BOOKS.find((b) => b.id === bookId);
    if (!book && isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('books').select('*').eq('id', bookId).single();
      if (data) book = data;
    }

    if (!book) {
      return NextResponse.json({ error: 'ไม่พบหนังสือที่เลือก' }, { status: 404 });
    }

    const orderAmount = book.price;

    // Insert into Supabase if configured
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            book_id: book.id,
            customer_name: customerName.trim(),
            customer_email: customerEmail.trim().toLowerCase(),
            amount: orderAmount,
            status: 'PENDING',
          },
        ])
        .select('*, book:books(*)')
        .single();

      if (error) {
        console.error('Supabase create order error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, order: data });
    }

    // Fallback Mock Order Generation for offline/local test
    const mockOrderId = generateMockOrderId(book.id);
    const mockOrder = {
      id: mockOrderId,
      book_id: book.id,
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim().toLowerCase(),
      amount: orderAmount,
      status: 'PENDING' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      book: book,
    };

    saveOrderToStore(mockOrder);

    return NextResponse.json({ success: true, order: mockOrder, mocked: true });
  } catch (err: any) {
    console.error('Order API error:', err);
    return NextResponse.json({ error: err.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 });
  }
}
