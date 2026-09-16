'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldAlert, Loader2, BookOpen } from 'lucide-react';
import { Book } from '@/types';
import { INITIAL_BOOKS } from '@/data/mockBooks';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookIdParam = searchParams.get('bookId');

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Find book by ID or default to first book
    const found = INITIAL_BOOKS.find((b) => b.id === bookIdParam) || INITIAL_BOOKS[0];
    setSelectedBook(found);
  }, [bookIdParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: selectedBook.id,
          customerName,
          customerEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'ไม่สามารถสร้างคำสั่งซื้อได้');
      }

      // Store in localStorage for instant retrieval during offline demo mode
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('demo_orders') || '{}');
        existing[data.order.id] = data.order;
        localStorage.setItem('demo_orders', JSON.stringify(existing));
      }

      // Redirect to mock payment page with explicit bookId
      router.push(`/payment/${data.order.id}?bookId=${selectedBook.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      setLoading(false);
    }
  };

  if (!selectedBook) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="text-slate-500">กำลังโหลดข้อมูลคำสั่งซื้อ...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>กลับไปเลือกหนังสือเล่มอื่น</span>
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            สั่งซื้อ E-book (Checkout)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            กรอกข้อมูลผู้รับและตรวจสอบรายละเอียดก่อนเข้าสู่ขั้นตอนจำลองชำระเงิน
          </p>
        </div>

        {/* Selected Book Summary Box */}
        <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 flex flex-col sm:flex-row gap-4 items-start">
          <img
            src={selectedBook.cover_image}
            alt={selectedBook.title}
            className="w-20 h-28 object-cover rounded-lg shadow-sm shrink-0 border border-slate-200"
          />
          <div className="flex-1 space-y-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              หนังสือที่เลือก
            </span>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              {selectedBook.title}
            </h3>
            <p className="text-xs text-slate-500">ผู้แต่ง: {selectedBook.author}</p>
            <div className="pt-2 text-lg font-extrabold text-blue-600">
              ยอดชำระ: ฿{Number(selectedBook.price).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              ชื่อ-นามสกุล ของผู้รับ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="เช่น สมชาย ใจดี"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              อีเมลสำหรับรับลิงก์ดาวน์โหลด <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            />
            <p className="text-xs text-slate-400 mt-1">
              ระบบจะส่งลิงก์ดาวน์โหลด E-book ไปยังอีเมลนี้หลังจำลองชำระเงินสำเร็จ
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span>สถานะแรกเริ่มจะถูกบันทึกเป็น PENDING</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังสร้างคำสั่งซื้อ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ยืนยันการสั่งซื้อ → ไปหน้าชำระเงิน</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
          <span>กำลังโหลดหน้าชำระเงิน...</span>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
