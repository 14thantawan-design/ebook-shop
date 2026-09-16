'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  CreditCard,
  CheckCircle,
  Clock,
  ArrowRight,
  AlertTriangle,
  Loader2,
  Download,
  Mail,
} from 'lucide-react';
import { Order } from '@/types';

export default function PaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [emailStatus, setEmailStatus] = useState('');

  useEffect(() => {
    async function loadOrder() {
      try {
        // Try fetching order from API
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.order) {
            setOrder(data.order);
            if (data.order.status === 'PAID') {
              setPaidSuccess(true);
            }
            setLoading(false);
            return;
          }
        }

        // Fallback from localStorage
        if (typeof window !== 'undefined') {
          const stored = JSON.parse(localStorage.getItem('demo_orders') || '{}');
          if (stored[orderId]) {
            setOrder(stored[orderId]);
            if (stored[orderId].status === 'PAID') {
              setPaidSuccess(true);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  const handleSimulatePayment = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/payment/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerEmail: order?.customer_email,
          customerName: order?.customer_name,
          bookTitle: order?.book?.title,
          bookId: order?.book_id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการจำลองการชำระเงิน');
      }

      setPaidSuccess(true);
      if (data.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
      }

      if (data.emailResult?.mocked) {
        setEmailStatus('จำลองการส่งอีเมลสำเร็จ (โหมดทดสอบ)');
      } else {
        setEmailStatus('ส่งอีเมลยืนยันและลิงก์ดาวน์โหลดไปยังกล่องจดหมายแล้ว');
      }

      // Update in localStorage
      if (typeof window !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('demo_orders') || '{}');
        if (stored[orderId]) {
          stored[orderId].status = 'PAID';
          localStorage.setItem('demo_orders', JSON.stringify(stored));
        }
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p>กำลังตรวจสอบข้อมูลคำสั่งซื้อ...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Prominent DEMO ONLY Banner */}
      <div className="bg-red-500 text-white p-4 rounded-xl shadow-md flex items-center gap-3">
        <ShieldAlert className="w-8 h-8 shrink-0" />
        <div>
          <h2 className="font-extrabold text-base sm:text-lg tracking-wide">
            [ DEMO ONLY - หน้าจำลองการชำระเงิน ]
          </h2>
          <p className="text-xs sm:text-sm text-red-100">
            ระบบนี้เป็นงานสาธิตเพื่อการศึกษา <strong>ห้ามโอนเงินจริง</strong> และไม่มีการรับเงินจริงใดๆ ทั้งสิ้น
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs text-slate-400 font-mono">ORDER ID</span>
            <p className="font-mono font-bold text-slate-800 text-sm sm:text-base break-all">
              {orderId}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">สถานะคำสั่งซื้อ</span>
            <div className="mt-0.5">
              {paidSuccess ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  <CheckCircle className="w-3.5 h-3.5" />
                  PAID (ชำระแล้ว)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                  <Clock className="w-3.5 h-3.5" />
                  PENDING (รอชำระเงิน)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">ชื่อผู้สั่งซื้อ:</span>
            <span className="font-semibold text-slate-800">
              {order?.customer_name || 'ผู้ทดสอบระบบ'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">อีเมลผู้รับ:</span>
            <span className="font-semibold text-slate-800">
              {order?.customer_email || '-'}
            </span>
          </div>
          {order?.book && (
            <div className="flex justify-between">
              <span className="text-slate-500">หนังสือ:</span>
              <span className="font-semibold text-slate-800">{order.book.title}</span>
            </div>
          )}
          <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-base font-bold">
            <span className="text-slate-900">ยอดชำระจำลอง:</span>
            <span className="text-blue-600">
              ฿{order?.amount ? Number(order.amount).toFixed(2) : '299.00'}
            </span>
          </div>
        </div>

        {/* Payment Simulation Area */}
        {!paidSuccess ? (
          <div className="space-y-4 pt-2">
            <div className="p-4 border-2 border-dashed border-amber-300 bg-amber-50/60 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>ขั้นตอนทดสอบระบบ (Mock Payment Simulation)</span>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                คลิกปุ่มด้านล่างเพื่อจำลองว่าการชำระเงินเสร็จสิ้น
                ระบบจะทำการเปลี่ยนสถานะคำสั่งซื้อจาก <strong>PENDING</strong> เป็น{' '}
                <strong>PAID</strong> และสร้างลิงก์ดาวน์โหลดพร้อมส่งอีเมลจำลองทันที
              </p>
            </div>

            <button
              onClick={handleSimulatePayment}
              disabled={processing}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-base shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>กำลังอัปเดตสถานะเป็น PAID...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>จำลองชำระเงินสำเร็จ (Mark as PAID)</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-emerald-900">
                  จำลองการชำระเงินสำเร็จ! (สถานะ: PAID)
                </h3>
                <p className="text-xs sm:text-sm text-emerald-700 mt-1">
                  ระบบได้บันทึกสถานะคำสั่งซื้อเป็น PAID เรียบร้อยแล้ว
                </p>
              </div>

              {emailStatus && (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{emailStatus}</span>
                </div>
              )}
            </div>

            {/* Download Button */}
            {downloadUrl && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-blue-900">
                  <strong>ลิงก์ดาวน์โหลด E-book ชั่วคราว:</strong>
                  <p className="text-xs text-blue-700">มีอายุ 60 นาทีตามหลักความปลอดภัย</p>
                </div>
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลด E-book ทันที</span>
                </a>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/orders/${orderId}`}
                className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg text-center flex items-center justify-center gap-2 transition-colors"
              >
                <span>ดูรายละเอียดและติดตามคำสั่งซื้อนี้</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="py-3 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-lg text-center transition-colors"
              >
                กลับหน้าร้าน
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
