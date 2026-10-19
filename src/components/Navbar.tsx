"use client";

import React from "react";
import { Team } from "@/lib/types";
import { Settings, RotateCcw, Cloud } from "lucide-react";

interface NavbarProps {
  currentRound: number;
  totalRounds: number;
  teams: Team[];
  makerTeamIndex: number;
  gameActive: boolean;
  isSoloMode: boolean;
  onResetClick: () => void;
  onOpenSettings: () => void;
  workerConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRound,
  totalRounds,
  teams,
  makerTeamIndex,
  gameActive,
  isSoloMode,
  onResetClick,
  onOpenSettings,
  workerConnected,
}) => {
  return (
    <header className="border-b-2 border-[#141413] bg-[#141413] text-[#F4F1EA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="font-mono text-xs uppercase tracking-widest px-2.5 py-1 rounded bg-[#2B2B29] text-[#F4F1EA] border border-[#5A5852]">
            Meja Permainan
          </span>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">
              Rekonstruksi Prompt
            </h1>
            <p className="text-xs text-[#D0CCC3] hidden sm:block">
              Satu tim menyusun prompt soal, tim lain menebak instruksi dari gambar keluaran
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {gameActive && (
            <div className="flex items-center gap-2 bg-[#252523] border border-[#484641] px-3 py-1.5 rounded">
              <span className="text-xs text-[#D0CCC3]">Ronde</span>
              <span className="font-mono text-sm font-semibold text-white">
                {currentRound} / {totalRounds}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={onOpenSettings}
            title="Pengaturan Cloudflare Worker & AI"
            className={`text-xs font-mono px-3 py-2 rounded flex items-center gap-1.5 border min-h-[40px] transition-colors ${
              workerConnected
                ? "bg-[#165B33]/40 border-[#22C55E]/60 text-[#D8F3DC]"
                : "bg-[#252523] hover:bg-[#383835] text-[#F4F1EA] border-[#5A5852]"
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {workerConnected ? "Worker AI Aktif" : "Set Worker"}
            </span>
            <Settings className="w-3 h-3 sm:hidden" />
          </button>

          {gameActive && (
            <button
              type="button"
              onClick={onResetClick}
              className="text-xs font-mono px-3 py-2 rounded bg-[#252523] hover:bg-[#383835] text-[#F4F1EA] border border-[#5A5852] min-h-[40px] flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Atur Ulang Sesi</span>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Live Scoreboard Ribbon */}
      {gameActive && (
        <div className="bg-[#1F1F1D] border-t border-[#383835]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3 overflow-x-auto">
            {teams.map((team, idx) => {
              const isMaker = !isSoloMode && idx === makerTeamIndex;
              return (
                <div
                  key={team.id}
                  className={`flex items-center gap-2.5 px-3 py-1 rounded border text-xs font-mono shrink-0 ${
                    isMaker
                      ? "bg-[#2B2B29] border-[#B83214] text-white"
                      : "bg-[#141413] border-[#484641] text-[#EAE6DC]"
                  }`}
                >
                  <span className="font-sans font-semibold">
                    {team.name}
                    {isMaker ? " [Pembuat Soal]" : ""}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#2F2F2C] text-[#F4F1EA] font-semibold">
                    {team.score} poin
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
