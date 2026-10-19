import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#C8C3B8] bg-[#EAE6DC] py-4 px-4 sm:px-6 text-xs text-[#484641] mt-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 font-mono-tabular">
        <span>
          Rekonstruksi Prompt: Deteksi Otomatis Prompt ke Keluaran Gambar
        </span>
        <span>
          Penilaian Terstruktur: Analisis Semantik dan Evaluasi Leksikal Terukur
        </span>
      </div>
    </footer>
  );
};

