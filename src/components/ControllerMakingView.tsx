"use client";

import React, { useState } from "react";
import { RoomState } from "@/lib/types";
import { CURATED_CHALLENGES } from "@/lib/constants";
import { CountdownTimer } from "./CountdownTimer";
import { Lock, Play, Pause, PlusCircle, AlertCircle, Wand2 } from "lucide-react";

interface ControllerMakingViewProps {
  room: RoomState;
  onLockAndDiscuss: (data: {
    secretPrompt?: string;
    generatedImageUrl?: string;
    imageSource?: string;
    englishPrompt?: string;
  }) => Promise<void>;
  onGenerateFallback: (promptText: string) => Promise<void>;
  onTimerControl?: (subAction: "PAUSE" | "RESUME" | "ADD_30" | "SKIP") => Promise<void> | void;
  onShowAlert: (msg: string, type?: "info" | "error" | "success") => void;
}

export const ControllerMakingView: React.FC<ControllerMakingViewProps> = ({
  room,
  onLockAndDiscuss,
  onGenerateFallback,
  onTimerControl,
  onShowAlert,
}) => {
  const [isLocking, setIsLocking] = useState(false);
  const [isGeneratingAuto, setIsGeneratingAuto] = useState(false);

  const hasImage = Boolean(room.generatedImageUrl);

  const handleLock = async () => {
    if (!hasImage) {
      onShowAlert(
        "Gambar soal belum tersedia. Tunggu tim pembuat menyusun prompt atau gunakan opsi soal kurasi.",
        "error"
      );
      return;
    }

    setIsLocking(true);
    try {
      await onLockAndDiscuss({});
    } finally {
      setIsLocking(false);
    }
  };

  const handleCuratedChallenge = async () => {
    setIsGeneratingAuto(true);
    try {
      const challenge = CURATED_CHALLENGES[(room.currentRound - 1) % CURATED_CHALLENGES.length];
      await onGenerateFallback(challenge.prompt);
      onShowAlert("Gambar soal otomatis berhasil dibangkitkan dari kurasi studio.", "success");
    } finally {
      setIsGeneratingAuto(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Tahap 1 */}
      <div className="panel-frame p-5 sm:p-6 bg-[#FFFFFF] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="step-pill bg-[#B83214] text-white">
              Tahap 1: Pembuatan Soal Gambar
            </span>
            <span className="font-mono-tabular text-xs text-[#484641]">
              Ronde {room.currentRound} dari {room.totalRounds}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#141413]">
            Giliran Tim Pembuat:{" "}
            <span className="underline decoration-2 underline-offset-4 text-[#B83214]">
              {room.makerTeamName || "Menunggu Tim"}
            </span>
          </h2>
          <p className="text-sm text-[#484641] mt-1 max-w-xl">
            Tim pembuat sedang merumuskan kalimat prompt pada perangkat mereka. Gambar yang berhasil dibuat akan otomatis terpratinjau di bawah.
          </p>
        </div>

        {/* Live Timer dan Kendali Waktu */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <CountdownTimer
            timerEndsAt={room.timerEndsAt}
            timerRemaining={room.timerRemaining}
            timerPaused={room.timerPaused}
            totalDuration={room.makerDuration || 120}
            size="md"
          />

          {onTimerControl && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onTimerControl(room.timerPaused ? "RESUME" : "PAUSE")}
                className="btn-secondary text-xs font-mono-tabular"
                title={room.timerPaused ? "Lanjutkan hitung mundur" : "Jeda hitung mundur"}
              >
                {room.timerPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{room.timerPaused ? "Lanjut" : "Jeda"}</span>
              </button>

              <button
                type="button"
                onClick={() => onTimerControl("ADD_30")}
                className="btn-secondary text-xs font-mono-tabular"
                title="Tambah waktu 30 detik"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+30s</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Status Pembuat di Kiri & Pratinjau Gambar di Kanan */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Panduan & Opsi Bantuan */}
        <div className="lg:col-span-6 panel-frame p-5 sm:p-6 space-y-5">
          <div className="border-b border-[#C8C3B8] pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#141413]">
              Pemantauan Tim Pembuat
            </h3>
            <span className="font-mono-tabular text-xs px-2.5 py-1 rounded bg-[#EAE6DC] text-[#141413]">
              {room.makerTeamName}
            </span>
          </div>

          <div className="panel-muted p-4 space-y-2 text-xs">
            <span className="font-mono-tabular font-semibold uppercase tracking-wider text-[#141413] block">
              Petunjuk untuk Pengawas Sesi
            </span>
            <ul className="text-[#484641] space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Pastikan tim penebak tidak melihat layar proyektor saat prompt sedang diketik.</li>
              <li>Jika tim pembuat mengalami kendala jaringan atau kehabisan ide, Controller dapat mengisi soal kurasi studio menggunakan tombol di bawah.</li>
              <li>Setelah gambar tampil sesuai, klik tombol <strong>Kunci Gambar dan Buka Diskusi</strong>.</li>
            </ul>
          </div>

          {/* Prompt Rahasia (Hanya Controller yang Dapat Melihat) */}
          {room.secretPrompt ? (
            <div className="space-y-1.5">
              <span className="font-mono-tabular text-xs font-semibold uppercase tracking-wider text-[#484641]">
                Draf Prompt dari Pembuat (Rahasia)
              </span>
              <div className="p-3.5 rounded-[6px] border border-[#141413] bg-[#EAE6DC] font-mono-tabular text-xs leading-relaxed text-[#141413]">
                {room.secretPrompt}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-[6px] border border-dashed border-[#C8C3B8] text-xs font-mono-tabular text-[#484641] text-center">
              Menunggu input prompt dari {room.makerTeamName}...
            </div>
          )}

          {/* Tombol Cadangan Soal Kurasi */}
          <div className="pt-2 border-t border-[#C8C3B8] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-[#484641]">Kendala waktu atau jaringan?</span>
            <button
              type="button"
              disabled={isGeneratingAuto}
              onClick={handleCuratedChallenge}
              className="btn-secondary text-xs font-mono-tabular w-full sm:w-auto"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{isGeneratingAuto ? "Merender..." : "Pakai Soal Kurasi Studio"}</span>
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Pratinjau Gambar Soal & Tombol Kunci */}
        <div className="lg:col-span-6 panel-frame p-5 sm:p-6 flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex items-center justify-between border-b border-[#C8C3B8] pb-3 mb-4">
              <h3 className="text-base font-bold text-[#141413]">
                Pratinjau Gambar Soal
              </h3>
              <span
                className={`font-mono-tabular text-xs px-2.5 py-0.5 rounded ${
                  hasImage
                    ? "bg-[#D8F3DC] text-[#081C15] border border-[#52B788]"
                    : "bg-[#EAE6DC] text-[#484641]"
                }`}
              >
                {hasImage ? "Gambar Siap" : "Menunggu Dibuat"}
              </span>
            </div>

            {/* Container Gambar */}
            {hasImage ? (
              <div className="space-y-3">
                <div className="p-3 rounded-[6px] border border-[#141413] bg-[#F4F1EA] flex items-center justify-center overflow-hidden max-h-[320px]">
                  <img
                    src={room.generatedImageUrl}
                    alt="Pratinjau gambar soal"
                    className="max-h-[300px] w-auto object-contain rounded-[4px]"
                  />
                </div>
                <div className="flex flex-wrap justify-between items-center text-xs font-mono-tabular text-[#484641]">
                  <span>Sumber: {room.imageSource || "Generator Gambar"}</span>
                  <span className="text-[#165B33] font-semibold">Siap dikunci untuk ditebak tim lain</span>
                </div>
              </div>
            ) : (
              <div className="py-16 px-4 text-center panel-muted">
                <p className="text-sm text-[#484641]">
                  Belum ada gambar yang dibangkitkan. Gambar akan otomatis muncul di sini setelah tim pembuat menekan tombol buat pada perangkat mereka.
                </p>
              </div>
            )}
          </div>

          {/* Tombol Kunci Gambar */}
          <div className="border-t border-[#C8C3B8] pt-4 mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#484641]">
              Setelah dikunci, prompt asli disembunyikan dan fase diskusi dibuka.
            </p>
            <button
              type="button"
              disabled={!hasImage || isLocking}
              onClick={handleLock}
              className="btn-primary w-full sm:w-auto shrink-0"
            >
              <Lock className="w-4 h-4" />
              <span>{isLocking ? "Mengunci Soal..." : "Kunci Gambar dan Buka Diskusi"}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
