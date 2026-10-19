"use client";

import React, { useState } from "react";
import { ScoreData, MultiplayerSubmission } from "@/lib/types";
import { INDONESIAN_STOPWORDS } from "@/lib/constants";
import {
  Eye,
  RefreshCw,
  Check,
  X,
  Maximize2,
  Award,
  Palette,
  Camera,
  Sun,
} from "lucide-react";

interface PlayerResultsComparisonProps {
  secretPrompt: string;
  originalImageUrl: string;
  makerName: string;
  teamName: string;
  guessedPrompt: string;
  reconstructedImageUrl: string | null;
  imageSource?: string;
  scoreData?: ScoreData;
  isGenerating?: boolean;
  onRegenerate: () => Promise<void> | void;
  allSubmissions?: MultiplayerSubmission[];
  isMaker?: boolean;
}

export const PlayerResultsComparison: React.FC<PlayerResultsComparisonProps> = ({
  secretPrompt,
  originalImageUrl,
  makerName,
  teamName,
  guessedPrompt,
  reconstructedImageUrl,
  imageSource,
  scoreData,
  isGenerating = false,
  onRegenerate,
  allSubmissions = [],
  isMaker = false,
}) => {
  const [activeTab, setActiveTab] = useState<"sideBySide" | "original" | "reconstruction">("sideBySide");
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>("");

  // Jika Pembuat Soal, izinkan memilih hasil tim mana yang ingin diperiksa
  const currentSub = isMaker && selectedSubmissionId
    ? allSubmissions.find((s) => s.id === selectedSubmissionId)
    : null;

  const effectiveGuessedPrompt = currentSub ? currentSub.guessed_prompt : guessedPrompt;
  const effectiveReconstructedImage = currentSub
    ? currentSub.generated_image_url || null
    : reconstructedImageUrl;
  const effectiveTeamName = currentSub ? currentSub.team_name : teamName;
  const effectiveScore = currentSub ? currentSub.score_data : scoreData;

  // Analisis token yang terlewat
  const secretWords = (secretPrompt || "")
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !INDONESIAN_STOPWORDS.has(w));

  const guessWords = new Set(
    (effectiveGuessedPrompt || "")
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, "")
      .split(/\s+/)
  );

  const matchedKeywords = effectiveScore?.matchedTokens || [];
  const missingKeywords = Array.from(
    new Set(secretWords.filter((w) => !guessWords.has(w) && !matchedKeywords.includes(w)))
  ).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Kartu Header Hasil & Skor */}
      <div className="panel-frame p-5 sm:p-6 bg-white border-2 border-[#141413] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#C8C3B8]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="step-pill bg-[#165B33] text-white">
                Hasil Ronde
              </span>
              <span className="font-mono-tabular text-xs text-[#484641]">
                Evaluasi Kemiripan
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#141413]">
              {isMaker ? "Perbandingan Soal dan Tebakan Tim" : "Perbandingan Gambar dan Tebakan"}
            </h2>
            <p className="text-xs sm:text-sm text-[#484641] mt-1">
              Sandingan gambar acuan dengan hasil visual yang direkonstruksi dari prompt tebakan tim.
            </p>
          </div>

          {effectiveScore && (
            <div className="p-3 sm:p-3.5 rounded-[6px] border-2 border-[#141413] bg-[#EAE6DC] text-[#141413] font-mono-tabular self-start sm:self-auto flex items-center gap-3 shrink-0">
              <Award className="w-6 h-6 text-[#141413]" />
              <div>
                <span className="text-[10px] text-[#484641] font-semibold uppercase tracking-wider block">
                  Nilai Kemiripan
                </span>
                <span className="text-2xl font-bold leading-none">
                  {effectiveScore.totalScore}
                  <span className="text-xs font-normal text-[#484641] ml-1">/ 100</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Jika Pembuat Soal: Pilihan Tim untuk Disandingkan */}
        {isMaker && allSubmissions.length > 0 && (
          <div className="pt-1 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold font-mono-tabular text-[#484641]">
              Pilih Tim:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {allSubmissions.map((sub) => {
                const isSelected =
                  selectedSubmissionId === sub.id ||
                  (!selectedSubmissionId && sub.id === allSubmissions[0].id);

                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedSubmissionId(sub.id)}
                    className={`px-3 py-1.5 rounded-[4px] text-xs font-mono-tabular font-bold transition-colors border min-h-[36px] ${
                      isSelected
                        ? "bg-[#141413] text-[#F4F1EA] border-[#141413]"
                        : "bg-white text-[#141413] hover:bg-[#EAE6DC] border-[#C8C3B8]"
                    }`}
                  >
                    {sub.team_name} ({sub.score_data?.totalScore ?? 0} Poin)
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Switcher untuk Layar Kecil (Mobile) */}
        <div className="flex sm:hidden p-1 bg-[#EAE6DC] rounded-[6px] border border-[#C8C3B8]">
          <button
            type="button"
            onClick={() => setActiveTab("sideBySide")}
            className={`flex-1 py-1.5 text-xs font-mono-tabular font-bold rounded-[4px] transition-colors ${
              activeTab === "sideBySide"
                ? "bg-[#141413] text-[#F4F1EA]"
                : "text-[#484641] hover:text-[#141413]"
            }`}
          >
            Sandingan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("original")}
            className={`flex-1 py-1.5 text-xs font-mono-tabular font-bold rounded-[4px] transition-colors ${
              activeTab === "original"
                ? "bg-[#141413] text-[#F4F1EA]"
                : "text-[#484641] hover:text-[#141413]"
            }`}
          >
            Gambar Asli
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reconstruction")}
            className={`flex-1 py-1.5 text-xs font-mono-tabular font-bold rounded-[4px] transition-colors ${
              activeTab === "reconstruction"
                ? "bg-[#141413] text-[#F4F1EA]"
                : "text-[#484641] hover:text-[#141413]"
            }`}
          >
            Tebakan Tim
          </button>
        </div>
      </div>

      {/* Dua Kolom Sandingan Visual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Kolom Kiri: Gambar Acuan Asli */}
        <div
          className={`panel-frame p-5 bg-white border-2 border-[#141413] space-y-3.5 ${
            activeTab === "reconstruction" ? "hidden sm:block" : "block"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C8C3B8] pb-2">
            <span className="step-pill bg-[#1D3557] text-white">
              Gambar Asli
            </span>
            <span className="text-xs font-mono-tabular text-[#484641]">
              Oleh: <strong className="text-[#141413]">{makerName}</strong>
            </span>
          </div>

          <div className="p-2.5 rounded-[6px] border border-[#141413] bg-[#F4F1EA] max-h-[360px] flex items-center justify-center relative group overflow-hidden">
            {originalImageUrl ? (
              <>
                <img
                  src={originalImageUrl}
                  alt="Gambar Asli Acuan"
                  className="max-h-[340px] w-auto object-contain rounded-[4px]"
                />
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(true)}
                  className="btn-secondary absolute bottom-3 right-3 text-xs font-mono-tabular px-2.5 py-1 min-h-[36px]"
                  title="Perbesar gambar acuan"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Perbesar</span>
                </button>
              </>
            ) : (
              <div className="text-[#484641] font-mono-tabular text-xs py-12">
                Gambar acuan tidak tersedia
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-[6px] bg-[#EAE6DC] border border-[#C8C3B8] space-y-1">
            <span className="text-[11px] font-mono-tabular font-semibold text-[#484641] uppercase tracking-wider block">
              Prompt Asli:
            </span>
            <p className="text-xs sm:text-sm font-mono-tabular text-[#141413] font-semibold leading-relaxed">
              &ldquo;{secretPrompt}&rdquo;
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Rekonstruksi Tebakan Tim */}
        <div
          className={`panel-frame p-5 bg-white border-2 border-[#141413] space-y-3.5 ${
            activeTab === "original" ? "hidden sm:block" : "block"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C8C3B8] pb-2">
            <span className="step-pill bg-[#B83214] text-white">
              Tebakan {effectiveTeamName}
            </span>
            <button
              type="button"
              disabled={isGenerating}
              onClick={onRegenerate}
              className="btn-secondary text-xs font-mono-tabular px-2.5 py-1 min-h-[36px] flex items-center gap-1.5"
              title="Buat ulang gambar dari prompt tebakan"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              <span>Buat Ulang</span>
            </button>
          </div>

          <div className="p-2.5 rounded-[6px] border border-[#141413] bg-[#F4F1EA] max-h-[360px] flex items-center justify-center relative group overflow-hidden">
            {isGenerating ? (
              <div className="py-16 text-center text-[#484641] space-y-2">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#141413]" />
                <p className="font-bold font-mono-tabular text-sm text-[#141413]">Merender gambar dari tebakan...</p>
                <p className="text-xs text-[#484641] max-w-xs mx-auto">
                  Sistem sedang merekonstruksi visual berdasarkan prompt tim.
                </p>
              </div>
            ) : effectiveReconstructedImage ? (
              <>
                <img
                  src={effectiveReconstructedImage}
                  alt={`Hasil visual prompt ${effectiveTeamName}`}
                  className="max-h-[340px] w-auto object-contain rounded-[4px]"
                />
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(true)}
                  className="btn-secondary absolute bottom-3 right-3 text-xs font-mono-tabular px-2.5 py-1 min-h-[36px]"
                  title="Perbesar gambar rekonstruksi"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Perbesar</span>
                </button>
              </>
            ) : (
              <div className="py-12 text-center space-y-3">
                <p className="text-xs font-mono-tabular text-[#484641]">
                  Visual rekonstruksi belum dibangkitkan.
                </p>
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="btn-primary text-xs"
                >
                  Buat Gambar Sekarang
                </button>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-[6px] bg-[#EAE6DC] border border-[#C8C3B8] space-y-1">
            <span className="text-[11px] font-mono-tabular font-semibold text-[#484641] uppercase tracking-wider block">
              Prompt Tebakan:
            </span>
            <p className="text-xs sm:text-sm font-mono-tabular text-[#141413] font-semibold leading-relaxed">
              &ldquo;{effectiveGuessedPrompt}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Rincian Komponen Skor dan Kata Kunci */}
      {effectiveScore && (
        <div className="panel-frame p-5 sm:p-6 bg-white border-2 border-[#141413] space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#C8C3B8]">
            <h3 className="font-bold text-base sm:text-lg text-[#141413]">
              Rincian Skor Kemiripan
            </h3>
          </div>

          {/* 3 Aspek Penilaian */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono-tabular text-xs">
            <div className="p-3.5 rounded-[6px] bg-white border border-[#141413] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#141413] uppercase flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#141413]" />
                  Subjek &amp; Objek
                </span>
                <span className="font-bold text-[#141413] text-sm">
                  {effectiveScore.topicScore} <span className="text-xs font-normal text-[#484641]">/ 40</span>
                </span>
              </div>
              <p className="text-[#484641] pt-1 leading-relaxed">
                Ketepatan karakter, objek utama, dan latar tempat.
              </p>
            </div>

            <div className="p-3.5 rounded-[6px] bg-white border border-[#141413] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#141413] uppercase flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-[#141413]" />
                  Gaya &amp; Suasana
                </span>
                <span className="font-bold text-[#141413] text-sm">
                  {effectiveScore.styleScore} <span className="text-xs font-normal text-[#484641]">/ 35</span>
                </span>
              </div>
              <p className="text-[#484641] pt-1 leading-relaxed">
                Medium visual, suasana pencahayaan, dan warna dominan.
              </p>
            </div>

            <div className="p-3.5 rounded-[6px] bg-white border border-[#141413] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#141413] uppercase flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-[#141413]" />
                  Detail &amp; Komposisi
                </span>
                <span className="font-bold text-[#141413] text-sm">
                  {effectiveScore.constraintScore} <span className="text-xs font-normal text-[#484641]">/ 25</span>
                </span>
              </div>
              <p className="text-[#484641] pt-1 leading-relaxed">
                Arah sudut pandang kamera, framing, dan detail khusus.
              </p>
            </div>
          </div>

          {/* Kata Kunci Cocok vs Terlewat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-mono-tabular">
            {/* Cocok */}
            <div className="panel-muted p-4 space-y-2 border border-[#C8C3B8]">
              <span className="text-xs font-bold text-[#165B33] uppercase tracking-wider flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#165B33]" />
                Kata Kunci Cocok ({matchedKeywords.length})
              </span>
              {matchedKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {matchedKeywords.map((tok, i) => (
                    <span key={i} className="token-match">
                      {tok}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#484641]">Belum ada kata kunci persis yang sama.</p>
              )}
            </div>

            {/* Terlewat */}
            <div className="panel-muted p-4 space-y-2 border border-[#C8C3B8]">
              <span className="text-xs font-bold text-[#B83214] uppercase tracking-wider flex items-center gap-1.5">
                <X className="w-4 h-4 text-[#B83214]" />
                Kata Kunci Terlewat ({missingKeywords.length})
              </span>
              {missingKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {missingKeywords.map((tok, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-[3px] bg-[#FBE8E6] text-[#B83214] border border-[#B83214] text-xs font-mono-tabular"
                    >
                      {tok}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#165B33] font-semibold">Semua kata kunci utama berhasil ditebak.</p>
              )}
            </div>
          </div>

          {/* Catatan Evaluasi */}
          {effectiveScore.feedback && (
            <div className="p-3.5 bg-[#EAE6DC] rounded-[6px] border border-[#C8C3B8] text-xs text-[#141413] leading-relaxed">
              <strong>Catatan Evaluasi:</strong> {effectiveScore.feedback}
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal Fullscreen */}
      {isZoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalZoomTitle"
          className="fixed inset-0 z-50 bg-black/75 p-4 sm:p-8 flex items-center justify-center"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="panel-frame max-w-5xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-4 bg-white border-2 border-[#141413]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#C8C3B8]">
              <h3 id="modalZoomTitle" className="font-bold text-lg text-[#141413]">
                Perbandingan Resolusi Penuh
              </h3>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="p-1.5 rounded bg-[#EAE6DC] hover:bg-[#C8C3B8] text-[#141413] border border-[#141413] min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
                aria-label="Tutup perbesaran"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-mono-tabular font-bold text-[#141413] block">
                  Gambar Soal Asli:
                </span>
                <div className="rounded-[6px] border border-[#141413] overflow-hidden bg-[#F4F1EA] max-h-[420px] flex items-center justify-center p-2">
                  <img src={originalImageUrl} alt="Asli" className="w-full h-auto max-h-[400px] object-contain rounded-[4px]" />
                </div>
                <p className="text-xs font-mono-tabular text-[#484641]">&ldquo;{secretPrompt}&rdquo;</p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono-tabular font-bold text-[#141413] block">
                  Rekonstruksi Tim:
                </span>
                <div className="rounded-[6px] border border-[#141413] overflow-hidden bg-[#F4F1EA] max-h-[420px] flex items-center justify-center p-2">
                  {effectiveReconstructedImage && (
                    <img src={effectiveReconstructedImage} alt="Rekonstruksi" className="w-full h-auto max-h-[400px] object-contain rounded-[4px]" />
                  )}
                </div>
                <p className="text-xs font-mono-tabular text-[#484641]">&ldquo;{effectiveGuessedPrompt}&rdquo;</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
