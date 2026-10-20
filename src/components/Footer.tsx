import React from "react";
import Link from "next/link";
import { BookOpen, Monitor, Play } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#C8C3B8] bg-[#EAE6DC] py-4 px-4 sm:px-6 text-xs text-[#484641] mt-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono-tabular">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#141413]">MPI Rekonstruksi Prompt</span>
          <span>•</span>
          <span>Deteksi Otomatis Prompt & Evaluasi Leksikal Terukur</span>
        </div>

        <nav className="flex items-center gap-4 text-xs font-semibold" aria-label="Navigasi Footer">
          <Link
            href="/"
            className="hover:text-[#141413] flex items-center gap-1 min-h-[36px] py-1 transition-colors"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Meja Kendali</span>
          </Link>
          <Link
            href="/play"
            className="hover:text-[#141413] flex items-center gap-1 min-h-[36px] py-1 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Layar Pemain</span>
          </Link>
          <Link
            href="/modul"
            className="text-[#B83214] hover:text-[#96270E] flex items-center gap-1 min-h-[36px] py-1 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Modul Pembelajaran</span>
          </Link>
        </nav>
      </div>
    </footer>
  );
};

