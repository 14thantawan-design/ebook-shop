import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { sendDeliveryEmail } from '@/lib/email';
import { INITIAL_BOOKS } from '@/data/mockBooks';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'ไม่พบรหัสคำสั่งซื้อ' }, { status: 400 });
    }

    let orderData: any = null;
    let bookData: any = null;

    // Check if Supabase Admin is configured
    if (isSupabaseAdminConfigured && supabaseAdmin) {
      // 1. Fetch current order
      const { data: order, error: fetchErr } = await supabaseAdmin
        .from('orders')
        .select('*, book:books(*)')
        .eq('id', orderId)
        .single();

      if (fetchErr || !order) {
        return NextResponse.json({ error: 'ไม่พบข้อมูลคำสั่งซื้อในระบบ' }, { status: 404 });
      }

      // 2. Update status to PAID
      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'PAID',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select('*, book:books(*)')
        .single();

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      orderData = updated;
      bookData = updated.book;

      // 3. Create temporary signed download link from Supabase private storage
      let downloadUrl = '';
      if (bookData?.file_path) {
        const { data: signedData, error: signErr } = await supabaseAdmin.storage
          .from('ebooks')
          .createSignedUrl(bookData.file_path, 3600); // 60 minutes expiry

        if (!signErr && signedData) {
          downloadUrl = signedData.signedUrl;
        }
      }

      // Fallback download link if signed URL not generated
      if (!downloadUrl) {
        downloadUrl = `/api/download/sample?orderId=${orderId}`;
      }

      // 4. Send delivery email
      const emailResult = await sendDeliveryEmail({
        toEmail: orderData.customer_email,
        customerName: orderData.customer_name,
        orderId: orderData.id,
        bookTitle: bookData?.title || 'E-book',
        downloadUrl: downloadUrl,
        expiresInMinutes: 60,
      });

      return NextResponse.json({
        success: true,
        order: orderData,
        downloadUrl,
        emailResult,
      });
    }

    // Mock Offline / Demo Payment handler
    const demoDownloadUrl = `/api/download/sample?orderId=${orderId}`;
    const emailResult = await sendDeliveryEmail({
      toEmail: 'customer@demo.local',
      customerName: 'Demo Customer',
      orderId,
      bookTitle: 'E-book Demo Title',
      downloadUrl: demoDownloadUrl,
      expiresInMinutes: 60,
    });

    return NextResponse.json({
      success: true,
      mocked: true,
      order: {
        id: orderId,
        status: 'PAID',
        updated_at: new Date().toISOString(),
      },
      downloadUrl: demoDownloadUrl,
      emailResult,
    });
  } catch (err: any) {
    console.error('Mock payment error:', err);
    return NextResponse.json({ error: err.message || 'เกิดข้อผิดพลาดในการจำลองการชำระเงิน' }, { status: 500 });
  }
}
