import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { INITIAL_BOOKS } from '@/data/mockBooks';

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
          downloadUrl = `/api/download/sample?orderId=${orderId}`;
        }
      }

      return NextResponse.json({
        success: true,
        order,
        downloadUrl,
      });
    }

    // Mock response for testing
    return NextResponse.json({
      success: true,
      mocked: true,
      order: {
        id: orderId,
        customer_name: 'ผู้ทดสอบระบบ',
        customer_email: emailVerify || 'test@example.com',
        amount: 299,
        status: 'PAID',
        book: INITIAL_BOOKS[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      downloadUrl: `/api/download/sample?orderId=${orderId}`,
    });
  } catch (err: any) {
    console.error('Fetch order error:', err);
    return NextResponse.json({ error: err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 });
  }
}
