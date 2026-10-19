"use client";

import React, { useState } from "react";
import { MultiplayerTeam } from "@/lib/types";
import { AVAILABLE_MODELS } from "@/lib/constants";
import { Users, Trash2, Copy, Check, Clock, Settings2, Play } from "lucide-react";

interface ControllerLobbyViewProps {
  roomCode: string;
  teams: MultiplayerTeam[];
  totalRounds: number;
  makerDuration: number;
  discussionDuration: number;
  guessDuration: number;
  aiModel: string;
  onUpdateSettings: (settings: {
    totalRounds?: number;
    makerDuration?: number;
    discussionDuration?: number;
    guessDuration?: number;
    aiModel?: string;
  }) => Promise<void>;
  onStartGame: () => Promise<void>;
  onKickTeam: (teamId: string) => Promise<void>;
  onShowAlert: (msg: string, type?: "info" | "error" | "success") => void;
}

export const ControllerLobbyView: React.FC<ControllerLobbyViewProps> = ({
  roomCode,
  teams,
  totalRounds,
  makerDuration,
  discussionDuration,
  guessDuration,
  aiModel,
  onUpdateSettings,
  onStartGame,
  onKickTeam,
  onShowAlert,
}) => {
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleCopyLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:9000";
    const joinUrl = `${origin}/play?room=${roomCode}`;
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    onShowAlert("Tautan pemain berhasil disalin ke papan klip.", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = async () => {
    if (teams.length < 2) {
      onShowAlert("Minimal 2 tim harus bergabung sebelum memulai sesi permainan.", "error");
      return;
    }
    setIsStarting(true);
    try {
      await onStartGame();
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Kartu Sorotan Kode Ruangan untuk Layar Proyektor */}
      <div className="panel-frame p-5 sm:p-7 bg-[#FFFFFF] border-2 border-[#141413]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="step-pill bg-[#1D3557] text-white">
              Lobby Sesi: Menunggu Tim Terhubung
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#141413] mt-1">
              Ruang Kendali Bersama: <span className="font-mono-tabular underline decoration-2 underline-offset-4">{roomCode}</span>
            </h2>
            <p className="text-sm text-[#484641] max-w-xl">
              Ajak setiap tim membuka alamat <strong className="font-mono text-[#141413]">/play</strong> pada perangkat masing-masing lalu masukkan kode ruangan di samping.
            </p>
          </div>

          <div className="panel-muted p-4 sm:p-5 flex flex-col items-center min-w-[240px] text-center border-2 border-[#141413]">
            <span className="font-mono-tabular text-xs uppercase tracking-widest text-[#484641] mb-1">
              Kode Ruangan PIN
            </span>
            <div className="font-mono-tabular text-4xl sm:text-5xl font-bold tracking-widest text-[#141413]">
              {roomCode}
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="btn-secondary mt-3 text-xs font-mono-tabular w-full"
            >
              {copied ? <Check className="w-4 h-4 text-[#165B33]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Tautan Tersalin" : "Salin Tautan /play"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Utama: Daftar Tim dan Konfigurasi Sesi */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Tim Terhubung */}
        <div className="lg:col-span-7 panel-frame p-5 sm:p-7 space-y-5">
          <div className="border-b border-[#C8C3B8] pb-4 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <span className="font-mono-tabular text-xs uppercase tracking-wider text-[#484641]">
                Langkah 01
              </span>
              <h2 className="text-2xl font-bold mt-0.5 text-[#141413]">
                Daftar Tim Terhubung
              </h2>
            </div>
            <span className="font-mono-tabular text-xs font-semibold px-2.5 py-1 rounded bg-[#EAE6DC] text-[#141413]">
              {teams.length} Tim Terdaftar
            </span>
          </div>

          <p className="text-sm text-[#484641]">
            Setiap tim yang membuka tautan pemain akan otomatis muncul di bawah. Diperlukan minimal 2 tim untuk mode kompetisi bergilir.
          </p>

          {/* Daftar Kartu Tim */}
          {teams.length === 0 ? (
            <div className="panel-muted py-12 px-4 text-center space-y-3">
              <Users className="w-10 h-10 mx-auto text-[#484641] opacity-60" />
              <p className="text-sm font-medium text-[#141413]">Belum ada tim yang masuk ke ruangan.</p>
              <p className="text-xs text-[#484641] max-w-sm mx-auto">
                Buka tautan <code className="bg-white px-2 py-0.5 rounded border border-[#C8C3B8] font-mono-tabular">http://localhost:9000/play</code> pada tab baru untuk bergabung.
              </p>
            </div>
          ) : (
            <div className="space-y-3" role="list" aria-label="Daftar tim terhubung">
              {teams.map((team, idx) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-[6px] border border-[#141413] bg-[#FFFFFF]"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono-tabular text-xs font-bold w-7 h-7 rounded bg-[#141413] text-[#F4F1EA] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-[#141413]">{team.name}</h3>
                      <span className="text-xs font-mono-tabular text-[#165B33] flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-[#165B33] inline-block shrink-0" />
                        Terhubung di Lobby
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onKickTeam(team.id)}
                    title={`Keluarkan ${team.name} dari sesi`}
                    className="btn-secondary text-xs font-mono-tabular px-2.5 py-1 text-[#B83214] hover:bg-[#FBE8E6] border-[#B83214]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Keluarkan</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Parameter Permainan & Tombol Mulai */}
        <div className="lg:col-span-5 space-y-6">
          <div className="panel-frame p-5 sm:p-7 space-y-5">
            <div className="border-b border-[#C8C3B8] pb-4">
              <span className="font-mono-tabular text-xs uppercase tracking-wider text-[#484641]">
                Langkah 02
              </span>
              <h2 className="text-2xl font-bold mt-0.5 text-[#141413]">
                Parameter Sesi
              </h2>
            </div>

            <div className="space-y-4">
              {/* Jumlah Ronde */}
              <div>
                <label htmlFor="selectTotalRounds" className="block text-sm font-semibold mb-1 text-[#141413]">
                  Jumlah Total Ronde
                </label>
                <select
                  id="selectTotalRounds"
                  value={totalRounds}
                  onChange={(e) => onUpdateSettings({ totalRounds: Number(e.target.value) })}
                  className="input-field font-mono-tabular"
                >
                  <option value={2}>2 Ronde</option>
                  <option value={3}>3 Ronde (Standar)</option>
                  <option value={4}>4 Ronde</option>
                  <option value={6}>6 Ronde</option>
                </select>
                <p className="text-xs text-[#484641] mt-1">
                  Peran pembuat soal akan berputar ke tim berikutnya secara otomatis setiap ronde.
                </p>
              </div>

              {/* Waktu Diskusi */}
              <div>
                <label htmlFor="selectDiscussionDuration" className="block text-sm font-semibold mb-1 text-[#141413]">
                  Durasi Diskusi Gambar (Detik)
                </label>
                <select
                  id="selectDiscussionDuration"
                  value={discussionDuration}
                  onChange={(e) => onUpdateSettings({ discussionDuration: Number(e.target.value) })}
                  className="input-field font-mono-tabular"
                >
                  <option value={30}>30 Detik (Cepat)</option>
                  <option value={60}>60 Detik (Standar)</option>
                  <option value={90}>90 Detik</option>
                  <option value={120}>120 Detik</option>
                </select>
              </div>

              {/* Waktu Menebak */}
              <div>
                <label htmlFor="selectGuessDuration" className="block text-sm font-semibold mb-1 text-[#141413]">
                  Batas Waktu Menebak (Detik)
                </label>
                <select
                  id="selectGuessDuration"
                  value={guessDuration}
                  onChange={(e) => onUpdateSettings({ guessDuration: Number(e.target.value) })}
                  className="input-field font-mono-tabular"
                >
                  <option value={45}>45 Detik (Cepat)</option>
                  <option value={90}>90 Detik (Standar)</option>
                  <option value={120}>120 Detik</option>
                  <option value={180}>180 Detik</option>
                </select>
              </div>

              {/* Pilihan Model AI Generator */}
              <div>
                <label htmlFor="selectAiModel" className="block text-sm font-semibold mb-1 text-[#141413]">
                  Mesin Render Gambar
                </label>
                <select
                  id="selectAiModel"
                  value={aiModel}
                  onChange={(e) => onUpdateSettings({ aiModel: e.target.value })}
                  className="input-field font-mono-tabular text-xs"
                >
                  {AVAILABLE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.provider})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mekanisme Penilaian Ringkas */}
              <div className="panel-muted p-4 space-y-1.5 text-xs">
                <span className="font-mono-tabular font-semibold uppercase tracking-wider text-[#141413] block">
                  Format Penilaian (0 sampai 100 Poin)
                </span>
                <p className="text-[#484641] leading-relaxed">
                  Subjek dan Objek Utama (40 poin), Gaya Visual dan Pencahayaan (35 poin), serta Komposisi dan Detail Spesifik (25 poin).
                </p>
              </div>

              {/* Tombol Mulai Permainan */}
              <button
                type="button"
                disabled={teams.length < 2 || isStarting}
                onClick={handleStart}
                className="btn-primary w-full text-base mt-2"
              >
                <Play className="w-4 h-4" />
                <span>
                  {isStarting
                    ? "Menyiapkan Ronde 1..."
                    : teams.length < 2
                    ? "Menunggu Minimal 2 Tim"
                    : "Mulai Sesi Permainan"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
