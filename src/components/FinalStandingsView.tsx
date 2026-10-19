"use client";

import React from "react";
import { Team, RoundHistoryItem } from "@/lib/types";
import { Trophy, RotateCcw, UserPlus } from "lucide-react";

interface FinalStandingsViewProps {
  teams: Team[];
  roundHistory: RoundHistoryItem[];
  onPlayAgainSameTeams: () => void;
  onBackToSetup: () => void;
}

export const FinalStandingsView: React.FC<FinalStandingsViewProps> = ({
  teams,
  roundHistory,
  onPlayAgainSameTeams,
  onBackToSetup,
}) => {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  return (
    <section className="space-y-6 animate-in fade-in duration-200">
      <div className="panel-frame p-6 sm:p-8">
        <div className="border-b border-[#C8C3B8] pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-[#B83214]" />
              <span className="font-mono text-xs uppercase tracking-wider text-[#484641]">
                Rekapitulasi Sesi
              </span>
            </div>
            <h2 className="text-3xl font-bold mt-0.5">
              Klasemen Akhir Rekonstruksi Prompt
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onPlayAgainSameTeams}
              className="btn-secondary"
            >
              <RotateCcw className="w-4 h-4" />
              Main Lagi dengan Tim Ini
            </button>
            <button
              type="button"
              onClick={onBackToSetup}
              className="btn-primary"
            >
              <UserPlus className="w-4 h-4" />
              Konfigurasi Tim Baru
            </button>
          </div>
        </div>

        {/* Tabel Klasemen */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse border border-[#141413]">
            <thead>
              <tr className="bg-[#141413] text-[#F4F1EA] font-mono text-xs uppercase">
                <th className="py-3 px-4 border border-[#383835]">Peringkat</th>
                <th className="py-3 px-4 border border-[#383835]">Nama Tim</th>
                <th className="py-3 px-4 border border-[#383835]">Jumlah Menebak</th>
                <th className="py-3 px-4 border border-[#383835]">Rata-Rata Akurasi</th>
                <th className="py-3 px-4 border border-[#383835] text-right">Total Poin</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {sortedTeams.map((team, idx) => {
                const avg =
                  team.guessesCount > 0
                    ? Math.round(team.totalAccuracy / team.guessesCount)
                    : 0;
                const isWinner = idx === 0;

                return (
                  <tr
                    key={team.id}
                    className={
                      isWinner
                        ? "bg-[#EAE6DC] font-semibold"
                        : idx % 2 === 0
                        ? "bg-white"
                        : "bg-[#FAF8F5]"
                    }
                  >
                    <td className="py-3.5 px-4 border border-[#C8C3B8] font-mono">
                      <span className="inline-flex items-center gap-1.5">
                        {isWinner && <Trophy className="w-4 h-4 text-[#B83214]" />}
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 border border-[#C8C3B8]">
                      {team.name}
                    </td>
                    <td className="py-3.5 px-4 border border-[#C8C3B8] font-mono">
                      {team.guessesCount} kali
                    </td>
                    <td className="py-3.5 px-4 border border-[#C8C3B8] font-mono">
                      {avg} / 100
                    </td>
                    <td className="py-3.5 px-4 border border-[#C8C3B8] font-mono text-right text-base font-bold text-[#165B33]">
                      {team.score} poin
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Arsip Riwayat Ronde */}
        <div>
          <h3 className="text-lg font-bold mb-3">Arsip Ronde pada Sesi Ini</h3>
          <div className="space-y-3">
            {roundHistory.map((round) => (
              <div
                key={round.roundNumber}
                className="panel-muted p-4 space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
                  <span className="font-bold text-[#141413]">
                    Ronde {round.roundNumber}: Pembuat Soal: {round.makerName}
                  </span>
                </div>
                <div className="font-mono text-[#141413]">
                  <strong>Prompt Gambar Asli:</strong> &quot;{round.secretPrompt}&quot;
                </div>
                <div className="text-[#484641] leading-relaxed space-y-1">
                  <div className="font-semibold text-[#141413]">Hasil Tebakan &amp; Evaluasi:</div>
                  <div className="space-y-1 pl-2 border-l-2 border-[#C8C3B8]">
                    {round.submissions.map((s) => (
                      <div key={s.teamIndex} className="font-mono">
                        <strong className="text-[#141413]">{s.teamName}:</strong>{" "}
                        <span className="text-[#165B33] font-bold">
                          +{s.scoreData.totalScore} poin
                        </span>{" "}
                        <span className="text-[#484641]">
                          [Kemiripan: {s.scoreData.similarityScore ?? s.scoreData.totalScore}/100 | PE: {s.scoreData.peScore ?? s.scoreData.totalScore}/100]
                        </span>{" "}
                        : &quot;{s.guessedPrompt}&quot;
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
