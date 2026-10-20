"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MODUL_PROMPT_ENGINEERING, ModulSection } from "@/lib/modul-data";
import {
  BookOpen,
  Target,
  Cpu,
  Layers,
  Focus,
  Palette,
  Sun,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  Award,
  Play,
  RotateCcw,
} from "lucide-react";

export function ModulInteractive() {
  const sections = MODUL_PROMPT_ENGINEERING;
  const [activeIdx, setActiveIdx] = useState(0);
  const [readSections, setReadSections] = useState<Record<number, boolean>>({ 0: true });

  // Load progress from localStorage
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem("mpi_modul_progress");
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        if (typeof parsed === "object") {
          setReadSections(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const markSectionAsRead = (idx: number) => {
    setReadSections((prev) => {
      const updated = { ...prev, [idx]: true };
      try {
        localStorage.setItem("mpi_modul_progress", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleSelectSection = (idx: number) => {
    setActiveIdx(idx);
    markSectionAsRead(idx);
    // Smooth scroll to top of reading panel on small screens
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      const panel = document.getElementById("modul-content-panel");
      if (panel) {
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleNext = () => {
    if (activeIdx < sections.length - 1) {
      handleSelectSection(activeIdx + 1);
    }
  };

  const handlePrev = () => {
    if (activeIdx > 0) {
      handleSelectSection(activeIdx - 1);
    }
  };

  const currentSection: ModulSection = sections[activeIdx] || sections[0];
  const isIntro = currentSection.id === "tujuan-pembelajaran";
  const totalChapters = sections.length - 1; // excluding intro
  const readCount = Object.keys(readSections).length;
  const progressPercent = Math.round((readCount / sections.length) * 100);

  // Render icon based on iconName
  const renderIcon = (name: string, className = "w-4 h-4") => {
    switch (name) {
      case "target":
        return <Target className={className} />;
      case "cpu":
        return <Cpu className={className} />;
      case "layers":
        return <Layers className={className} />;
      case "focus":
        return <Focus className={className} />;
      case "palette":
        return <Palette className={className} />;
      case "sun":
        return <Sun className={className} />;
      case "sparkles":
        return <Sparkles className={className} />;
      default:
        return <BookOpen className={className} />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* 1. Header Banner & Progress Bar */}
      <header className="mb-6 bg-white border-2 border-[#141413] rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono-tabular text-xs uppercase tracking-wider px-2.5 py-1 rounded bg-[#EAE6DC] text-[#141413] border border-[#141413] font-semibold">
                Modul Pembelajaran Interaktif (MPI)
              </span>
              <span className="font-mono-tabular text-xs px-2.5 py-1 rounded bg-[#165B33]/15 text-[#165B33] border border-[#165B33]/40 font-semibold">
                Kurikulum Rekonstruksi Prompt Gambar
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#141413]">
              Panduan Rekonstruksi Prompt & Sintesis Gambar AI
            </h1>
            <p className="text-xs sm:text-sm text-[#484641] mt-1 max-w-3xl">
              Kuasai teknik dekonstruksi visual, spesifikasi prompt 5 dimensi (Subjek, Latar, Cahaya, Medium, Komposisi), dan strategi rekayasa balik gambar di meja permainan.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href="/"
              className="min-h-[44px] px-4 py-2 rounded bg-[#141413] text-[#F4F1EA] hover:bg-[#2B2B29] font-mono-tabular text-xs flex items-center justify-center gap-2 border border-[#141413] transition-colors focus-visible:ring-2 focus-visible:ring-[#B83214] focus-visible:outline-none"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Meja Kendali Guru</span>
            </Link>
            <Link
              href="/play"
              className="min-h-[44px] px-4 py-2 rounded bg-[#B83214] text-white hover:bg-[#96270E] font-mono-tabular text-xs font-semibold flex items-center justify-center gap-2 border border-[#141413] transition-colors focus-visible:ring-2 focus-visible:ring-[#B83214] focus-visible:outline-none"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Layar Pemain (/play)</span>
            </Link>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 pt-4 border-t border-[#C8C3B8]">
          <div className="flex items-center justify-between text-xs font-mono-tabular text-[#484641] mb-1.5">
            <span>Kemajuan Belajar: {readCount} dari {sections.length} Modul Terbaca</span>
            <span className="font-bold text-[#141413]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-[#EAE6DC] h-2.5 rounded-full overflow-hidden border border-[#C8C3B8]">
            <div
              className="bg-[#165B33] h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </header>

      {/* 2. Main Layout: Sidebar & Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar (Desktop: 4 cols, Mobile: Top Horizontal Scroll) */}
        <nav
          className="lg:col-span-4 bg-white border-2 border-[#141413] rounded-lg p-3 sm:p-4 shadow-sm"
          aria-label="Daftar Modul Pembelajaran"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#C8C3B8] mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#B83214]" />
              <span className="font-mono-tabular text-xs font-bold uppercase tracking-wider text-[#141413]">
                Daftar Bab & Orientasi
              </span>
            </div>
            <span className="font-mono-tabular text-[11px] text-[#484641]">
              {sections.length} Bagian
            </span>
          </div>

          {/* Chapters list */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-thin">
            {sections.map((sec, idx) => {
              const isSelected = activeIdx === idx;
              const isRead = !!readSections[idx];
              const isSecIntro = sec.id === "tujuan-pembelajaran";

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => handleSelectSection(idx)}
                  className={`min-h-[48px] text-left p-3 rounded-md transition-all border flex items-start gap-3 shrink-0 lg:shrink lg:w-full min-w-[240px] sm:min-w-[280px] lg:min-w-0 focus-visible:ring-2 focus-visible:ring-[#B83214] focus-visible:outline-none ${
                    isSelected
                      ? "bg-[#141413] text-[#F4F1EA] border-[#141413] shadow-inner"
                      : "bg-[#F4F1EA] hover:bg-[#EAE6DC] text-[#141413] border-[#C8C3B8]"
                  }`}
                  aria-current={isSelected ? "page" : undefined}
                >
                  <div
                    className={`p-2 rounded mt-0.5 shrink-0 border ${
                      isSelected
                        ? "bg-[#2B2B29] text-white border-[#5A5852]"
                        : "bg-white text-[#141413] border-[#C8C3B8]"
                    }`}
                  >
                    {renderIcon(sec.iconName, "w-4 h-4")}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`text-[10px] font-mono-tabular uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          isSelected
                            ? "bg-[#2B2B29] text-[#EAE6DC]"
                            : "bg-[#EAE6DC] text-[#484641]"
                        }`}
                      >
                        {isSecIntro ? "Orientasi" : `Bab ${sec.chapterNumber}`}
                      </span>
                      {isRead && (
                        <span title="Sudah dibaca" className="inline-flex">
                          <CheckCircle2
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isSelected ? "text-[#52B788]" : "text-[#165B33]"
                            }`}
                          />
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-xs sm:text-sm font-bold leading-snug line-clamp-2 ${
                        isSelected ? "text-white" : "text-[#141413]"
                      }`}
                    >
                      {sec.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content Reading Panel (Desktop: 8 cols) */}
        <main
          id="modul-content-panel"
          className="lg:col-span-8 bg-white border-2 border-[#141413] rounded-lg p-5 sm:p-8 shadow-sm flex flex-col min-h-[600px]"
          tabIndex={-1}
        >
          {/* Chapter badge & title */}
          <div className="border-b-2 border-[#141413] pb-5 mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="font-mono-tabular text-xs font-semibold px-2.5 py-1 rounded bg-[#B83214] text-white">
                {currentSection.badge}
              </span>
              <span className="font-mono-tabular text-xs px-2.5 py-1 rounded bg-[#EAE6DC] text-[#141413] border border-[#C8C3B8]">
                {currentSection.tag}
              </span>
              {!isIntro && (
                <span className="font-mono-tabular text-xs text-[#484641] ml-auto">
                  Bab {currentSection.chapterNumber} dari {totalChapters}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#141413] tracking-tight">
              {currentSection.title}
            </h2>

            {/* Summary callout */}
            <div className="mt-4 p-4 rounded-md bg-[#F4F1EA] border border-[#C8C3B8] text-xs sm:text-sm text-[#141413] leading-relaxed">
              <span className="font-bold text-[#B83214] block mb-1">Ikhtisar Konsep:</span>
              {currentSection.summary}
            </div>
          </div>

          {/* Section 1: Learning Objectives */}
          {currentSection.learningObjectives && currentSection.learningObjectives.length > 0 && (
            <section className="mb-8" aria-labelledby="tujuan-heading">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-[#B83214]" />
                <h3 id="tujuan-heading" className="text-base sm:text-lg font-bold text-[#141413]">
                  Indikator Capaian Pembelajaran
                </h3>
              </div>

              <div className="bg-[#EAE6DC]/40 border border-[#C8C3B8] rounded-md p-4">
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#141413]">
                  {currentSection.learningObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#165B33] mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Section 2: Special Competency Map (Only on Intro / Tujuan Pembelajaran) */}
          {isIntro && currentSection.competencyMap && (
            <section className="mb-8" aria-labelledby="peta-heading">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-[#1D3557]" />
                <h3 id="peta-heading" className="text-base sm:text-lg font-bold text-[#141413]">
                  Peta Kompetensi Modul Bertingkat (6 Bab Inti)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentSection.competencyMap.map((map) => (
                  <div
                    key={map.chapterNumber}
                    className="p-3.5 rounded-md bg-[#F4F1EA] border border-[#C8C3B8] hover:border-[#141413] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono-tabular text-[11px] font-bold px-2 py-0.5 rounded bg-[#141413] text-[#F4F1EA]">
                        Bab {map.chapterNumber}
                      </span>
                      <span className="font-mono-tabular text-[11px] text-[#484641] font-medium">
                        {map.tag}
                      </span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-[#141413] mb-1">
                      {map.title}
                    </div>
                    <p className="text-xs text-[#484641] leading-relaxed">
                      {map.objective}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 3: Key Points & Practical Examples */}
          <section className="mb-8 space-y-6" aria-labelledby="poin-kunci-heading">
            <h3 id="poin-kunci-heading" className="text-base sm:text-lg font-bold text-[#141413] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#B83214]" />
              <span>Pembahasan Materi & Analisis Komparasi</span>
            </h3>

            {currentSection.keyPoints.map((point, idx) => (
              <article
                key={idx}
                className="border border-[#C8C3B8] rounded-md p-4 sm:p-5 bg-white space-y-3"
              >
                <h4 className="text-sm sm:text-base font-bold text-[#141413]">
                  {idx + 1}. {point.title}
                </h4>

                <p className="text-xs sm:text-sm text-[#484641] leading-relaxed whitespace-pre-line">
                  {point.description}
                </p>

                {/* Example Comparison Box (Bad vs Good) */}
                {point.example && (
                  <div className="mt-4 pt-4 border-t border-[#EAE6DC] space-y-3">
                    <span className="font-mono-tabular text-xs uppercase tracking-wider font-bold text-[#141413] block">
                      Studi Komparasi Prompt Visual:
                    </span>

                    {/* Bad Prompt Box */}
                    <div className="p-3.5 rounded bg-[#FFF5F5] border border-[#F87171]/40 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 font-bold text-[#991B1B] mb-1">
                        <XCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                        <span>Prompt Kurang Efektif (Ambigual / Tidak Terarah):</span>
                      </div>
                      <div className="font-mono-tabular text-xs text-[#7F1D1D] bg-white/70 p-2 rounded border border-[#FCA5A5] mt-1.5">
                        &quot;{point.example.bad}&quot;
                      </div>
                    </div>

                    {/* Good Prompt Box */}
                    <div className="p-3.5 rounded bg-[#F0FDF4] border border-[#86EFAC]/50 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 font-bold text-[#166534] mb-1">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
                        <span>Prompt Ideal (Berbobot 5 Dimensi):</span>
                      </div>
                      <div className="font-mono-tabular text-xs text-[#14532D] bg-white/70 p-2 rounded border border-[#BBF7D0] mt-1.5">
                        &quot;{point.example.good}&quot;
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="text-xs text-[#484641] italic bg-[#F4F1EA] p-3 rounded border border-[#C8C3B8]">
                      <span className="font-semibold text-[#141413] not-italic">Mengapa berbeda? </span>
                      {point.example.explanation}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </section>

          {/* Section 3.5: Tebak Gambar Application Bridge */}
          {currentSection.tebakGambarApplication && (
            <section className="mb-8" aria-labelledby="tebak-gambar-heading">
              <div className="bg-[#1D3557]/10 border-2 border-[#1D3557] rounded-md p-4 sm:p-5">
                <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-[#1D3557] mb-2">
                  <Sparkles className="w-4 h-4 text-[#B83214]" />
                  <h4 id="tebak-gambar-heading">
                    {currentSection.tebakGambarApplication.title}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-[#141413] leading-relaxed">
                  {currentSection.tebakGambarApplication.description}
                </p>
              </div>
            </section>
          )}

          {/* Section 4: Practical Arena Tips */}
          {currentSection.tips && currentSection.tips.length > 0 && (
            <section className="mb-8" aria-labelledby="tips-heading">
              <div className="bg-[#FEF3C7]/40 border border-[#F59E0B]/50 rounded-md p-4 sm:p-5">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-[#92400E] mb-2.5">
                  <Lightbulb className="w-4 h-4 text-[#D97706]" />
                  <h4 id="tips-heading">Tip Taktis di Meja Permainan:</h4>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-[#78350F]">
                  {currentSection.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono-tabular font-bold text-[#B45309] mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Bottom Navigation Buttons */}
          <div className="mt-auto pt-6 border-t-2 border-[#141413] flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeIdx === 0}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded bg-white text-[#141413] hover:bg-[#EAE6DC] disabled:opacity-40 disabled:cursor-not-allowed font-mono-tabular text-xs font-semibold flex items-center justify-center gap-2 border-2 border-[#141413] transition-colors focus-visible:ring-2 focus-visible:ring-[#B83214] focus-visible:outline-none"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Bab Sebelumnya</span>
            </button>

            <div className="font-mono-tabular text-xs text-[#484641] order-last sm:order-none">
              Modul {activeIdx + 1} dari {sections.length}
            </div>

            {activeIdx < sections.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2 rounded bg-[#B83214] text-white hover:bg-[#96270E] font-mono-tabular text-xs font-semibold flex items-center justify-center gap-2 border-2 border-[#141413] transition-colors focus-visible:ring-2 focus-visible:ring-[#B83214] focus-visible:outline-none"
              >
                <span>Lanjut ke Bab Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href="/play"
                className="w-full sm:w-auto min-h-[44px] px-5 py-2 rounded bg-[#165B33] text-white hover:bg-[#114627] font-mono-tabular text-xs font-semibold flex items-center justify-center gap-2 border-2 border-[#141413] transition-colors focus-visible:ring-2 focus-visible:ring-[#165B33] focus-visible:outline-none"
              >
                <span>Selesai! Mulai Main di Layar Pemain</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
