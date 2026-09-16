import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { INITIAL_BOOKS } from '@/data/mockBooks';
import { getOrderFromStore, resolveBookForOrder } from '@/lib/orderStore';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { searchParams } = new URL(request.url);
    const emailVerify = searchParams.get('email')?.trim().toLowerCase();

    if (!orderId) {
      return NextResponse.json({ error: 'ไม่พบรหัสคำสั่งซื้อ' }, { status: 400 });
    }

    // Supabase retrieval
    if (isSupabaseAdminConfigured && supabaseAdmin) {
      let query = supabaseAdmin
        .from('orders')
        .select('*, book:books(*)')
        .eq('id', orderId);

      const { data: order, error } = await query.single();

      if (error || !order) {
        return NextResponse.json({ error: 'ไม่พบคำสั่งซื้อนี้ในระบบ' }, { status: 404 });
      }

      // Security Check: If emailVerify is specified or required for tracking lookup
      if (emailVerify && order.customer_email.toLowerCase() !== emailVerify) {
        return NextResponse.json(
          { error: 'อีเมลไม่ตรงกับคำสั่งซื้อนี้ เพื่อความปลอดภัยจึงไม่สามารถแสดงข้อมูลได้' },
          { status: 403 }
        );
      }

      // If status is PAID, generate signed URL
      let downloadUrl = null;
      if (order.status === 'PAID' && order.book?.file_path) {
        const { data: signedData } = await supabaseAdmin.storage
          .from('ebooks')
          .createSignedUrl(order.book.file_path, 3600);

        if (signedData) {
          downloadUrl = signedData.signedUrl;
        } else {
          downloadUrl = `/api/download/sample?bookId=${order.book_id || order.book?.id}&orderId=${orderId}`;
        }
      }

      return NextResponse.json({
        success: true,
        order,
        downloadUrl,
      });
    }

    // Mock response for testing
    const existingOrder = getOrderFromStore(orderId);
    const bookIdParam = searchParams.get('bookId');
    const resolvedBook = resolveBookForOrder(
      orderId,
      bookIdParam || existingOrder?.book_id || existingOrder?.book?.id,
      existingOrder?.book?.title
    );

    // Security Check: If emailVerify is provided, ensure it matches
    if (emailVerify && existingOrder && existingOrder.customer_email.toLowerCase() !== emailVerify) {
      return NextResponse.json(
        { error: 'อีเมลไม่ตรงกับคำสั่งซื้อนี้ เพื่อความปลอดภัยจึงไม่สามารถแสดงข้อมูลได้' },
        { status: 403 }
      );
    }

    const orderStatus = existingOrder ? existingOrder.status : (emailVerify ? 'PAID' : 'PENDING');
    const orderData = existingOrder || {
      id: orderId,
      book_id: resolvedBook.id,
      customer_name: 'ผู้สั่งซื้อ',
      customer_email: emailVerify || '14thantawan@gmail.com',
      amount: resolvedBook.price,
      status: orderStatus,
      book: resolvedBook,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const downloadUrl = orderData.status === 'PAID'
      ? `/api/download/sample?bookId=${resolvedBook.id}&orderId=${orderId}`
      : null;

    return NextResponse.json({
      success: true,
      mocked: true,
      order: orderData,
      downloadUrl,
    });
  } catch (err: any) {
    console.error('Fetch order error:', err);
    return NextResponse.json({ error: err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 });
  }
}
