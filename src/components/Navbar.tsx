'use client';

import Link from 'next/link';
import { BookOpen, Search, ShieldAlert, Smartphone } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Demo Warning Banner */}
      <div className="bg-amber-500 text-slate-950 text-xs sm:text-sm font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>
          [ DEMO ONLY ] ระบบร้านค้านี้เป็นระบบสาธิตการทำงาน ไม่มีการรับชำระเงินจริง
        </span>
      </div>

      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900 text-lg sm:text-xl">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="tracking-tight">E-book Shop</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-2 py-1"
          >
            หน้าร้าน
          </Link>
          <Link
            href="/track"
            className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-2 py-1"
          >
            <Search className="w-4 h-4" />
            <span>ติดตามคำสั่งซื้อ</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
