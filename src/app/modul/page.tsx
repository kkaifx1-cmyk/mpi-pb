import { Metadata } from "next";
import { ModulInteractive } from "@/components/ModulInteractive";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Modul Pembelajaran Prompt Engineering & Tebak Gambar | MPI",
  description:
    "Modul Pembelajaran Interaktif tentang konsep dan prinsip Prompt Engineering, tata kelola Input & Konteks, Output Control, penerapan Persona, dan teknik rekonstruksi gambar di meja permainan.",
};

export default function ModulPage() {
  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#141413] flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <nav
        className="border-b-2 border-[#141413] bg-[#141413] text-[#F4F1EA] sticky top-0 z-40"
        aria-label="Navigasi Utama Modul"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="min-h-[44px] px-3 py-1.5 rounded bg-[#2B2B29] hover:bg-[#383835] text-[#F4F1EA] text-xs font-mono-tabular border border-[#5A5852] flex items-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-[#B83214] focus-visible:outline-none"
              aria-label="Kembali ke Meja Kendali Utama"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="font-mono-tabular text-xs uppercase tracking-widest px-2.5 py-1 rounded bg-[#2B2B29] text-[#F4F1EA] border border-[#5A5852] hidden sm:inline-block">
                Modul Edukasi
              </span>
              <div>
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#B83214]" />
                  <span>Modul Pembelajaran Prompt Engineering</span>
                </h1>
                <p className="text-[11px] text-[#D0CCC3] hidden md:block">
                  Prinsip Prompt Engineering, Input, Output, Persona, dan strategi tebak gambar
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/play"
              className="min-h-[44px] px-3 py-2 rounded bg-[#B83214] hover:bg-[#96270E] text-white text-xs font-mono-tabular font-semibold flex items-center gap-1.5 border border-[#141413] transition-colors focus-visible:ring-2 focus-visible:ring-[#B83214] focus-visible:outline-none"
            >
              <span>Buka Layar /play</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1">
        <ModulInteractive />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
