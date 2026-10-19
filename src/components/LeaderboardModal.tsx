"use client";

import React, { useEffect } from "react";
import { MultiplayerTeam, MultiplayerSubmission } from "@/lib/types";
import { LeaderboardView } from "./LeaderboardView";
import { X, ArrowRight, Trophy } from "lucide-react";

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: MultiplayerTeam[];
  submissions?: MultiplayerSubmission[];
  makerTeamId?: string | null;
  currentRound?: number;
  totalRounds?: number;
  isFinal?: boolean;
  onNextRound?: () => Promise<void>;
  isAdvancing?: boolean;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  teams,
  submissions = [],
  makerTeamId = null,
  currentRound = 1,
  totalRounds = 3,
  isFinal = false,
  onNextRound,
  isAdvancing = false,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalLeaderboardTitle"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70"
    >
      <div className="panel-frame max-w-6xl w-full max-h-[95vh] flex flex-col bg-[#F4F1EA] border-2 border-[#141413] overflow-hidden">
        {/* Header Meja Kendali Modal */}
        <div className="border-b-2 border-[#141413] bg-[#141413] text-[#F4F1EA] px-5 py-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="step-pill bg-[#2B2B29] text-[#F4F1EA] border border-[#5A5852]">
              Layar Proyektor
            </span>
            <div>
              <h2 id="modalLeaderboardTitle" className="text-lg sm:text-xl font-bold tracking-tight text-[#F4F1EA]">
                Papan Peringkat Sesi
              </h2>
              <span className="font-mono-tabular text-xs text-[#D0CCC3]">
                Ronde {currentRound} dari {totalRounds}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNextRound && (
              <button
                type="button"
                disabled={isAdvancing}
                onClick={onNextRound}
                className="btn-primary text-xs font-mono-tabular min-h-[40px] px-3 py-1.5"
              >
                <span>
                  {isAdvancing
                    ? "Memuat..."
                    : isFinal
                    ? "Lihat Pemenang Akhir"
                    : `Lanjut ke Ronde ${currentRound + 1}`}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              title="Tutup jendela (Esc)"
              className="px-3 py-2 rounded bg-[#252523] hover:bg-[#383835] text-[#F4F1EA] text-xs font-mono-tabular border border-[#5A5852] min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
              aria-label="Tutup jendela"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          <LeaderboardView
            teams={teams}
            submissions={submissions}
            makerTeamId={makerTeamId}
            currentRound={currentRound}
            totalRounds={totalRounds}
            isFinal={isFinal}
          />
        </div>
      </div>
    </div>
  );
};
