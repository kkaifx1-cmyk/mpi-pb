"use client";

import React, { useState, useEffect, useRef } from "react";
import { Team, DetectedMeta } from "@/lib/types";
import { countWords } from "@/lib/scoring";
import { Check, Send, Eye, RefreshCw } from "lucide-react";

interface GuesserViewProps {
  currentRound: number;
  totalRounds: number;
  teams: Team[];
  makerName: string;
  secretPrompt: string;
  generatedImageUrl: string;
  detectedMeta: DetectedMeta | null;
  guessingQueue: number[];
  activeGuesserCursor: number;
  onSubmitGuess: (guess: string) => Promise<void> | void;
  onShowAlert: (msg: string, type?: "info" | "error" | "success") => void;
}

export const GuesserView: React.FC<GuesserViewProps> = ({
  currentRound,
  totalRounds,
  teams,
  makerName,
  secretPrompt,
  generatedImageUrl,
  detectedMeta,
  guessingQueue,
  activeGuesserCursor,
  onSubmitGuess,
  onShowAlert,
}) => {
  const [guessText, setGuessText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeTeamIdx = guessingQueue[activeGuesserCursor];
  const activeTeam = teams[activeTeamIdx];
  const isLastGuesser = activeGuesserCursor + 1 >= guessingQueue.length;
  const wordCount = countWords(guessText);
  const secretWordCount = countWords(secretPrompt);

  useEffect(() => {
    setGuessText("");
    setIsSubmitting(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeGuesserCursor]);

  const handleSubmit = async () => {
    if (countWords(guessText) < 2) {
      onShowAlert(
        "Masukkan tebakan prompt gambar minimal 2 kata sebelum menyimpan.",
        "error"
      );
      inputRef.current?.focus();
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmitGuess(guessText.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6 animate-in fade-in duration-200">
      {/* Turn Progression Header */}
      <div className="panel-frame p-5 sm:p-6 bg-[#FFFFFF] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="step-pill bg-[#1D3557] text-white">
              Tahap 2: Giliran Menebak Prompt Gambar
            </span>
            <span className="font-mono text-xs text-[#484641]">
              Penebak {activeGuesserCursor + 1} dari {guessingQueue.length}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            Giliran Menebak:{" "}
            <span className="text-[#B83214] underline decoration-2 underline-offset-4">
              {activeTeam?.name}
            </span>
          </h2>
          <p className="text-sm text-[#484641] mt-1">
            Amati gambar keluaran di bawah, lalu susun tebakan kalimat prompt yang menurut tim Anda menghasilkan gambar tersebut.
          </p>
        </div>

        {/* Antrean Tim Penebak */}
        <div className="flex flex-wrap gap-2" aria-label="Antrean tim penebak">
          {guessingQueue.map((tIdx, i) => {
            const team = teams[tIdx];
            let statusStyle = "bg-[#EAE6DC] text-[#484641] border-[#C8C3B8]";
            let statusLabel = "Menunggu";

            if (i < activeGuesserCursor) {
              statusStyle = "bg-[#165B33] text-white border-[#141413]";
              statusLabel = "Terkirim";
            } else if (i === activeGuesserCursor) {
              statusStyle = "bg-[#B83214] text-white border-[#141413]";
              statusLabel = "Sedang Menebak";
            }

            return (
              <span
                key={team.id}
                className={`font-mono text-xs px-2.5 py-1 rounded border ${statusStyle}`}
              >
                {team.name}: {statusLabel}
              </span>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Bukti Gambar Hasil Prompt yang Dikunci */}
        <div className="lg:col-span-6 panel-frame p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#C8C3B8] pb-3">
            <div>
              <span className="font-mono text-xs uppercase text-[#484641]">
                Bukti Keluaran Visual
              </span>
              <h3 className="text-lg font-bold">Gambar Hasil Prompt</h3>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#EAE6DC] text-[#141413]">
              Soal oleh: {makerName}
            </span>
          </div>

          <div className="p-2.5 rounded border border-[#141413] bg-[#F4F1EA] flex items-center justify-center overflow-hidden min-h-[280px]">
            {generatedImageUrl ? (
              <img
                src={generatedImageUrl}
                alt="Gambar soal yang harus ditebak prompt aslinya"
                className="w-full h-auto max-h-[420px] object-contain rounded border border-[#141413] bg-[#141413]"
              />
            ) : (
              <div className="text-sm font-mono text-[#484641]">
                Memuat gambar soal...
              </div>
            )}
          </div>

          <div className="panel-muted p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#484641]">
            <span>
              Kategori Gaya: {detectedMeta?.style || "Visual Gambar"}
            </span>
            <span className="font-semibold text-[#141413]">
              Petunjuk: Prompt asli terdiri dari {secretWordCount} kata
            </span>
          </div>
        </div>

        {/* Kolom Kanan: Form Tebakan Tim Aktif */}
        <div className="lg:col-span-6 panel-frame p-5 sm:p-6 space-y-5">
          <div className="border-b border-[#C8C3B8] pb-3 flex items-center justify-between">
            <label htmlFor="teamGuess" className="text-lg font-bold">
              Tebakan Prompt dari {activeTeam?.name}
            </label>
            <span className="font-mono text-xs text-[#484641]">
              Input Rahasia Antar Tim
            </span>
          </div>

          <p className="text-xs text-[#484641]">
            Tuliskan perkiraan prompt sedetail mungkin: sebutkan objek utama, aktivitas, latar tempat, suasana pencahayaan, warna dominan, serta gaya visual gambar.
          </p>

          <div>
            <textarea
              id="teamGuess"
              ref={inputRef}
              rows={6}
              value={guessText}
              onChange={(e) => setGuessText(e.target.value)}
              disabled={isSubmitting}
              placeholder="Ketik tebakan kalimat prompt gambar dari tim Anda di sini..."
              className="input-field font-mono text-sm leading-relaxed disabled:opacity-60 disabled:bg-[#EAE6DC]"
            />
            <div className="flex justify-between items-center mt-2 text-xs font-mono text-[#484641]">
              <span>{wordCount} kata</span>
              <span>Tebakan akan langsung disembunyikan setelah dikirim</span>
            </div>
          </div>

          {isSubmitting && (
            <div className="p-3 rounded border border-[#165B33] bg-[#D8F3DC] text-[#081C15] flex items-center gap-2.5 text-xs font-mono animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-[#165B33] shrink-0" />
              <span>
                Sedang menganalisis struktur prompt dan merender gambar tebakan tim {activeTeam?.name}...
              </span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-[#484641]">
              {isLastGuesser
                ? "Ini adalah tim penebak terakhir pada ronde ini. Skor evaluasi dan visual kedua prompt akan langsung dikomparasikan."
                : `Setelah dikirim, giliran berikutnya adalah ${teams[guessingQueue[activeGuesserCursor + 1]]?.name}.`}
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={wordCount < 2 || isSubmitting}
              className="btn-primary w-full sm:w-auto shrink-0"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Menyimpan &amp; Merender Visual...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Simpan Tebakan Tim
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
