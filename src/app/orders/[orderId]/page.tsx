'use client';

import { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  Clock,
  Download,
  CreditCard,
  ArrowLeft,
  ShieldAlert,
  Loader2,
  FileText,
  Mail,
} from 'lucide-react';
import { Order } from '@/types';

function OrderDetailContent({ orderId }: { orderId: string }) {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');

  const [order, setOrder] = useState<Order | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrder() {
      try {
        let storedOrder: Order | null = null;
        if (typeof window !== 'undefined') {
          const stored = JSON.parse(localStorage.getItem('demo_orders') || '{}');
          if (stored[orderId]) {
            const foundOrder = stored[orderId] as Order;
            storedOrder = foundOrder;
            setOrder(foundOrder);
            if (foundOrder.status === 'PAID') {
              const bId = foundOrder.book_id || foundOrder.book?.id;
              setDownloadUrl(`/api/download/sample?bookId=${bId}&orderId=${orderId}`);
            }
          }
        }

        const queryUrl = emailParam
          ? `/api/orders/${orderId}?email=${encodeURIComponent(emailParam)}&bookId=${storedOrder?.book_id || ''}`
          : `/api/orders/${orderId}?bookId=${storedOrder?.book_id || ''}`;

        const res = await fetch(queryUrl);
        const data = await res.json();

        if (!res.ok || !data.success) {
          if (storedOrder) {
            setLoading(false);
            return;
          }
          throw new Error(data.error || 'ไม่พบข้อมูลคำสั่งซื้อ');
        }

        const merged: Order = {
          ...storedOrder,
          ...data.order,
          book_id: data.order.book_id || storedOrder?.book_id || storedOrder?.book?.id,
          book: data.order.book || storedOrder?.book,
        };
        setOrder(merged);

        if (merged.status === 'PAID') {
          const bId = merged.book_id || merged.book?.id;
          const dl = data.downloadUrl || `/api/download/sample?bookId=${bId}&orderId=${orderId}`;
          setDownloadUrl(dl);
        }
      } catch (err: any) {
        setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId, emailParam]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p>กำลังโหลดข้อมูลคำสั่งซื้อ...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
          <p className="font-semibold text-sm">{error || 'ไม่พบคำสั่งซื้อนี้'}</p>
        </div>
        <Link
          href="/track"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้าค้นหาคำสั่งซื้อ</span>
        </Link>
      </div>
    );
  }

  const isPaid = order.status === 'PAID';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/track"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>ค้นหาคำสั่งซื้ออื่น</span>
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div>
            <span className="text-xs text-slate-400 font-mono">ORDER ID</span>
            <h1 className="text-base sm:text-lg font-mono font-bold text-slate-900 break-all">
              {order.id}
            </h1>
          </div>

          <div className="self-start sm:self-auto">
            {isPaid ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle className="w-4 h-4" />
                <span>สถานะ: PAID (ชำระแล้ว)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                <Clock className="w-4 h-4" />
                <span>สถานะ: PENDING (รอชำระเงิน)</span>
              </span>
            )}
          </div>
        </div>

        {/* Details Table */}
        <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">ชื่อผู้สั่งซื้อ:</span>
            <span className="font-semibold text-slate-800">{order.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">อีเมล:</span>
            <span className="font-semibold text-slate-800">{order.customer_email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">หนังสือ:</span>
            <span className="font-semibold text-slate-800">
              {order.book?.title || 'E-book Digital Edition'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">วันที่สร้าง:</span>
            <span className="text-slate-600">
              {new Date(order.created_at).toLocaleString('th-TH')}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-base font-bold">
            <span className="text-slate-900">ยอดเงินรวม:</span>
            <span className="text-blue-600">฿{Number(order.amount).toFixed(2)}</span>
          </div>
        </div>

        {/* Action based on status */}
        {isPaid ? (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>คำสั่งซื้อนี้ได้รับการชำระเงินเรียบร้อยแล้ว</span>
              </div>
              <p className="text-xs text-emerald-700">
                คุณสามารถดาวน์โหลดไฟล์ E-book ได้ทันทีผ่านปุ่มด้านล่าง ลิงก์นี้มีความปลอดภัยและมีอายุจำกัด
              </p>
            </div>

            {downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลด E-book ตอนนี้ (Signed URL)</span>
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>คำสั่งซื้อนี้ยังไม่ได้ชำระเงิน</span>
              </div>
              <p className="text-xs text-amber-700">
                กรุณาเข้าสู่หน้าจำลองการชำระเงิน (Mock Payment) เพื่อทำการทดสอบระบบ
              </p>
            </div>

            <Link
              href={`/payment/${order.id}`}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              <span>ไปที่หน้าชำระเงินจำลอง (Mock Payment)</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;

  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
          <p>กำลังโหลดข้อมูลคำสั่งซื้อ...</p>
        </div>
      }
    >
      <OrderDetailContent orderId={orderId} />
    </Suspense>
  );
}
