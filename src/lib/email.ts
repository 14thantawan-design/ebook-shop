import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const isResendConfigured = Boolean(resendApiKey && !resendApiKey.includes('your_api_key'));

const resend = isResendConfigured ? new Resend(resendApiKey) : null;

interface SendDeliveryEmailProps {
  toEmail: string;
  customerName: string;
  orderId: string;
  bookTitle: string;
  downloadUrl: string;
  expiresInMinutes?: number;
}

export async function sendDeliveryEmail({
  toEmail,
  customerName,
  orderId,
  bookTitle,
  downloadUrl,
  expiresInMinutes = 60,
}: SendDeliveryEmailProps) {
  if (!resend) {
    console.log(`[Email Mock Service] Simulated email sent to ${toEmail}`);
    return {
      success: true,
      mocked: true,
      message: 'Email service simulated (Resend API key not configured)',
    };
  }

  // Ensure download URL is absolute
  const fullDownloadUrl = downloadUrl.startsWith('http')
    ? downloadUrl
    : `https://ebook-shop-xq5f.vercel.app${downloadUrl}`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 20px; border-radius: 8px; text-align: center; color: white; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 22px;">ยืนยันคำสั่งซื้อ E-book สำเร็จ</h1>
        <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">E-book Shop (Selected Topics in Computer Software)</p>
      </div>

      <p style="color: #334155; font-size: 15px;">เรียนคุณ <strong>${customerName}</strong>,</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">
        คำสั่งซื้อหมายเลข <strong style="font-family: monospace; color: #1e3a8a;">${orderId}</strong> ได้รับการยืนยันสถานะเป็น 
        <span style="background-color: #dcfce7; color: #15803d; font-weight: bold; padding: 2px 8px; border-radius: 4px;">PAID (ชำระเงินสำเร็จ)</span> เรียบร้อยแล้ว
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="margin: 0 0 8px 0; color: #0f172a; font-size: 16px;">📚 รายการหนังสือที่สั่งซื้อ:</h3>
        <p style="margin: 0; color: #2563eb; font-weight: bold; font-size: 15px;">${bookTitle}</p>
        <p style="margin: 6px 0 0 0; color: #64748B; font-size: 12px;">* ลิงก์ดาวน์โหลดมีความปลอดภัยและมีอายุจำกัด ${expiresInMinutes} นาที</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${fullDownloadUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
          📥 คลิกดาวน์โหลดไฟล์ E-book (PDF)
        </a>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; text-align: center; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0;">ระบบทดสอบร้านค้าจำลอง (DEMO ONLY) ตามใบงาน Vibe Coding: E-book Shop</p>
      </div>
    </div>
  `;

  const emailText = `ยืนยันคำสั่งซื้อ E-book สำเร็จ
เรียนคุณ ${customerName}
รหัสคำสั่งซื้อ: ${orderId} (สถานะ: PAID)
รายการหนังสือที่สั่งซื้อ: ${bookTitle}

คลิกดาวน์โหลดไฟล์ E-book (PDF):
${fullDownloadUrl}

(ลิงก์นี้มีอายุจำกัด ${expiresInMinutes} นาที)
ระบบทดสอบร้านค้าจำลอง (DEMO ONLY) ตามใบงาน Vibe Coding: E-book Shop`;

  // First, attempt sending to recipient
  try {
    const data = await resend.emails.send({
      from: 'E-book Shop <onboarding@resend.dev>',
      to: toEmail,
      subject: `[คำสั่งซื้อสำเร็จ] ลิงก์ดาวน์โหลด E-book: ${bookTitle}`,
      html: emailHtml,
      text: emailText,
    });
    return { success: true, mocked: false, data };
  } catch (err: any) {
    console.warn(`Could not send directly to ${toEmail}:`, err.message);
    // In Resend free sandbox (onboarding@resend.dev), emails can only be sent to the verified account owner:
    // If the customer entered a different email address, fallback to sending to the registered account owner
    const fallbackOwnerEmail = '14thantawan@gmail.com';
    if (toEmail.toLowerCase() !== fallbackOwnerEmail.toLowerCase()) {
      try {
        const fallbackData = await resend.emails.send({
          from: 'E-book Shop <onboarding@resend.dev>',
          to: fallbackOwnerEmail,
          subject: `[คำสั่งซื้อสำเร็จ - ส่งถึงเจ้าของบัญชี] E-book: ${bookTitle}`,
          html: emailHtml,
          text: emailText,
        });
        return {
          success: true,
          mocked: false,
          fallbackSent: true,
          data: fallbackData,
        };
      } catch (err2: any) {
        console.error('Fallback email also failed:', err2);
        return { success: false, error: err2.message };
      }
    }
    return { success: false, error: err.message };
  }
}
