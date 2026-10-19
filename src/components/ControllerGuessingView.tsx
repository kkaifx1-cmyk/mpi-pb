"use client";

import React, { useState } from "react";
import { RoomState, MultiplayerTeam, MultiplayerSubmission } from "@/lib/types";
import { CountdownTimer } from "./CountdownTimer";
import { CheckCircle2, Clock, Play, Pause, PlusCircle, ArrowRight } from "lucide-react";

interface ControllerGuessingViewProps {
  room: RoomState;
  teams: MultiplayerTeam[];
  submissions: MultiplayerSubmission[];
  onTimerControl: (subAction: "PAUSE" | "RESUME" | "ADD_30" | "SKIP") => Promise<void>;
  onEvaluateRound: () => Promise<void>;
  onShowAlert: (msg: string, type?: "info" | "error" | "success") => void;
}

export const ControllerGuessingView: React.FC<ControllerGuessingViewProps> = ({
  room,
  teams,
  submissions,
  onTimerControl,
  onEvaluateRound,
  onShowAlert,
}) => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Non-maker teams are the guessers
  const guesserTeams = teams.filter((t) => t.id !== room.makerTeamId);
  const submittedTeamIds = new Set(submissions.map((s) => s.team_id));
  const allSubmitted = guesserTeams.length > 0 && guesserTeams.every((t) => submittedTeamIds.has(t.id));

  const handleTimerExpire = () => {
    setIsTimeUp(true);
    onShowAlert("Batas waktu menebak telah habis. Silakan evaluasi ronde ini.", "info");
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      await onEvaluateRound();
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Tahap 2 */}
      <div className="panel-frame p-5 sm:p-6 bg-[#FFFFFF] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="step-pill bg-[#1D3557] text-white">
              Tahap 2: Sesi Tebak Prompt Serentak
            </span>
            <span className="font-mono-tabular text-xs text-[#484641]">
              Ronde {room.currentRound} dari {room.totalRounds}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#141413]">
            Seluruh Tim Sedang Menyusun Tebakan
          </h2>
          <p className="text-sm text-[#484641] mt-1 max-w-xl">
            Tim penebak sedang mengamati gambar soal dan mengetikkan kalimat instruksi prompt pada perangkat masing-masing.
          </p>
        </div>

        {/* Live Countdown dan Kendali Waktu */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <CountdownTimer
            timerEndsAt={room.timerEndsAt}
            timerRemaining={room.timerRemaining}
            timerPaused={room.timerPaused}
            totalDuration={room.guessDuration}
            size="md"
            label="Sisa Waktu Menebak"
            onExpire={handleTimerExpire}
          />

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
              title="Tambah 30 detik"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+30s</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Gambar Soal di Kiri & Status Pengiriman Tebakan di Kanan */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Gambar Soal yang Ditampilkan */}
        <div className="lg:col-span-6 panel-frame p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#C8C3B8] pb-3">
            <div>
              <span className="font-mono-tabular text-xs uppercase text-[#484641]">
                Bukti Keluaran Visual
              </span>
              <h3 className="text-lg font-bold text-[#141413]">Gambar yang Ditebak</h3>
            </div>
            <span className="font-mono-tabular text-xs px-2.5 py-1 rounded bg-[#EAE6DC] text-[#141413]">
              Pembuat: {room.makerTeamName}
            </span>
          </div>

          <div className="p-3 rounded-[6px] border border-[#141413] bg-[#F4F1EA] flex items-center justify-center overflow-hidden min-h-[260px] max-h-[360px]">
            {room.generatedImageUrl ? (
              <img
                src={room.generatedImageUrl}
                alt="Gambar Soal yang Harus Ditebak"
                className="max-h-[340px] w-auto object-contain rounded-[4px]"
              />
            ) : (
              <p className="text-sm font-mono-tabular text-[#484641]">Gambar soal tidak tersedia.</p>
            )}
          </div>

          <div className="panel-muted p-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tabular text-[#484641]">
            <span>Sumber: {room.imageSource || "Generator Gambar"}</span>
            <span>Semua tim melihat gambar yang sama</span>
          </div>
        </div>

        {/* Kolom Kanan: Antrean dan Status Tebakan Seluruh Tim */}
        <div className="lg:col-span-6 panel-frame p-5 sm:p-6 flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="border-b border-[#C8C3B8] pb-3 mb-4 flex items-center justify-between">
              <div>
                <span className="font-mono-tabular text-xs uppercase text-[#484641]">
                  Progres Penebak
                </span>
                <h3 className="text-lg font-bold text-[#141413]">
                  Status Pengiriman Tebakan ({submissions.length}/{guesserTeams.length})
                </h3>
              </div>
              <span
                className={`font-mono-tabular text-xs font-semibold px-2.5 py-1 rounded ${
                  allSubmitted
                    ? "bg-[#D8F3DC] text-[#081C15] border border-[#52B788]"
                    : "bg-[#EAE6DC] text-[#141413]"
                }`}
              >
                {allSubmitted ? "Semua Terkumpul" : "Menunggu Input"}
              </span>
            </div>

            {/* List Tim Penebak */}
            <div className="space-y-3" role="list" aria-label="Status pengiriman tebakan tim">
              {guesserTeams.map((team) => {
                const isSubmitted = submittedTeamIds.has(team.id);
                return (
                  <div
                    key={team.id}
                    className={`flex items-center justify-between p-3.5 rounded-[6px] border transition-colors ${
                      isSubmitted
                        ? "bg-[#FFFFFF] border-[#165B33]"
                        : "bg-[#FFFFFF] border-[#C8C3B8]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-[4px] font-mono-tabular text-xs font-bold flex items-center justify-center shrink-0 ${
                          isSubmitted
                            ? "bg-[#165B33] text-white"
                            : "bg-[#EAE6DC] text-[#484641]"
                        }`}
                      >
                        {isSubmitted ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <Clock className="w-4 h-4 text-[#484641]" />
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-[#141413]">{team.name}</h4>
                    </div>

                    <span
                      className={`text-xs font-mono-tabular px-2.5 py-1 rounded ${
                        isSubmitted
                          ? "bg-[#D8F3DC] text-[#081C15] border border-[#52B788] font-semibold"
                          : "bg-[#EAE6DC] text-[#484641]"
                      }`}
                    >
                      {isSubmitted ? "Tebakan Masuk" : "Mengetik..."}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tombol Evaluasi Ronde */}
          <div className="border-t border-[#C8C3B8] pt-4 mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#484641]">
              {allSubmitted
                ? "Semua tim telah mengirimkan tebakan. Klik tombol di bawah untuk evaluasi."
                : isTimeUp
                ? "Waktu telah habis. Anda dapat mengevaluasi tebakan yang telah masuk sekarang."
                : "Anda dapat menunggu semua tim selesai atau menutup sesi tebak secara manual."}
            </p>

            <button
              type="button"
              disabled={isEvaluating}
              onClick={handleEvaluate}
              className="btn-primary w-full sm:w-auto shrink-0"
            >
              <span>{isEvaluating ? "Menghitung Nilai..." : "Evaluasi dan Buka Papan Skor"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
