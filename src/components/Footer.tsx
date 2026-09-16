import { ShieldCheck, Smartphone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 py-8 text-slate-500 text-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Vibe Coding: E-book Shop Assignment</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5" /> Mobile WebViewer Ready
          </span>
          <span>•</span>
          <span>Next.js + Supabase + Vercel</span>
        </div>
      </div>
    </footer>
  );
}
