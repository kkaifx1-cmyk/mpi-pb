"use client";

import React, { useState } from "react";
import {
  Submission,
  PromptEngineeringEvaluation,
  PromptEngineeringCriterion,
} from "@/lib/types";
import {
  evaluatePromptEngineering,
  comparePromptEvaluations,
} from "@/lib/scoring";
import { renderCanvasImageFromPrompt } from "@/lib/canvas-fallback";
import {
  ArrowRight,
  Trophy,
  Plus,
  Minus,
  CheckCircle,
  AlertTriangle,
  Award,
  Maximize2,
  RefreshCw,
  Image as ImageIcon,
  Check,
  X,
  Layers,
  SlidersHorizontal,
  Info,
  Scale,
} from "lucide-react";

interface ResultsViewProps {
  currentRound: number;
  totalRounds: number;
  makerName: string;
  secretPrompt: string;
  generatedImageUrl: string;
  secretPromptPE?: PromptEngineeringEvaluation;
  submissions: Submission[];
  onAdjustPoints: (teamIndex: number, delta: number) => void;
  onRegenerateTeamImage?: (teamIndex: number) => Promise<void>;
  onNextRound: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  currentRound,
  totalRounds,
  makerName,
  secretPrompt,
  generatedImageUrl,
  secretPromptPE,
  submissions,
  onAdjustPoints,
  onRegenerateTeamImage,
  onNextRound,
}) => {
  const isFinalRound = currentRound >= totalRounds;

  // Evaluasi prompt engineering untuk prompt asli jika belum tersedia
  const effectiveSecretPE: PromptEngineeringEvaluation =
    secretPromptPE || evaluatePromptEngineering(secretPrompt);

  // State untuk modal perbandingan visual berdampingan
  const [comparingTeamIndex, setComparingTeamIndex] = useState<number | null>(
    null
  );
  // State untuk loading regenerasi gambar tim
  const [regeneratingTeamIndex, setRegeneratingTeamIndex] = useState<
    number | null
  >(null);

  // Submisi diurutkan dari skor total tertinggi
  const sortedSubmissions = [...submissions].sort(
    (a, b) => b.scoreData.totalScore - a.scoreData.totalScore
  );

  const selectedComparingSub =
    comparingTeamIndex !== null
      ? submissions.find((s) => s.teamIndex === comparingTeamIndex) || null
      : null;

  const handleRegenerate = async (teamIndex: number) => {
    if (!onRegenerateTeamImage) return;
    setRegeneratingTeamIndex(teamIndex);
    try {
      await onRegenerateTeamImage(teamIndex);
    } finally {
      setRegeneratingTeamIndex(null);
    }
  };

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case "Ahli Prompt":
        return "bg-[#165B33] text-white border-[#141413]";
      case "Mahir":
        return "bg-[#1D3557] text-white border-[#141413]";
      case "Menengah":
        return "bg-[#D97706] text-white border-[#141413]";
      default:
        return "bg-[#B83214] text-white border-[#141413]";
    }
  };

  return (
    <section className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="panel-frame p-5 sm:p-6 bg-[#FFFFFF] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="step-pill bg-[#165B33] text-white">
              Tahap 3: Evaluasi &amp; Skor Ronde
            </span>
            <span className="font-mono text-xs text-[#484641]">
              Ronde {currentRound} dari {totalRounds}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            Perbandingan Prompt Asli dan Tebakan Tim
          </h2>
          <p className="text-sm text-[#484641] mt-1">
            Skor dihitung dari ketepatan subjek &amp; objek (40 poin), gaya visual &amp; suasana (35 poin), serta komposisi &amp; detail (25 poin). Seluruh prompt juga dinilai dan dikomparasikan kualitas kaidah <strong>Prompt Engineering</strong>-nya.
          </p>
        </div>

        <button
          type="button"
          onClick={onNextRound}
          className="btn-primary shrink-0"
        >
          {isFinalRound ? (
            <>
              <Trophy className="w-4 h-4" />
              Lihat Klasemen Akhir Sesi
            </>
          ) : (
            <>
              Lanjut ke Ronde Berikutnya
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Ringkasan Matriks Komparasi Seluruh Tim */}
      <div className="panel-frame p-4 sm:p-5 bg-[#FFFFFF] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C8C3B8] pb-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#165B33]" />
            <h3 className="font-bold text-sm sm:text-base">
              Ringkasan Komparasi Prompt &amp; Nilai Ronde {currentRound}
            </h3>
          </div>
          <div className="text-xs font-mono text-[#484641]">
            Formula: Skor Akhir = (50% Kemiripan + 50% Prompt Engineering)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse text-left">
            <thead>
              <tr className="bg-[#EAE6DC] text-[#141413] border border-[#C8C3B8]">
                <th className="py-2.5 px-3 border border-[#C8C3B8]">Peringkat</th>
                <th className="py-2.5 px-3 border border-[#C8C3B8]">Tim / Entitas</th>
                <th className="py-2.5 px-3 border border-[#C8C3B8] text-center">Visual Hasil</th>
                <th className="py-2.5 px-3 border border-[#C8C3B8] text-center">
                  Nilai 1: Kemiripan (100)
                </th>
                <th className="py-2.5 px-3 border border-[#C8C3B8] text-center">
                  Nilai 2: Prompt Eng (100)
                </th>
                <th className="py-2.5 px-3 border border-[#C8C3B8] text-center">
                  Komparasi PE vs Asli
                </th>
                <th className="py-2.5 px-3 border border-[#C8C3B8] text-right">
                  Skor Ronde
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Baris Acuan: Prompt Asli */}
              <tr className="bg-[#F4F1EA] font-semibold text-[#141413]">
                <td className="py-2.5 px-3 border border-[#C8C3B8]">
                  <span className="px-2 py-0.5 rounded bg-[#141413] text-white text-[10px]">
                    KUNCI
                  </span>
                </td>
                <td className="py-2.5 px-3 border border-[#C8C3B8]">
                  Prompt Asli ({makerName})
                </td>
                <td className="py-2.5 px-3 border border-[#C8C3B8] text-center">
                  <span className="text-[11px] text-[#165B33] font-bold">
                    Acuan Soal
                  </span>
                </td>
                <td className="py-2.5 px-3 border border-[#C8C3B8] text-center">
                  100 / 100
                </td>
                <td className="py-2.5 px-3 border border-[#C8C3B8] text-center">
                  <span className="font-bold text-[#165B33]">
                    {effectiveSecretPE.totalScore} / 100
                  </span>{" "}
                  ({effectiveSecretPE.level})
                </td>
                <td className="py-2.5 px-3 border border-[#C8C3B8] text-center text-[#484641]">
                  (Standar Acuan)
                </td>
                <td className="py-2.5 px-3 border border-[#C8C3B8] text-right text-[#484641]">
                  -
                </td>
              </tr>

              {/* Baris Masing-Masing Tim */}
              {sortedSubmissions.map((sub, idx) => {
                const teamPE =
                  sub.scoreData.promptEngineering ||
                  evaluatePromptEngineering(sub.guessedPrompt);
                const peScore = sub.scoreData.peScore ?? teamPE.totalScore;
                const similarityScore =
                  sub.scoreData.similarityScore ?? sub.scoreData.totalScore;
                const comparison = comparePromptEvaluations(
                  effectiveSecretPE,
                  teamPE
                );
                return (
                  <tr
                    key={sub.teamIndex}
                    className="hover:bg-[#FDFCFB] transition-colors"
                  >
                    <td className="py-2.5 px-3 border border-[#C8C3B8] font-bold">
                      #{idx + 1}
                    </td>
                    <td className="py-2.5 px-3 border border-[#C8C3B8] font-bold">
                      {sub.teamName}
                    </td>
                    <td className="py-2.5 px-3 border border-[#C8C3B8] text-center">
                      <button
                        type="button"
                        onClick={() => setComparingTeamIndex(sub.teamIndex)}
                        className="text-[11px] underline text-[#1D3557] hover:text-[#B83214]"
                      >
                        Bandingkan Visual
                      </button>
                    </td>
                    <td className="py-2.5 px-3 border border-[#C8C3B8] text-center">
                      <span className="font-semibold text-[#141413]">
                        {similarityScore}
                      </span>{" "}
                      / 100
                    </td>
                    <td className="py-2.5 px-3 border border-[#C8C3B8] text-center">
                      <span className="font-semibold text-[#141413]">
                        {peScore}
                      </span>{" "}
                      / 100 ({teamPE.level})
                    </td>
                    <td className="py-2.5 px-3 border border-[#C8C3B8] text-center">
                      {comparison.scoreDiff > 0 ? (
                        <span className="text-[#165B33] font-bold">
                          +{comparison.scoreDiff} poin (Lebih Lengkap)
                        </span>
                      ) : comparison.scoreDiff < 0 ? (
                        <span className="text-[#B83214] font-bold">
                          {comparison.scoreDiff} poin (Kurang Lengkap)
                        </span>
                      ) : (
                        <span className="text-[#484641] font-semibold">
                          Seimbang (0)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 border border-[#C8C3B8] text-right font-bold text-sm text-[#165B33]">
                      +{sub.scoreData.totalScore} poin
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Kunci Jawaban Prompt Asli, Gambar & Evaluasi Prompt Engineering Asli */}
        <div className="lg:col-span-5 panel-frame p-5 space-y-5 bg-white">
          <div className="border-b border-[#C8C3B8] pb-2 flex items-center justify-between">
            <span className="font-mono text-xs uppercase font-semibold text-[#B83214]">
              Kunci Jawaban Soal
            </span>
            <span className="font-mono text-xs text-[#484641]">
              Pembuat: {makerName}
            </span>
          </div>

          <div>
            <div className="text-xs font-mono text-[#484641] mb-1">
              Prompt Asli yang Disembunyikan:
            </div>
            <div className="p-4 rounded border-2 border-[#141413] bg-[#EAE6DC] font-mono text-sm font-semibold leading-relaxed">
              &quot;{secretPrompt}&quot;
            </div>
          </div>

          <div>
            <div className="text-xs font-mono text-[#484641] mb-1 flex items-center justify-between">
              <span>Gambar yang Ditampilkan (Acuan Soal):</span>
              <span className="text-[11px] text-[#165B33]">Target Rekonstruksi</span>
            </div>
            <div className="p-2.5 rounded border border-[#C8C3B8] bg-[#F4F1EA] flex items-center justify-center overflow-hidden relative group">
              <img
                src={generatedImageUrl}
                alt="Gambar soal pada ronde ini"
                className="w-full h-auto max-h-[320px] object-contain rounded border border-[#141413] bg-[#141413]"
              />
            </div>
          </div>

          {/* Evaluasi Kaidah Prompt Engineering untuk Prompt Asli */}
          <div className="p-4 rounded border border-[#141413] bg-[#FDFCFB] space-y-3">
            <div className="flex items-center justify-between border-b border-[#C8C3B8] pb-2">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#B83214]" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#141413]">
                  Kualitas Prompt Engineering (Prompt Asli)
                </h4>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getLevelBadgeClass(
                  effectiveSecretPE.level
                )}`}
              >
                {effectiveSecretPE.level}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-[#484641]">
                Skor Kelengkapan Format:
              </span>
              <span className="font-mono text-xl font-bold text-[#141413]">
                {effectiveSecretPE.totalScore}{" "}
                <span className="text-xs font-normal text-[#484641]">/ 100</span>
              </span>
            </div>

            {/* Checklist 5 Pilar Kaidah Prompting Asli */}
            <div className="space-y-1.5 text-xs font-mono">
              {Object.values(effectiveSecretPE.criteria).map((crit) => (
                <div
                  key={crit.id}
                  className="flex items-center justify-between p-2 rounded bg-[#EAE6DC] border border-[#C8C3B8]"
                >
                  <div className="flex items-center gap-2">
                    {crit.found ? (
                      <Check className="w-3.5 h-3.5 text-[#165B33] shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-[#B83214] shrink-0" />
                    )}
                    <span className="text-[#141413]">{crit.label}</span>
                  </div>
                  <span className="font-bold text-[#141413]">
                    {crit.score} / {crit.maxScore}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-[#484641] leading-relaxed italic bg-[#F4F1EA] p-2.5 rounded border border-[#C8C3B8]">
              &quot;{effectiveSecretPE.summary}&quot;
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Kartu Rincian Evaluasi Tiap Tim */}
        <div className="lg:col-span-7 space-y-6">
          {sortedSubmissions.map((sub, rankIdx) => {
            const { scoreData } = sub;
            const teamPE =
              scoreData.promptEngineering ||
              evaluatePromptEngineering(sub.guessedPrompt);
            const peScore = scoreData.peScore ?? teamPE.totalScore;
            const similarityScore =
              scoreData.similarityScore ?? scoreData.totalScore;
            const peComparison = comparePromptEvaluations(
              effectiveSecretPE,
              teamPE
            );

            // Gambar hasil prompt tim (jika kosong, gunakan fallback artistik lokal)
            const teamImageUrl =
              sub.generatedImageUrl ||
              renderCanvasImageFromPrompt(sub.guessedPrompt);

            const isRegenerating = regeneratingTeamIndex === sub.teamIndex;

            return (
              <div
                key={sub.teamIndex}
                className="panel-frame p-5 space-y-5 bg-white shadow-sm border-2 border-[#141413]"
              >
                {/* Header Kartu Tim */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C8C3B8] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-[#141413] text-white">
                      #{rankIdx + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold">{sub.teamName}</h3>
                      <span className="text-[11px] font-mono text-[#484641]">
                        Evaluasi Komparatif &amp; Rekonstruksi Visual
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[#484641] block">
                      Skor Akhir Ronde Ini
                    </span>
                    <span className="font-mono text-2xl font-bold text-[#165B33]">
                      +{scoreData.totalScore} poin
                    </span>
                  </div>
                </div>

                {/* VISUAL COMPARISON: Hasil Generate Masing-Masing Prompt */}
                <div className="p-3.5 rounded-md border border-[#141413] bg-[#F4F1EA] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C8C3B8] pb-2">
                    <div className="flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#1D3557]" />
                      <span className="font-mono text-xs font-bold uppercase text-[#141413]">
                        Komparasi Visual: Gambar Asli vs Gambar Tebakan {sub.teamName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {onRegenerateTeamImage && (
                        <button
                          type="button"
                          onClick={() => handleRegenerate(sub.teamIndex)}
                          disabled={isRegenerating}
                          className="text-[11px] font-mono px-2 py-1 rounded border border-[#141413] bg-white hover:bg-[#EAE6DC] flex items-center gap-1"
                          title="Generate ulang gambar dari prompt tim ini"
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${
                              isRegenerating ? "animate-spin" : ""
                            }`}
                          />
                          {isRegenerating ? "Merender..." : "Render Ulang"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setComparingTeamIndex(sub.teamIndex)}
                        className="text-[11px] font-mono px-2 py-1 rounded border border-[#141413] bg-[#1D3557] text-white hover:bg-[#142640] flex items-center gap-1"
                      >
                        <Maximize2 className="w-3 h-3" />
                        Bandingkan Berdampingan
                      </button>
                    </div>
                  </div>

                  {/* Grid 2 Gambar Berdampingan */}
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div className="space-y-1 text-center">
                      <div className="text-[11px] font-mono font-semibold text-[#B83214]">
                        [Gambar Soal Asli]
                      </div>
                      <div className="aspect-square rounded border border-[#141413] bg-[#141413] flex items-center justify-center overflow-hidden cursor-pointer">
                        <img
                          src={generatedImageUrl}
                          alt="Gambar Soal Asli"
                          onClick={() => setComparingTeamIndex(sub.teamIndex)}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-center">
                      <div className="text-[11px] font-mono font-semibold text-[#165B33]">
                        [Gambar Hasil Prompt {sub.teamName}]
                      </div>
                      <div className="aspect-square rounded border border-[#141413] bg-[#141413] flex items-center justify-center overflow-hidden cursor-pointer">
                        <img
                          src={teamImageUrl}
                          alt={`Hasil generate prompt ${sub.teamName}`}
                          onClick={() => setComparingTeamIndex(sub.teamIndex)}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teks Tebakan Prompt Tim */}
                <div>
                  <div className="text-xs font-mono text-[#484641] mb-1">
                    Tebakan Prompt dari {sub.teamName}:
                  </div>
                  <div className="p-3.5 rounded border border-[#141413] bg-[#F4F1EA] font-mono text-sm leading-relaxed">
                    &quot;{sub.guessedPrompt}&quot;
                  </div>
                </div>

                {/* DUA NILAI TIM YANG DIKOMPARASIKAN */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-mono font-bold uppercase text-[#141413] flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#165B33]" />
                    <span>Dua Dimensi Penilaian Prompt:</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Nilai 1: Kemiripan dengan Prompt Asli */}
                    <div className="p-3.5 rounded border border-[#141413] bg-[#FFFFFF] space-y-2">
                      <div className="flex items-center justify-between border-b border-[#C8C3B8] pb-1.5">
                        <span className="font-bold text-xs text-[#141413]">
                          1. Nilai Kemiripan Soal
                        </span>
                        <span className="font-mono text-sm font-bold text-[#165B33]">
                          {similarityScore} / 100
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] font-mono text-[#484641]">
                        <div className="flex justify-between">
                          <span>Subjek &amp; Objek (40):</span>
                          <span className="font-bold text-[#141413]">
                            {scoreData.topicScore} / 40
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gaya Visual &amp; Suasana (35):</span>
                          <span className="font-bold text-[#141413]">
                            {scoreData.styleScore} / 35
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Komposisi &amp; Detail (25):</span>
                          <span className="font-bold text-[#141413]">
                            {scoreData.constraintScore} / 25
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Nilai 2: Kualitas Prompt Engineering */}
                    <div className="p-3.5 rounded border border-[#141413] bg-[#FFFFFF] space-y-2">
                      <div className="flex items-center justify-between border-b border-[#C8C3B8] pb-1.5">
                        <span className="font-bold text-xs text-[#141413]">
                          2. Nilai Prompt Engineering
                        </span>
                        <span className="font-mono text-sm font-bold text-[#1D3557]">
                          {peScore} / 100
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] font-mono text-[#484641]">
                        <div className="flex justify-between">
                          <span>Subjek &amp; Karakter (25):</span>
                          <span className="font-bold text-[#141413]">
                            {teamPE.criteria.subject.score} / 25
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Latar &amp; Lingkungan (20):</span>
                          <span className="font-bold text-[#141413]">
                            {teamPE.criteria.environment.score} / 20
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pencahayaan &amp; Suasana (20):</span>
                          <span className="font-bold text-[#141413]">
                            {teamPE.criteria.lighting.score} / 20
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gaya Visual &amp; Medium (20):</span>
                          <span className="font-bold text-[#141413]">
                            {teamPE.criteria.style.score} / 20
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Komposisi &amp; Teknis (15):</span>
                          <span className="font-bold text-[#141413]">
                            {teamPE.criteria.composition.score} / 15
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Komparasi Kualitas Prompt Tim vs Prompt Asli */}
                <div
                  className={`p-3 rounded border text-xs leading-relaxed space-y-1 ${
                    peComparison.scoreDiff < 0
                      ? "bg-[#FEF2F2] border-[#EF4444] text-[#991B1B]"
                      : peComparison.scoreDiff > 0
                      ? "bg-[#D8F3DC] border-[#52B788] text-[#081C15]"
                      : "bg-[#EAE6DC] border-[#C8C3B8] text-[#141413]"
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Komparasi Standar Prompt Engineering:</span>
                  </div>
                  <p>{peComparison.comparisonSummary}</p>
                  {peScore < 55 && (
                    <p className="font-semibold text-[11px] mt-1">
                      ⚠️ Catatan Edukasi: Tim ini menerima skor akhir lebih rendah karena tebakan prompt kurang lengkap sesuai kaidah prompt engineering (tidak mencantumkan detail latar/pencahayaan/gaya secara spesifik).
                    </p>
                  )}
                </div>

                {/* Kata Kunci Tepat & Koreksi Juri */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EAE6DC]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-mono text-[#484641] mr-1">
                      Kata Kunci Tepat:
                    </span>
                    {scoreData.matchedTokens &&
                    scoreData.matchedTokens.length > 0 ? (
                      scoreData.matchedTokens.map((token) => (
                        <span key={token} className="token-match">
                          {token}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#484641]">
                        Dinilai dari kemiripan semantik
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-[#484641] mr-1">
                      Koreksi Juri:
                    </span>
                    <button
                      type="button"
                      onClick={() => onAdjustPoints(sub.teamIndex, -5)}
                      className="text-xs font-mono px-2.5 py-1 rounded border border-[#141413] bg-[#F4F1EA] hover:bg-[#EAE6DC] min-h-[32px] flex items-center gap-1"
                      title="Kurangi 5 poin"
                    >
                      <Minus className="w-3 h-3" />
                      5
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdjustPoints(sub.teamIndex, 5)}
                      className="text-xs font-mono px-2.5 py-1 rounded border border-[#141413] bg-[#F4F1EA] hover:bg-[#EAE6DC] min-h-[32px] flex items-center gap-1"
                      title="Tambah 5 poin"
                    >
                      <Plus className="w-3 h-3" />
                      5
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL KOMPARASI VISUAL BERDAMPINGAN (FULLSCREEN LIGHTBOX) */}
      {selectedComparingSub && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setComparingTeamIndex(null)}
        >
          <div
            className="panel-frame max-w-5xl w-full max-h-[92vh] overflow-y-auto bg-white p-5 sm:p-6 space-y-5 border-2 border-[#141413]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#C8C3B8] pb-3">
              <div>
                <span className="font-mono text-xs uppercase text-[#B83214] font-semibold">
                  Komparasi Visual Berdampingan
                </span>
                <h3 className="text-xl sm:text-2xl font-bold">
                  Prompt Asli vs Tebakan {selectedComparingSub.teamName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setComparingTeamIndex(null)}
                className="p-1.5 rounded-full hover:bg-[#EAE6DC] border border-[#141413]"
                aria-label="Tutup modal komparasi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dua Kolom Visual Berdampingan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Sisi Kiri: Soal Asli */}
              <div className="p-4 rounded border border-[#141413] bg-[#F4F1EA] space-y-3">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-[#B83214] uppercase">
                    Kunci Jawaban (Prompt Asli)
                  </span>
                  <span className="bg-[#141413] text-white px-2 py-0.5 rounded text-[10px]">
                    PE: {effectiveSecretPE.totalScore}/100
                  </span>
                </div>

                <div className="rounded border border-[#141413] bg-[#141413] overflow-hidden flex items-center justify-center min-h-[260px]">
                  <img
                    src={generatedImageUrl}
                    alt="Prompt Asli"
                    className="w-full h-auto max-h-[360px] object-contain"
                  />
                </div>

                <div className="p-3 rounded bg-white border border-[#C8C3B8] font-mono text-xs leading-relaxed">
                  &quot;{secretPrompt}&quot;
                </div>
              </div>

              {/* Sisi Kanan: Tebakan Tim */}
              <div className="p-4 rounded border border-[#141413] bg-[#F4F1EA] space-y-3">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-[#165B33] uppercase">
                    Hasil Prompt Tim: {selectedComparingSub.teamName}
                  </span>
                  <span className="bg-[#165B33] text-white px-2 py-0.5 rounded text-[10px]">
                    PE: {selectedComparingSub.scoreData.peScore}/100
                  </span>
                </div>

                <div className="rounded border border-[#141413] bg-[#141413] overflow-hidden flex items-center justify-center min-h-[260px]">
                  <img
                    src={
                      selectedComparingSub.generatedImageUrl ||
                      renderCanvasImageFromPrompt(
                        selectedComparingSub.guessedPrompt
                      )
                    }
                    alt={`Hasil prompt ${selectedComparingSub.teamName}`}
                    className="w-full h-auto max-h-[360px] object-contain"
                  />
                </div>

                <div className="p-3 rounded bg-white border border-[#C8C3B8] font-mono text-xs leading-relaxed">
                  &quot;{selectedComparingSub.guessedPrompt}&quot;
                </div>
              </div>
            </div>

            {/* Ringkasan Skor & Komparasi Edukatif */}
            {(() => {
              const modalTeamPE =
                selectedComparingSub.scoreData.promptEngineering ||
                evaluatePromptEngineering(selectedComparingSub.guessedPrompt);
              const modalPeScore =
                selectedComparingSub.scoreData.peScore ?? modalTeamPE.totalScore;
              const modalSimScore =
                selectedComparingSub.scoreData.similarityScore ??
                selectedComparingSub.scoreData.totalScore;

              return (
                <div className="p-4 rounded border border-[#141413] bg-[#EAE6DC] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
                  <div className="space-y-1">
                    <div>
                      <strong>Nilai 1 (Kemiripan Rekonstruksi):</strong>{" "}
                      {modalSimScore} / 100
                    </div>
                    <div>
                      <strong>Nilai 2 (Kualitas Prompt Engineering):</strong>{" "}
                      {modalPeScore} / 100
                    </div>
                    <div className="text-[#484641]">
                      Prompt tim mendapat evaluasi tingkat{" "}
                      <span className="font-bold text-[#141413]">
                        {modalTeamPE.level}
                      </span>.
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[#484641] block">
                      Total Perolehan Ronde:
                    </span>
                    <span className="text-2xl font-bold text-[#165B33]">
                      +{selectedComparingSub.scoreData.totalScore} poin
                    </span>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setComparingTeamIndex(null)}
                className="btn-secondary text-sm"
              >
                Tutup Perbandingan
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
