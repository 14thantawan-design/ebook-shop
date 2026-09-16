import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Star, BookCheck, ShieldAlert } from 'lucide-react';
import { getBooks } from '@/lib/books';

export default async function HomePage() {
  const books = await getBooks();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold backdrop-blur border border-blue-400/20">
            <BookCheck className="w-3.5 h-3.5" />
            <span>ร้านค้า E-book ตัวอย่างสำหรับส่งงาน</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            คลังหนังสือดิจิทัลเพื่อนักพัฒนาซอฟต์แวร์
          </h1>
          <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed">
            เลือกซื้อ E-book จำลอง ทดสอบระบบสั่งซื้อ ชำระเงินแบบ Mock และรับลิงก์ดาวน์โหลดทันที
          </p>
        </div>
      </section>

      {/* Book Catalog Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">รายการหนังสือ E-book แนะนำ</h2>
          <p className="text-sm text-slate-500">เลือกหนังสือที่ต้องการเพื่อเข้าสู่ขั้นตอนการสั่งซื้อ</p>
        </div>
        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium self-start sm:self-auto">
          มีทั้งหมด {books.length} รายการ
        </span>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div
            key={book.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
          >
            {/* Book Cover */}
            <div className="relative h-64 sm:h-72 w-full bg-slate-100 overflow-hidden">
              <img
                src={book.cover_image}
                alt={book.title}
                className="w-full h-full object-cover object-center transition-transform hover:scale-105 duration-300"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-slate-900 font-bold px-2.5 py-1 rounded-md text-sm shadow">
                ฿{Number(book.price).toFixed(2)}
              </div>
            </div>

            {/* Book Info */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>แนะนำพิเศษ</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg line-clamp-2 leading-snug">
                  {book.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium">โดย {book.author}</p>
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {book.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-100">
                <Link
                  href={`/checkout?bookId=${book.id}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm shadow-sm transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>สั่งซื้อ E-book เล่มนี้</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
