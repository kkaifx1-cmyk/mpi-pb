"use client";

import React, { useState } from "react";
import { Team } from "@/lib/types";
import { Plus, Trash2, Users, Play, HelpCircle } from "lucide-react";

interface SetupViewProps {
  teams: Team[];
  onTeamsChange: (teams: Team[]) => void;
  totalRounds: number;
  onTotalRoundsChange: (rounds: number) => void;
  onStartGame: () => void;
  onShowAlert: (msg: string, type?: "info" | "error" | "success") => void;
}

export const SetupView: React.FC<SetupViewProps> = ({
  teams,
  onTeamsChange,
  totalRounds,
  onTotalRoundsChange,
  onStartGame,
  onShowAlert,
}) => {
  const [newTeamName, setNewTeamName] = useState("");

  const handleAddTeam = () => {
    const trimmed = newTeamName.trim();
    if (!trimmed) {
      onShowAlert("Ketik nama tim terlebih dahulu sebelum menambahkan ke daftar.", "error");
      return;
    }
    if (teams.length >= 8) {
      onShowAlert("Maksimal 8 tim dalam satu sesi permainan.", "error");
      return;
    }
    onTeamsChange([
      ...teams,
      {
        id: `t_${Date.now()}`,
        name: trimmed,
        score: 0,
        guessesCount: 0,
        totalAccuracy: 0,
      },
    ]);
    setNewTeamName("");
  };

  const handleApplyPreset = (count: number) => {
    const presetNames = [
      "Tim Alfa",
      "Tim Bravo",
      "Tim Delta",
      "Tim Echo",
      "Tim Foxtrot",
      "Tim Sigma",
    ];
    const nextTeams: Team[] = [];
    for (let i = 0; i < count; i++) {
      const existing = teams[i];
      nextTeams.push({
        id: existing?.id || `t_${Date.now()}_${i}`,
        name: existing?.name || presetNames[i] || `Tim ${i + 1}`,
        score: 0,
        guessesCount: 0,
        totalAccuracy: 0,
      });
    }
    onTeamsChange(nextTeams);
  };

  const handleTeamNameChange = (index: number, name: string) => {
    const updated = [...teams];
    updated[index].name = name;
    onTeamsChange(updated);
  };

  const handleRemoveTeam = (index: number) => {
    if (teams.length <= 1) {
      onShowAlert("Minimal harus ada 1 tim untuk memulai permainan.", "error");
      return;
    }
    const updated = teams.filter((_, i) => i !== index);
    onTeamsChange(updated);
  };

  const isSolo = teams.length === 1;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Kolom Kiri: Tim Peserta */}
      <div className="lg:col-span-7 panel-frame p-5 sm:p-7">
        <div className="border-b border-[#C8C3B8] pb-4 mb-6 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#484641]">
              Langkah 01
            </span>
            <h2 className="text-2xl font-bold mt-0.5">Daftar Tim Peserta</h2>
          </div>
          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-[#EAE6DC] text-[#141413]">
            {teams.length} Tim Terdaftar
          </span>
        </div>

        <p className="text-sm text-[#484641] mb-5">
          Anda dapat mengatur <strong>1 tim</strong> (mode latihan solo: sistem membuat prompt rahasia dan tim Anda menebaknya) atau <strong>2 tim maupun lebih</strong> (mode bergilir: 1 tim membuat soal gambar dan tim lainnya menebak satu per satu).
        </p>

        {/* Form Tambah Tim */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <input
              type="text"
              maxLength={32}
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTeam();
                }
              }}
              placeholder="Ketik nama tim baru (mis. Tim Regu A)"
              className="input-field"
            />
          </div>
          <button
            type="button"
            onClick={handleAddTeam}
            className="btn-secondary shrink-0"
          >
            <Plus className="w-4 h-4" />
            Tambah Tim ke Daftar
          </button>
        </div>

        {/* Setel Cepat Preset */}
        <div className="flex flex-wrap items-center gap-2 mb-5 pb-4 border-b border-[#EAE6DC]">
          <span className="text-xs font-mono text-[#484641] mr-1">
            Setel Cepat:
          </span>
          {[1, 2, 3, 4].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => handleApplyPreset(count)}
              className={`text-xs font-mono px-3 py-1.5 rounded border border-[#141413] min-h-[36px] transition-colors ${
                teams.length === count
                  ? "bg-[#141413] text-[#F4F1EA]"
                  : "bg-[#F4F1EA] hover:bg-[#EAE6DC] text-[#141413]"
              }`}
            >
              {count === 1 ? "1 Tim (Solo)" : `${count} Tim`}
            </button>
          ))}
        </div>

        {/* Daftar Tim */}
        <div className="space-y-3">
          {teams.map((team, idx) => (
            <div
              key={team.id}
              className="flex items-center gap-3 p-3 rounded border border-[#141413] bg-[#F4F1EA]"
            >
              <span className="font-mono text-xs font-semibold px-2.5 py-1.5 rounded bg-[#141413] text-[#F4F1EA] shrink-0">
                0{idx + 1}
              </span>

              <input
                type="text"
                value={team.name}
                maxLength={32}
                onChange={(e) => handleTeamNameChange(idx, e.target.value)}
                className="input-field flex-1 bg-white text-sm font-medium"
                placeholder={`Nama Tim ${idx + 1}`}
              />

              <button
                type="button"
                onClick={() => handleRemoveTeam(idx)}
                disabled={teams.length <= 1}
                title="Hapus tim"
                className="btn-secondary text-xs px-3 py-2 shrink-0 hover:text-[#B83214]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hapus</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Kolom Kanan: Parameter Sesi */}
      <div className="lg:col-span-5 space-y-6">
        <div className="panel-frame p-5 sm:p-7">
          <div className="border-b border-[#C8C3B8] pb-4 mb-5">
            <span className="font-mono text-xs uppercase tracking-wider text-[#484641]">
              Langkah 02
            </span>
            <h2 className="text-2xl font-bold mt-0.5">Parameter Sesi</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="selectRounds"
                className="block text-sm font-semibold mb-1.5"
              >
                Jumlah Total Ronde
              </label>
              <select
                id="selectRounds"
                value={totalRounds}
                onChange={(e) => onTotalRoundsChange(Number(e.target.value))}
                className="input-field font-mono"
              >
                <option value={2}>2 Ronde</option>
                <option value={3}>3 Ronde</option>
                <option value={4}>4 Ronde</option>
                <option value={6}>6 Ronde</option>
              </select>
              <p className="text-xs text-[#484641] mt-1.5">
                {isSolo
                  ? "Mode 1 Tim Aktif: Sistem menyiapkan prompt rahasia dan gambar soal, lalu tim Anda menebak di setiap ronde."
                  : `Mode ${teams.length} Tim Aktif: Peran pembuat soal gambar akan berputar bergantian ke tim berikutnya pada setiap ronde.`}
              </p>
            </div>

            <div className="panel-muted p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#141413]">
                  Format Mesin Keluaran
                </span>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#141413] text-[#F4F1EA]">
                  Cloudflare Workers AI
                </span>
              </div>
              <p className="text-xs text-[#484641]">
                Sistem menggunakan <strong>Cloudflare Workers AI</strong> (Flux-1 Schnell / SDXL) untuk merender gambar visual berdasarkan prompt rahasia pembuat soal.
              </p>
            </div>

            <div className="panel-muted p-4 space-y-2">
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#141413]">
                Mekanisme Penilaian Gambar (0–100 Poin)
              </div>
              <ul className="text-xs text-[#484641] space-y-1.5 list-disc pl-4">
                <li>
                  <strong>Subjek &amp; Objek Utama (40 poin):</strong> Ketepatan objek, karakter, latar tempat, dan aktivitas pada gambar.
                </li>
                <li>
                  <strong>Gaya Visual &amp; Suasana (35 poin):</strong> Kesesuaian medium visual (foto, lukisan, 3D, ilustrasi), warna, dan pencahayaan.
                </li>
                <li>
                  <strong>Komposisi &amp; Detail (25 poin):</strong> Sudut pandang kamera, elemen pendukung, dan atribut khusus.
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={onStartGame}
              className="btn-primary w-full text-base"
            >
              <Play className="w-4 h-4 fill-current" />
              Mulai Sesi Permainan
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
