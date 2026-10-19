"use client";

import React, { useEffect } from "react";
import { CountdownTimer } from "./CountdownTimer";
import { Eye, Play, Pause, PlusCircle, ArrowRight } from "lucide-react";

interface DiscussionModalProps {
  isOpen: boolean;
  isController?: boolean;
  currentRound: number;
  totalRounds: number;
  makerTeamName: string;
  imageUrl: string;
  secretPrompt?: string; // Visible only to controller
  timerEndsAt: string | null;
  timerRemaining: number | null;
  timerPaused: boolean;
  totalDuration: number;
  onTimerControl?: (subAction: "PAUSE" | "RESUME" | "ADD_30" | "SKIP") => void;
  onStartGuessing?: () => void;
}

export const DiscussionModal: React.FC<DiscussionModalProps> = ({
  isOpen,
  isController = false,
  currentRound,
  totalRounds,
  makerTeamName,
  imageUrl,
  secretPrompt,
  timerEndsAt,
  timerRemaining,
  timerPaused,
  totalDuration,
  onTimerControl,
  onStartGuessing,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalDiscussionTitle"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70"
    >
      <div className="panel-frame max-w-4xl w-full max-h-[92vh] flex flex-col bg-white border-2 border-[#141413] overflow-hidden">
        {/* Header Meja Kendali / Diskusi */}
        <div className="border-b-2 border-[#141413] bg-[#141413] text-[#F4F1EA] px-5 py-4 sm:px-6 sm:py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="step-pill bg-[#1D3557] text-white">
                Fase Diskusi Tim
              </span>
              <span className="font-mono-tabular text-xs text-[#D0CCC3]">
                Ronde {currentRound} dari {totalRounds}
              </span>
            </div>
            <h2 id="modalDiscussionTitle" className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F1EA]">
              Amati dan Diskusikan Gambar Soal
            </h2>
            <p className="text-xs text-[#D0CCC3] mt-0.5">
              Soal disusun oleh <strong className="text-white underline">{makerTeamName}</strong>
            </p>
          </div>

          {/* Timer Display */}
          <CountdownTimer
            timerEndsAt={timerEndsAt}
            timerRemaining={timerRemaining}
            timerPaused={timerPaused}
            totalDuration={totalDuration}
            size="md"
            label="Sisa Waktu Diskusi"
          />
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col md:flex-row items-center gap-6 bg-[#F4F1EA]">
          {/* Gambar Soal */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
            <div className="p-2 rounded-[6px] border border-[#141413] bg-white max-h-[380px] w-full flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Tantangan Gambar Soal"
                  className="w-full h-auto max-h-[360px] object-contain rounded-[4px]"
                />
              ) : (
                <div className="p-12 text-center text-[#484641] font-mono-tabular text-sm">
                  Menyiapkan visual gambar...
                </div>
              )}
            </div>
          </div>

          {/* Panduan Diskusi & Catatan Controller */}
          <div className="w-full md:w-1/2 flex flex-col justify-between space-y-4">
            <div className="panel-frame p-5 bg-white space-y-3">
              <h3 className="font-bold text-[#141413] text-base flex items-center gap-2 border-b border-[#C8C3B8] pb-2">
                Panduan Pengamatan Gambar
              </h3>
              <ul className="text-xs text-[#484641] space-y-2 list-disc pl-4 leading-relaxed">
                <li>
                  <strong>Identifikasi Objek:</strong> Kenali karakter, latar tempat, warna dominan, dan aktivitas utama.
                </li>
                <li>
                  <strong>Amati Medium Seni:</strong> Apakah berupa foto, lukisan cat minyak, ilustrasi digital, atau poster retro?
                </li>
                <li>
                  <strong>Pencahayaan &amp; Suasana:</strong> Perhatikan sudut datang cahaya, bayangan, waktu hari, dan cuaca.
                </li>
                <li>
                  <strong>Perhatian:</strong> Jangan mulai mengetik prompt sebelum fase menebak resmi dibuka.
                </li>
              </ul>
            </div>

            {/* Bocoran Prompt Asli Khusus Controller */}
            {isController && secretPrompt && (
              <div className="panel-muted p-4 space-y-1 text-xs">
                <span className="font-mono-tabular font-bold uppercase text-[#B83214] block">
                  Kunci Prompt Rahasia (Hanya Tampil di Layar Controller)
                </span>
                <p className="font-mono-tabular text-xs text-[#141413] leading-relaxed">
                  {secretPrompt}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Kendali (Khusus Controller) */}
        {isController && (
          <div className="border-t border-[#C8C3B8] bg-white px-5 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {onTimerControl && (
                <>
                  <button
                    type="button"
                    onClick={() => onTimerControl(timerPaused ? "RESUME" : "PAUSE")}
                    className="btn-secondary text-xs font-mono-tabular"
                  >
                    {timerPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    <span>{timerPaused ? "Lanjutkan" : "Jeda"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onTimerControl("ADD_30")}
                    className="btn-secondary text-xs font-mono-tabular"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+30s</span>
                  </button>
                </>
              )}
            </div>

            {onStartGuessing && (
              <button
                type="button"
                onClick={onStartGuessing}
                className="btn-primary text-sm"
              >
                <span>Buka Sesi Tebak Prompt Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
