"use client";

import React, { useState } from "react";
import { Copy, Check, ExternalLink, RotateCcw, Settings, Wifi, Trophy } from "lucide-react";

interface ControllerNavbarProps {
  roomCode: string;
  currentRound: number;
  totalRounds: number;
  isConnected: boolean;
  onNewRoom: () => void;
  onOpenSettings: () => void;
  onOpenLeaderboard?: () => void;
  onShowAlert: (msg: string, type?: "info" | "error" | "success") => void;
}

export const ControllerNavbar: React.FC<ControllerNavbarProps> = ({
  roomCode,
  currentRound,
  totalRounds,
  isConnected,
  onNewRoom,
  onOpenSettings,
  onOpenLeaderboard,
  onShowAlert,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:9000";
    const playerUrl = `${origin}/play?room=${roomCode}`;
    navigator.clipboard.writeText(playerUrl);
    setCopied(true);
    onShowAlert("Tautan pemain berhasil disalin.", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="border-b-2 border-[#141413] bg-[#141413] text-[#F4F1EA] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Identitas Meja Kendali */}
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="font-mono-tabular text-xs uppercase tracking-widest px-2.5 py-1 rounded bg-[#2B2B29] text-[#F4F1EA] border border-[#5A5852]">
            Meja Kendali
          </span>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#F4F1EA]">
              Rekonstruksi Prompt
            </h1>
            <p className="text-xs text-[#D0CCC3] hidden sm:block">
              Pusat kendali ronde, konfigurasi generator, dan penilaian tim
            </p>
          </div>
        </div>

        {/* Status Ruangan dan Tombol Aksi */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Badge Ronde */}
          <div className="flex items-center gap-2 bg-[#252523] border border-[#484641] px-3 py-1.5 rounded min-h-[44px]">
            <span className="text-xs text-[#D0CCC3]">Ronde</span>
            <span className="font-mono-tabular text-sm font-semibold text-white">
              {currentRound} / {totalRounds}
            </span>
          </div>

          {/* Kode Ruangan PIN */}
          <div className="flex items-center gap-2 bg-[#252523] border border-[#484641] px-3 py-1.5 rounded min-h-[44px]">
            <span className="text-xs text-[#D0CCC3] font-mono-tabular uppercase">Ruang:</span>
            <span className="font-mono-tabular text-sm font-bold text-[#F4F1EA] tracking-wider">
              {roomCode || "..."}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              title="Salin tautan pemain"
              className="p-1.5 hover:bg-[#383835] rounded text-[#F4F1EA] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Salin tautan pemain"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[#52B788]" />
              ) : (
                <Copy className="w-4 h-4 text-[#D0CCC3]" />
              )}
            </button>
          </div>

          {/* Tautan Layar Pemain */}
          <a
            href={`/play?room=${roomCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded bg-[#252523] hover:bg-[#383835] text-[#F4F1EA] text-xs font-mono-tabular transition-colors border border-[#5A5852] min-h-[44px]"
          >
            <span>Buka Layar Pemain (/play)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Status Realtime */}
          <div
            title={isConnected ? "Koneksi realtime aktif" : "Menghubungkan ke realtime..."}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono-tabular border min-h-[44px] ${
              isConnected
                ? "bg-[#165B33]/20 text-[#D8F3DC] border-[#52B788]/40"
                : "bg-[#252523] text-[#D0CCC3] border-[#5A5852]"
            }`}
          >
            <Wifi className={`w-3.5 h-3.5 ${isConnected ? "text-[#52B788]" : "text-[#EAB308]"}`} />
            <span className="text-[11px]">{isConnected ? "Terhubung" : "Koneksi..."}</span>
          </div>

          {/* Papan Skor Modal */}
          {onOpenLeaderboard && (
            <button
              type="button"
              onClick={onOpenLeaderboard}
              title="Tampilkan papan peringkat tim"
              className="px-3 py-2 rounded bg-[#252523] hover:bg-[#383835] text-[#F4F1EA] text-xs font-mono-tabular transition-colors border border-[#5A5852] flex items-center gap-1.5 min-h-[44px]"
            >
              <Trophy className="w-4 h-4 text-[#F4F1EA]" />
              <span className="hidden sm:inline">Papan Skor</span>
            </button>
          )}

          {/* Pengaturan Model */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Buka pengaturan model generator gambar"
            className="px-3 py-2 rounded bg-[#252523] hover:bg-[#383835] text-[#F4F1EA] text-xs font-mono-tabular transition-colors border border-[#5A5852] flex items-center gap-1.5 min-h-[44px]"
          >
            <Settings className="w-4 h-4 text-[#D0CCC3]" />
            <span className="hidden sm:inline">Pengaturan Model</span>
          </button>

          {/* Atur Ulang Sesi */}
          <button
            type="button"
            onClick={onNewRoom}
            title="Mulai sesi ruangan baru"
            className="px-3 py-2 rounded bg-[#252523] hover:bg-[#383835] text-[#F4F1EA] text-xs font-mono-tabular transition-colors border border-[#5A5852] flex items-center gap-1.5 min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4 text-[#D0CCC3]" />
            <span className="hidden sm:inline">Ruang Baru</span>
          </button>
        </div>
      </div>
    </header>
  );
};
