import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { sendDeliveryEmail } from '@/lib/email';
import { INITIAL_BOOKS } from '@/data/mockBooks';
import { resolveBookForOrder, updateOrderStatusInStore } from '@/lib/orderStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, customerEmail, customerName, bookTitle, bookId } = body;

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
        downloadUrl = `/api/download/sample?bookId=${bookData?.id || ''}&orderId=${orderId}`;
      }

      // 4. Send delivery email
      const targetEmail = orderData.customer_email || customerEmail || '14thantawan@gmail.com';
      const emailResult = await sendDeliveryEmail({
        toEmail: targetEmail,
        customerName: orderData.customer_name || customerName || 'ผู้สั่งซื้อ',
        orderId: orderData.id,
        bookTitle: bookData?.title || bookTitle || 'คู่มือพัฒนา Media Player PRO',
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
    const fallbackBook = resolveBookForOrder(orderId, bookId, bookTitle);
    const finalBookTitle = bookTitle || fallbackBook.title;
    const finalCustomerEmail = customerEmail || '14thantawan@gmail.com';
    const finalCustomerName = customerName || 'ผู้ทดสอบระบบ';
    const demoDownloadUrl = `/api/download/sample?bookId=${fallbackBook.id}&orderId=${orderId}`;

    updateOrderStatusInStore(orderId, 'PAID');

    const emailResult = await sendDeliveryEmail({
      toEmail: finalCustomerEmail,
      customerName: finalCustomerName,
      orderId,
      bookTitle: finalBookTitle,
      downloadUrl: demoDownloadUrl,
      expiresInMinutes: 60,
    });

    return NextResponse.json({
      success: true,
      mocked: true,
      order: {
        id: orderId,
        book_id: fallbackBook.id,
        status: 'PAID',
        customer_email: finalCustomerEmail,
        customer_name: finalCustomerName,
        book: fallbackBook,
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
