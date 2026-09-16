'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanOrderId = orderId.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanOrderId || !cleanEmail) {
      setError('กรุณาระบุทั้งเลขที่คำสั่งซื้อและอีเมล');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/orders/${cleanOrderId}?email=${encodeURIComponent(cleanEmail)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'ไม่พบคำสั่งซื้อ หรือข้อมูลอีเมลไม่ถูกต้อง');
      }

      // Store verified order in session/local storage
      if (typeof window !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('demo_orders') || '{}');
        stored[cleanOrderId] = data.order;
        localStorage.setItem('demo_orders', JSON.stringify(stored));
      }

      router.push(`/orders/${cleanOrderId}?email=${encodeURIComponent(cleanEmail)}`);
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถค้นหาคำสั่งซื้อได้');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-blue-100 text-blue-700 rounded-2xl mb-1">
          <Search className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">ติดตามสถานะคำสั่งซื้อ</h1>
        <p className="text-sm text-slate-500">
          ค้นหาสถานะคำสั่งซื้อและรับลิงก์ดาวน์โหลด E-book ของคุณ
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>มาตรการรักษาความปลอดภัย:</strong> ต้องระบุทั้ง Order ID และอีเมลที่ใช้สั่งซื้อตรงกัน เพื่อป้องกันไม่ให้บุคคลอื่นเข้าถึงข้อมูลคำสั่งซื้อและไฟล์ของคุณ
          </span>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              เลขคำสั่งซื้อ (Order ID)
            </label>
            <input
              type="text"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="เช่น ord-xxxx-xxxx หรือ UUID"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              อีเมลที่ใช้สั่งซื้อ
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังค้นหา...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>ค้นหาคำสั่งซื้อ</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
