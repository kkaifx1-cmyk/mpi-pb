"use client";

import React, { useState } from "react";
import { RoomState, MultiplayerTeam, MultiplayerSubmission } from "@/lib/types";
import { LeaderboardView } from "./LeaderboardView";
import { LeaderboardModal } from "./LeaderboardModal";
import { Trophy, ArrowRight, Plus, Minus, Maximize2, FileText, Check } from "lucide-react";

interface ControllerResultsViewProps {
  room: RoomState;
  teams: MultiplayerTeam[];
  submissions: MultiplayerSubmission[];
  onNextRound: () => Promise<void>;
  onAdjustScore: (submissionId: string, delta: number) => Promise<void>;
  onShowAlert: (msg: string, type?: "info" | "error" | "success") => void;
}

export const ControllerResultsView: React.FC<ControllerResultsViewProps> = ({
  room,
  teams,
  submissions,
  onNextRound,
  onAdjustScore,
  onShowAlert,
}) => {
  const [activeTab, setActiveTab] = useState<"leaderboard" | "submissions">("leaderboard");
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);

  const isFinalRound = room.currentRound >= room.totalRounds;

  const handleAdjust = async (subId: string, delta: number) => {
    setAdjustingId(subId);
    try {
      await onAdjustScore(subId, delta);
      onShowAlert(
        `Koreksi nilai (${delta > 0 ? `+${delta}` : delta} poin) berhasil diterapkan.`,
        "success"
      );
    } finally {
      setAdjustingId(null);
    }
  };

  const handleAdvance = async () => {
    setIsAdvancing(true);
    try {
      await onNextRound();
    } finally {
      setIsAdvancing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Tahap 3 */}
      <div className="panel-frame p-5 sm:p-6 bg-[#FFFFFF] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="step-pill bg-[#165B33] text-white">
              Tahap 3: Hasil dan Papan Skor
            </span>
            <span className="font-mono-tabular text-xs text-[#484641]">
              Ronde {room.currentRound} dari {room.totalRounds}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#141413]">
            Evaluasi Skor Rekonstruksi Prompt
          </h2>
          <p className="text-sm text-[#484641] mt-1 max-w-xl">
            Tinjau klasemen sementara seluruh tim atau buka rincian tebakan kalimat dan perolehan skor setiap tim.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsFullscreenModalOpen(true)}
            className="btn-secondary text-xs font-mono-tabular"
            title="Buka tampilan layar penuh proyektor"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Mode Layar Penuh</span>
          </button>

          <button
            type="button"
            disabled={isAdvancing}
            onClick={handleAdvance}
            className="btn-primary text-sm font-semibold"
          >
            <span>
              {isAdvancing
                ? "Memproses..."
                : isFinalRound
                ? "Lihat Klasemen Akhir"
                : `Lanjut ke Ronde ${room.currentRound + 1}`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[#C8C3B8] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("leaderboard")}
          className={`px-4 py-2 rounded-[6px] font-mono-tabular text-xs font-bold transition-colors min-h-[44px] flex items-center gap-2 ${
            activeTab === "leaderboard"
              ? "bg-[#141413] text-[#F4F1EA] border border-[#141413]"
              : "bg-white text-[#141413] border border-[#C8C3B8] hover:bg-[#EAE6DC]"
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Papan Skor Tim</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("submissions")}
          className={`px-4 py-2 rounded-[6px] font-mono-tabular text-xs font-bold transition-colors min-h-[44px] flex items-center gap-2 ${
            activeTab === "submissions"
              ? "bg-[#141413] text-[#F4F1EA] border border-[#141413]"
              : "bg-white text-[#141413] border border-[#C8C3B8] hover:bg-[#EAE6DC]"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Rincian Tebakan ({submissions.length})</span>
        </button>
      </div>

      {/* TAB 1: LEADERBOARD VIEW */}
      {activeTab === "leaderboard" && (
        <LeaderboardView
          teams={teams}
          submissions={submissions}
          makerTeamId={room.makerTeamId}
          currentRound={room.currentRound}
          totalRounds={room.totalRounds}
          isFinal={false}
        />
      )}

      {/* TAB 2: SUBMISSIONS DETAILS VIEW */}
      {activeTab === "submissions" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Kunci Jawaban Soal */}
          <div className="lg:col-span-5 panel-frame p-5 space-y-4">
            <div className="border-b border-[#C8C3B8] pb-2 flex items-center justify-between">
              <span className="font-mono-tabular text-xs uppercase font-semibold text-[#B83214]">
                Kunci Jawaban Soal
              </span>
              <span className="font-mono-tabular text-xs text-[#484641]">
                Pembuat: {room.makerTeamName}
              </span>
            </div>

            <div>
              <span className="text-xs font-mono-tabular text-[#484641] block mb-1">
                Prompt Asli Pembuat Soal:
              </span>
              <div className="p-3.5 rounded-[6px] border-2 border-[#141413] bg-[#EAE6DC] font-mono-tabular text-xs font-semibold leading-relaxed text-[#141413]">
                {room.secretPrompt || "(Prompt asli tidak tercatat)"}
              </div>
            </div>

            <div>
              <span className="text-xs font-mono-tabular text-[#484641] block mb-1">
                Gambar Keluaran yang Diberikan:
              </span>
              <div className="p-2.5 rounded-[6px] border border-[#141413] bg-[#F4F1EA] flex items-center justify-center overflow-hidden max-h-[300px]">
                {room.generatedImageUrl ? (
                  <img
                    src={room.generatedImageUrl}
                    alt="Gambar Soal Ronde Ini"
                    className="max-h-[280px] w-auto object-contain rounded-[4px]"
                  />
                ) : (
                  <span className="text-xs font-mono-tabular text-[#484641]">Tidak ada gambar</span>
                )}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Rincian Tebakan Tim & Koreksi Juri */}
          <div className="lg:col-span-7 space-y-4">
            {submissions.length === 0 ? (
              <div className="panel-frame p-8 text-center text-[#484641] panel-muted">
                <p className="text-sm font-mono-tabular">Belum ada tebakan yang masuk untuk ronde ini.</p>
              </div>
            ) : (
              submissions.map((sub, idx) => {
                const score = sub.score_data;
                const totalScore = score?.totalScore ?? 0;
                const isAdjusting = adjustingId === sub.id;

                return (
                  <div key={sub.id} className="panel-frame p-5 bg-white space-y-4 border-2 border-[#141413]">
                    {/* Header Tim & Total Skor */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C8C3B8] pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono-tabular text-xs font-bold w-6 h-6 rounded bg-[#141413] text-[#F4F1EA] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <h3 className="font-bold text-base text-[#141413]">{sub.team_name}</h3>
                          <span className="text-xs font-mono-tabular text-[#484641]">
                            Panjang tebakan: {sub.guessed_prompt.split(/\s+/).filter(Boolean).length} kata
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="block text-[11px] font-mono-tabular uppercase text-[#484641]">
                            Total Poin
                          </span>
                          <span className="font-mono-tabular text-2xl font-bold text-[#141413]">
                            {totalScore}
                            <span className="text-xs font-normal text-[#484641]"> / 100</span>
                          </span>
                        </div>

                        {/* Tombol Koreksi Juri */}
                        <div className="flex items-center gap-1 border-l border-[#C8C3B8] pl-2 ml-1">
                          <button
                            type="button"
                            disabled={isAdjusting}
                            onClick={() => handleAdjust(sub.id, -5)}
                            className="btn-secondary text-xs px-2 py-1 min-h-[36px]"
                            title="Kurangi nilai 5 poin"
                          >
                            <Minus className="w-3.5 h-3.5" />
                            <span>-5</span>
                          </button>
                          <button
                            type="button"
                            disabled={isAdjusting}
                            onClick={() => handleAdjust(sub.id, 5)}
                            className="btn-secondary text-xs px-2 py-1 min-h-[36px]"
                            title="Tambah nilai 5 poin"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+5</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Teks Tebakan Prompt Tim */}
                    <div>
                      <span className="text-xs font-mono-tabular text-[#484641] block mb-1">
                        Tebakan Prompt Tim:
                      </span>
                      <div className="p-3 rounded-[6px] border border-[#141413] bg-[#F4F1EA] font-mono-tabular text-xs leading-relaxed text-[#141413]">
                        {sub.guessed_prompt}
                      </div>
                    </div>

                    {/* Rincian 3 Komponen Nilai */}
                    {score && (
                      <div className="panel-muted p-3.5 space-y-2 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono-tabular">
                          <div className="p-2 rounded bg-white border border-[#C8C3B8]">
                            <span className="block text-[11px] text-[#484641]">Subjek &amp; Objek</span>
                            <span className="font-bold text-[#141413] text-sm">
                              {score.topicScore} <span className="text-[10px] text-[#484641]">/ 40</span>
                            </span>
                          </div>
                          <div className="p-2 rounded bg-white border border-[#C8C3B8]">
                            <span className="block text-[11px] text-[#484641]">Gaya &amp; Suasana</span>
                            <span className="font-bold text-[#141413] text-sm">
                              {score.styleScore} <span className="text-[10px] text-[#484641]">/ 35</span>
                            </span>
                          </div>
                          <div className="p-2 rounded bg-white border border-[#C8C3B8]">
                            <span className="block text-[11px] text-[#484641]">Komposisi &amp; Detail</span>
                            <span className="font-bold text-[#141413] text-sm">
                              {score.constraintScore} <span className="text-[10px] text-[#484641]">/ 25</span>
                            </span>
                          </div>
                        </div>

                        {/* Kata Kunci yang Cocok */}
                        {score.matchedTokens && score.matchedTokens.length > 0 && (
                          <div className="pt-1.5">
                            <span className="text-[11px] font-mono-tabular text-[#484641] block mb-1">
                              Kata Kunci yang Tepat Ditebak:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {score.matchedTokens.map((token, tIdx) => (
                                <span key={tIdx} className="token-match">
                                  {token}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal Layar Penuh */}
      <LeaderboardModal
        isOpen={isFullscreenModalOpen}
        onClose={() => setIsFullscreenModalOpen(false)}
        teams={teams}
        submissions={submissions}
        makerTeamId={room.makerTeamId}
        currentRound={room.currentRound}
        totalRounds={room.totalRounds}
        isFinal={isFinalRound}
        onNextRound={handleAdvance}
        isAdvancing={isAdvancing}
      />
    </div>
  );
};
