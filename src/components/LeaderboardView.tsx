"use client";

import React from "react";
import { MultiplayerTeam, MultiplayerSubmission } from "@/lib/types";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

interface LeaderboardViewProps {
  teams: MultiplayerTeam[];
  submissions?: MultiplayerSubmission[];
  makerTeamId?: string | null;
  currentRound?: number;
  totalRounds?: number;
  isFinal?: boolean;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  teams,
  submissions = [],
  makerTeamId = null,
  currentRound = 1,
  totalRounds = 3,
  isFinal = false,
}) => {
  // Sort teams by total score descending, then by total accuracy
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.total_accuracy || 0) - (a.total_accuracy || 0);
  });

  const winner = sortedTeams[0];
  const runnerUp = sortedTeams[1];
  const third = sortedTeams[2];

  const getRoundPoints = (teamId: string): number | null => {
    const sub = submissions.find((s) => s.team_id === teamId);
    return sub?.score_data?.totalScore ?? null;
  };

  return (
    <div className="space-y-6">
      {/* Kartu Ringkasan Papan Skor Editorial */}
      <div className="panel-frame p-6 sm:p-8 bg-white border-2 border-[#141413]">
        <div className="border-b border-[#C8C3B8] pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="step-pill bg-[#141413] text-white">
              {isFinal ? "Klasemen Akhir Sesi" : `Papan Skor Sementara: Ronde ${currentRound} dari ${totalRounds}`}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-1 text-[#141413]">
              {isFinal ? "Peringkat Juara Sesi Ini" : "Peringkat Perolehan Poin Tim"}
            </h2>
            <p className="text-xs sm:text-sm text-[#484641] mt-0.5">
              {isFinal
                ? "Akumulasi skor seluruh ronde telah dihitung dan diverifikasi."
                : "Akumulasi total poin dari ketepatan instruksi prompt tebakan."}
            </p>
          </div>

          <div className="font-mono-tabular text-xs text-[#484641] bg-[#EAE6DC] px-3 py-1.5 rounded border border-[#C8C3B8]">
            Total {sortedTeams.length} Tim Berpartisipasi
          </div>
        </div>

        {/* Podium Tiga Teratas */}
        {sortedTeams.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 items-end">
            {/* Peringkat 2 */}
            {runnerUp && (
              <div className="panel-muted p-5 text-center order-2 sm:order-1 flex flex-col items-center border border-[#141413]">
                <div className="w-10 h-10 rounded-[4px] bg-white border border-[#C8C3B8] flex items-center justify-center mb-2">
                  <Medal className="w-5 h-5 text-[#484641]" />
                </div>
                <span className="font-mono-tabular text-[11px] font-bold uppercase tracking-wider text-[#484641]">
                  Peringkat 2
                </span>
                <h3 className="font-bold text-base text-[#141413] mt-1 truncate max-w-full">
                  {runnerUp.name}
                </h3>
                <div className="font-mono-tabular text-2xl font-bold text-[#141413] mt-1">
                  {runnerUp.score} <span className="text-xs font-normal text-[#484641]">Poin</span>
                </div>
                {getRoundPoints(runnerUp.id) !== null && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-mono-tabular text-[#165B33] bg-[#D8F3DC] px-2 py-0.5 rounded border border-[#52B788]">
                    <TrendingUp className="w-3 h-3" /> +{getRoundPoints(runnerUp.id)} ronde ini
                  </span>
                )}
              </div>
            )}

            {/* Peringkat 1 (Pemenang Utama) */}
            {winner && (
              <div className="panel-frame p-6 text-center order-1 sm:order-2 flex flex-col items-center border-2 border-[#141413] bg-[#FFFFFF] shadow-sm">
                <div className="w-12 h-12 rounded-[4px] bg-[#141413] text-[#F4F1EA] flex items-center justify-center mb-2">
                  <Trophy className="w-6 h-6 text-[#F4F1EA]" />
                </div>
                <span className="step-pill bg-[#B83214] text-white">
                  Peringkat 1
                </span>
                <h3 className="font-bold text-xl text-[#141413] mt-2 truncate max-w-full">
                  {winner.name}
                </h3>
                <div className="font-mono-tabular text-3xl font-bold text-[#141413] mt-1">
                  {winner.score} <span className="text-xs font-normal text-[#484641]">Poin</span>
                </div>
                {getRoundPoints(winner.id) !== null && (
                  <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-mono-tabular text-[#165B33] bg-[#D8F3DC] px-2.5 py-0.5 rounded border border-[#52B788]">
                    <TrendingUp className="w-3 h-3" /> +{getRoundPoints(winner.id)} ronde ini
                  </span>
                )}
              </div>
            )}

            {/* Peringkat 3 */}
            {third && (
              <div className="panel-muted p-5 text-center order-3 sm:order-3 flex flex-col items-center border border-[#141413]">
                <div className="w-10 h-10 rounded-[4px] bg-white border border-[#C8C3B8] flex items-center justify-center mb-2">
                  <Award className="w-5 h-5 text-[#484641]" />
                </div>
                <span className="font-mono-tabular text-[11px] font-bold uppercase tracking-wider text-[#484641]">
                  Peringkat 3
                </span>
                <h3 className="font-bold text-base text-[#141413] mt-1 truncate max-w-full">
                  {third.name}
                </h3>
                <div className="font-mono-tabular text-2xl font-bold text-[#141413] mt-1">
                  {third.score} <span className="text-xs font-normal text-[#484641]">Poin</span>
                </div>
                {getRoundPoints(third.id) !== null && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-mono-tabular text-[#165B33] bg-[#D8F3DC] px-2 py-0.5 rounded border border-[#52B788]">
                    <TrendingUp className="w-3 h-3" /> +{getRoundPoints(third.id)} ronde ini
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tabel Klasemen Seluruh Tim */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-[#141413]">
            <thead>
              <tr className="bg-[#141413] text-[#F4F1EA] font-mono-tabular text-xs uppercase">
                <th className="py-3 px-4 border border-[#383835]">Posisi</th>
                <th className="py-3 px-4 border border-[#383835]">Nama Tim</th>
                <th className="py-3 px-4 border border-[#383835] text-center">Poin Ronde Ini</th>
                <th className="py-3 px-4 border border-[#383835] text-right">Total Poin</th>
              </tr>
            </thead>
            <tbody className="text-sm font-mono-tabular">
              {sortedTeams.map((team, idx) => {
                const roundPts = getRoundPoints(team.id);
                const isMaker = team.id === makerTeamId;

                return (
                  <tr
                    key={team.id}
                    className={`border-b border-[#C8C3B8] ${
                      idx === 0
                        ? "bg-[#FFFFFF] font-bold"
                        : idx % 2 === 1
                        ? "bg-[#F4F1EA]"
                        : "bg-white"
                    }`}
                  >
                    <td className="py-3 px-4 border-r border-[#C8C3B8]">
                      <span className="font-bold">#{idx + 1}</span>
                    </td>
                    <td className="py-3 px-4 border-r border-[#C8C3B8] font-sans font-semibold text-[#141413]">
                      <div className="flex items-center gap-2">
                        <span>{team.name}</span>
                        {isMaker && (
                          <span className="font-mono-tabular text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#EAE6DC] text-[#484641] border border-[#C8C3B8]">
                            Pembuat
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-r border-[#C8C3B8] text-center">
                      {isMaker ? (
                        <span className="text-xs text-[#484641]">Pembuat Soal</span>
                      ) : roundPts !== null ? (
                        <span className="font-bold text-[#165B33]">+{roundPts}</span>
                      ) : (
                        <span className="text-[#484641]">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-base text-[#141413]">
                      {team.score}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
