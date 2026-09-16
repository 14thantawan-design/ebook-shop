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
    console.log(`[Email Mock Service] Simulated email sent to ${toEmail}:`);
    console.log(`- Order: ${orderId}`);
    console.log(`- Book: ${bookTitle}`);
    console.log(`- Download Link: ${downloadUrl}`);
    console.log(`- Expires in: ${expiresInMinutes} minutes`);
    return {
      success: true,
      mocked: true,
      message: 'Email service simulated (Resend API key not set or mock mode)',
    };
  }

  try {
    const data = await resend.emails.send({
      from: 'E-book Shop <onboarding@resend.dev>',
      to: toEmail,
      subject: `[คำสั่งซื้อสำเร็จ] ลิงก์ดาวน์โหลดหนังสือ: ${bookTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e3a8a;">ขอบคุณสำหรับการสั่งซื้อ E-book!</h2>
          <p>เรียนคุณ <strong>${customerName}</strong>,</p>
          <p>การชำระเงินสำหรับคำสั่งซื้อหมายเลข <code>${orderId}</code> ได้รับการยืนยันเรียบร้อยแล้ว</p>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0;"><strong>รายการหนังสือ:</strong> ${bookTitle}</p>
            <p style="margin: 0; color: #475569; font-size: 14px;">(ลิงก์ดาวน์โหลดมีความปลอดภัยและมีอายุการใช้งาน ${expiresInMinutes} นาที)</p>
          </div>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${downloadUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              ดาวน์โหลด E-book ตอนนี้
            </a>
          </p>
          <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            * หมายเหตุ: นี่เป็นระบบทดสอบจำลอง (DEMO ONLY) ตามใบงาน Vibe Coding
          </p>
        </div>
      `,
    });
    return { success: true, mocked: false, data };
  } catch (error: any) {
    console.error('Error sending email via Resend:', error);
    return { success: false, error: error.message };
  }
}
