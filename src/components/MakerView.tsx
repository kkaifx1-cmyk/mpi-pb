"use client";

import React, { useState } from "react";
import { DetectedMeta } from "@/lib/types";
import { countWords, detectPromptCharacteristics } from "@/lib/scoring";
import { CURATED_CHALLENGES } from "@/lib/constants";
import { Lock, RefreshCw, Image as ImageIcon, Wand2, CheckCircle2 } from "lucide-react";

interface MakerViewProps {
  currentRound: number;
  totalRounds: number;
  makerTeamName: string;
  onGenerateImage: (prompt: string) => Promise<{
    imageUrl: string;
    source: string;
    englishPrompt?: string;
  }>;
  onLockAndStartGuessing: (
    prompt: string,
    imageUrl: string,
    meta: DetectedMeta,
    source?: string,
    englishPrompt?: string
  ) => void;
  onShowAlert: (msg: string, type?: "info" | "error" | "success") => void;
}

export const MakerView: React.FC<MakerViewProps> = ({
  currentRound,
  totalRounds,
  makerTeamName,
  onGenerateImage,
  onLockAndStartGuessing,
  onShowAlert,
}) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageSource, setImageSource] = useState("");
  const [englishPrompt, setEnglishPrompt] = useState("");
  const [sampleIndex, setSampleIndex] = useState(0);

  const wordCount = countWords(prompt);
  const detectedMeta = detectPromptCharacteristics(prompt);

  const handleInsertSample = () => {
    const sample = CURATED_CHALLENGES[sampleIndex % CURATED_CHALLENGES.length];
    setSampleIndex((prev) => prev + 1);
    setPrompt(sample.prompt);
  };

  const handleGenerate = async () => {
    if (countWords(prompt) < 3) {
      onShowAlert(
        "Tulis prompt minimal 3 kata agar gambar yang dihasilkan memiliki detail yang cukup untuk ditebak.",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      const result = await onGenerateImage(prompt);
      setImageUrl(result.imageUrl);
      setImageSource(result.source);
      setEnglishPrompt(result.englishPrompt || "");
    } catch (err: any) {
      onShowAlert(`Gagal merender gambar: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLock = () => {
    if (!imageUrl) {
      onShowAlert("Buat gambar dari prompt terlebih dahulu sebelum mengunci soal.", "error");
      return;
    }
    onLockAndStartGuessing(prompt, imageUrl, detectedMeta, imageSource, englishPrompt);
  };

  return (
    <section className="space-y-6 animate-in fade-in duration-200">
      {/* Turn Instruction Header */}
      <div className="panel-frame p-5 sm:p-6 bg-[#FFFFFF] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="step-pill bg-[#B83214] text-white">
              Tahap 1: Pembuatan Soal Gambar
            </span>
            <span className="font-mono text-xs text-[#484641]">
              Ronde {currentRound} dari {totalRounds}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            Giliran Pembuat Soal:{" "}
            <span className="underline decoration-2 underline-offset-4">
              {makerTeamName}
            </span>
          </h2>
          <p className="text-sm text-[#484641] mt-1">
            Tim penebak harap tidak melihat layar saat{" "}
            <span className="font-semibold">{makerTeamName}</span> menulis prompt rahasia dan membuat gambar soal.
          </p>
        </div>

        <button
          type="button"
          onClick={handleInsertSample}
          className="btn-secondary text-xs shrink-0"
        >
          <Wand2 className="w-3.5 h-3.5" />
          Isi Contoh Prompt Gambar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Secret Prompt Input & Parameter Deteksi */}
        <div className="lg:col-span-6 panel-frame p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C8C3B8] pb-3">
            <label htmlFor="secretPrompt" className="text-base font-bold">
              Prompt Rahasia Pembuat Gambar
            </label>
            <span className="font-mono text-xs px-2.5 py-1 rounded border border-[#141413] bg-[#F4F1EA]">
              {wordCount === 0
                ? "Deteksi Otomatis: Menunggu Input"
                : `Terdeteksi: ${detectedMeta.style}`}
            </span>
          </div>

          <div>
            <textarea
              id="secretPrompt"
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Contoh: Seekor kucing oranye memakai helm astronot duduk di warung kopi pinggir jalan saat hujan malam hari, pencahayaan lampu neon hangat, gaya lukisan cat minyak."
              className="input-field font-mono text-sm leading-relaxed"
            />
            <div className="flex justify-between items-center mt-2 text-xs text-[#484641] font-mono">
              <span>{wordCount} kata</span>
              <span>Sebutkan objek utama, latar suasana, dan gaya visual</span>
            </div>
          </div>

          {/* Hasil Deteksi Parameter Prompt Secara Otomatis */}
          <div className="panel-muted p-3.5 space-y-2 text-xs">
            <div className="font-mono font-semibold uppercase tracking-wider text-[#141413]">
              Parameter Gambar yang Terdeteksi Otomatis
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono">
              <div className="p-2 rounded bg-white border border-[#C8C3B8]">
                <span className="block text-[11px] text-[#484641]">
                  Gaya Visual
                </span>
                <span className="font-semibold text-[#141413]">
                  {wordCount > 0 ? detectedMeta.style : "Ilustrasi Digital"}
                </span>
              </div>
              <div className="p-2 rounded bg-white border border-[#C8C3B8]">
                <span className="block text-[11px] text-[#484641]">
                  Suasana / Cahaya
                </span>
                <span className="font-semibold text-[#141413]">
                  {wordCount > 0 ? detectedMeta.mood : "Netral / Alami"}
                </span>
              </div>
              <div className="p-2 rounded bg-white border border-[#C8C3B8]">
                <span className="block text-[11px] text-[#484641]">
                  Mesin Render
                </span>
                <span className="font-semibold text-[#141413]">
                  {detectedMeta.modelLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || wordCount < 3}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Merender Gambar via Cloudflare Workers...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  Buat Gambar dari Prompt
                </>
              )}
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Pratinjau Gambar & Aksi Kunci */}
        <div className="lg:col-span-6 panel-frame p-5 sm:p-6 flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex items-center justify-between border-b border-[#C8C3B8] pb-3 mb-4">
              <h3 className="text-base font-bold">Pratinjau Gambar Soal</h3>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#EAE6DC] text-[#484641]">
                {loading
                  ? "Merender..."
                  : imageUrl
                  ? "Gambar Siap Dikunci"
                  : "Belum Dibuat"}
              </span>
            </div>

            {/* Loading Box */}
            {loading && (
              <div className="py-16 text-center space-y-3">
                <div className="inline-block w-8 h-8 border-3 border-[#141413] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-mono text-[#484641]">
                  Merender visual dengan Cloudflare Workers AI...
                </p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !imageUrl && (
              <div className="py-16 px-4 text-center panel-muted">
                <ImageIcon className="w-10 h-10 mx-auto text-[#8C887E] mb-2" />
                <p className="text-sm text-[#484641]">
                  Belum ada gambar. Tulis prompt di panel kiri lalu pilih tombol{" "}
                  <strong>Buat Gambar dari Prompt</strong>.
                </p>
              </div>
            )}

            {/* Image Preview Content */}
            {!loading && imageUrl && (
              <div className="space-y-3">
                <div className="p-2.5 rounded border border-[#141413] bg-[#F4F1EA] flex items-center justify-center overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Pratinjau gambar hasil prompt rahasia"
                    className="w-full h-auto max-h-[380px] object-contain rounded border border-[#141413] bg-[#141413]"
                  />
                </div>
                <div className="flex flex-wrap justify-between gap-2 text-xs font-mono text-[#484641]">
                  <span>Gaya: {detectedMeta.style}</span>
                  <span>Panjang Prompt: {wordCount} kata</span>
                </div>

                {imageSource === "canvas-fallback" ? (
                  <div className="p-2.5 rounded bg-[#FFF7ED] border border-[#FDBA74] text-xs text-[#9A3412]">
                    <div className="font-bold flex items-center gap-1.5 mb-0.5">
                      <span>⚠️ Menggunakan Simulasi Kanvas Lokal</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Kredensial AI (Agnes AI / Cloudflare) belum disetel di menu <strong>Set Worker</strong>. Gambar ini adalah placeholder kanvas 2D lokal, bukan hasil AI asli.
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded bg-[#F0FDF4] border border-[#86EFAC] text-xs text-[#166534] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Dihasilkan oleh AI Real ({imageSource || "AI Engine"})</span>
                    </div>
                    {englishPrompt && (
                      <p className="text-[11px] text-[#15803D] font-mono leading-relaxed">
                        Prompt dioptimalkan ke English untuk AI: &quot;{englishPrompt}&quot;
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-[#C8C3B8] pt-4 mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#484641]">
              Setelah dikunci, prompt asli disembunyikan dan hanya gambar ini yang tampil untuk ditebak tim lain.
            </p>
            <button
              type="button"
              onClick={handleLock}
              disabled={loading || !imageUrl}
              className="btn-primary w-full sm:w-auto shrink-0"
            >
              <Lock className="w-4 h-4" />
              Kunci Gambar &amp; Mulai Tebakan
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
