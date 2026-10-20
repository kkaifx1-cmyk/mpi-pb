"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRoomSync } from "@/lib/useRoomSync";
import { DiscussionModal } from "@/components/DiscussionModal";
import { CountdownTimer } from "@/components/CountdownTimer";
import { countWords, detectPromptCharacteristics } from "@/lib/scoring";
import { renderCanvasImageFromPrompt } from "@/lib/canvas-fallback";
import { PlayerResultsComparison } from "@/components/PlayerResultsComparison";
import { LeaderboardView } from "@/components/LeaderboardView";
import { StudentFeedbackSection } from "@/components/StudentFeedbackSection";
import { StudentPostTestSection } from "@/components/StudentPostTestSection";
import {
  Users,
  Send,
  Eye,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Trophy,
  AlertCircle,
  Clock,
  Wand2,
  BookOpen,
} from "lucide-react";

export default function PlayPage() {
  const [roomCode, setRoomCode] = useState<string>("");
  const [teamName, setTeamName] = useState<string>("");
  const [currentTeam, setCurrentTeam] = useState<{ id: string; name: string } | null>(null);

  // Maker prompt input states
  const [makerPrompt, setMakerPrompt] = useState("");
  const [isGeneratingMakerImage, setIsGeneratingMakerImage] = useState(false);
  const [makerGeneratedImage, setMakerGeneratedImage] = useState<string>("");

  // Guesser prompt input states
  const [guessPrompt, setGuessPrompt] = useState("");
  const [isSubmittingGuess, setIsSubmittingGuess] = useState(false);

  // Reconstructed image from guessed prompt
  const [isGeneratingReconstruction, setIsGeneratingReconstruction] = useState(false);
  const [reconstructedImageUrl, setReconstructedImageUrl] = useState<string>("");

  const [alert, setAlert] = useState<{ message: string; type: "info" | "error" | "success" } | null>(null);
  const [playerResultTab, setPlayerResultTab] = useState<"evaluation" | "leaderboard">("evaluation");

  // Read saved team & room from localStorage or URL query
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryRoom = params.get("room");
      const savedRoom = localStorage.getItem("mpi_player_room");
      const savedTeam = localStorage.getItem("mpi_player_team");

      if (queryRoom) {
        setRoomCode(queryRoom.toUpperCase());
      } else if (savedRoom) {
        setRoomCode(savedRoom.toUpperCase());
      }

      if (savedTeam) {
        try {
          const parsed = JSON.parse(savedTeam);
          setCurrentTeam(parsed);
          setTeamName(parsed.name);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Real-time synchronization with Supabase
  const { room, teams, submissions, loading, refresh } = useRoomSync({
    roomCode: currentTeam ? roomCode : null,
  });

  // Check if this team submitted a guess for this round
  const mySubmission = currentTeam
    ? submissions.find((s) => s.team_id === currentTeam.id)
    : undefined;

  // Check if team is maker in current round
  const isMaker = Boolean(room && currentTeam && room.makerTeamId === currentTeam.id);

  const showAlert = (message: string, type: "info" | "error" | "success" = "info") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  // Join Room Handler
  const handleJoin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanRoom = roomCode.trim().toUpperCase();
    const cleanName = teamName.trim();

    if (!cleanRoom || !cleanName) {
      showAlert("Kode Ruangan dan Nama Tim wajib diisi.", "error");
      return;
    }

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode: cleanRoom, teamName: cleanName }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.team) {
        const teamObj = { id: data.team.id, name: data.team.name };
        setCurrentTeam(teamObj);
        localStorage.setItem("mpi_player_room", cleanRoom);
        localStorage.setItem("mpi_player_team", JSON.stringify(teamObj));
        showAlert(data.message || "Berhasil bergabung ke ruangan.", "success");
      } else {
        showAlert(data.error || "Gagal bergabung ke ruangan", "error");
      }
    } catch {
      showAlert("Koneksi gagal. Periksa jaringan internet Anda.", "error");
    }
  };

  // Leave / Switch Team
  const handleLeave = () => {
    if (confirm("Keluar dari ruangan permainan ini?")) {
      setCurrentTeam(null);
      localStorage.removeItem("mpi_player_team");
    }
  };

  // Maker: Generate image from prompt
  const handleMakerGenerateImage = async () => {
    if (countWords(makerPrompt) < 3) {
      showAlert("Tuliskan prompt rahasia minimal 3 kata.", "error");
      return;
    }

    setIsGeneratingMakerImage(true);
    try {
      const meta = detectPromptCharacteristics(makerPrompt);

      let imageUrl = "";
      let source = "";
      let englishPrompt = "";

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: makerPrompt,
          model: room?.aiModel || "agnes-image-2.1-flash",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.image) {
          imageUrl = data.image;
          source = data.source || "AI";
          englishPrompt = data.englishPrompt || "";
        }
      }

      if (!imageUrl) {
        imageUrl = renderCanvasImageFromPrompt(makerPrompt);
        source = "canvas-fallback";
      }

      setMakerGeneratedImage(imageUrl);

      await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_PROMPT",
          roomCode,
          secretPrompt: makerPrompt.trim(),
          generatedImageUrl: imageUrl,
          imageSource: source,
          englishPrompt,
          detectedMeta: meta,
        }),
      });

      showAlert("Gambar berhasil dibuat dan dikirim ke Controller.", "success");
      refresh();
    } catch {
      showAlert("Gagal membuat gambar. Silakan coba kembali.", "error");
    } finally {
      setIsGeneratingMakerImage(false);
    }
  };

  // Guesser: Submit Guess
  const handleSubmitGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam || countWords(guessPrompt) < 2) {
      showAlert("Masukkan tebakan kalimat prompt minimal 2 kata.", "error");
      return;
    }

    setIsSubmittingGuess(true);
    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUBMIT_GUESS",
          roomCode,
          teamId: currentTeam.id,
          teamName: currentTeam.name,
          guessedPrompt: guessPrompt.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showAlert("Tebakan tim berhasil terkirim.", "success");
        refresh();
        generateReconstructionImage(guessPrompt.trim(), data.submission?.id);
      } else {
        showAlert(data.error || "Gagal mengirimkan tebakan", "error");
      }
    } catch {
      showAlert("Gagal menghubungi server", "error");
    } finally {
      setIsSubmittingGuess(false);
    }
  };

  // Generate reconstruction image from team's guessed prompt
  const generateReconstructionImage = async (promptToUse?: string, submissionIdToUse?: string) => {
    const targetPrompt = (promptToUse || mySubmission?.guessed_prompt || guessPrompt || "").trim();
    if (!targetPrompt || !currentTeam || !roomCode) return;

    setIsGeneratingReconstruction(true);
    try {
      let imageUrl = "";
      let source = "";
      let englishPrompt = "";

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: targetPrompt,
          model: room?.aiModel || "agnes-image-2.1-flash",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.image) {
          imageUrl = data.image;
          source = data.source || "AI";
          englishPrompt = data.englishPrompt || "";
        }
      }

      if (!imageUrl) {
        imageUrl = renderCanvasImageFromPrompt(targetPrompt);
        source = "canvas-fallback";
      }

      setReconstructedImageUrl(imageUrl);

      const targetSubId =
        submissionIdToUse ||
        mySubmission?.id ||
        `sub_${roomCode}_r${room?.currentRound}_${currentTeam.id}`;

      await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_SUBMISSION_IMAGE",
          roomCode,
          submissionId: targetSubId,
          generatedImageUrl: imageUrl,
          imageSource: source,
          englishPrompt,
        }),
      });

      refresh();
    } catch (err) {
      console.warn("Failed to generate reconstruction image:", err);
    } finally {
      setIsGeneratingReconstruction(false);
    }
  };

  // Otomatis buat gambar rekonstruksi saat masuk ke status ROUND_RESULTS
  useEffect(() => {
    if (room?.status === "ROUND_RESULTS" && mySubmission) {
      if (mySubmission.generated_image_url) {
        setReconstructedImageUrl(mySubmission.generated_image_url);
      } else if (!isGeneratingReconstruction && mySubmission.guessed_prompt && !reconstructedImageUrl) {
        generateReconstructionImage(mySubmission.guessed_prompt, mySubmission.id);
      }
    }
  }, [room?.status, mySubmission?.id, mySubmission?.generated_image_url, isGeneratingReconstruction, reconstructedImageUrl]);

  // Deteksi karakteristik prompt pembuat secara dinamis
  const detectedAttributes = detectPromptCharacteristics(makerPrompt);

  // SCREEN 1: FORM MASUK RUANGAN JIKA BELUM BERGABUNG
  if (!currentTeam) {
    return (
      <main className="min-h-screen bg-[#F4F1EA] flex flex-col justify-center items-center p-4">
        <div className="panel-frame max-w-lg w-full bg-white p-6 sm:p-8 space-y-6 border-2 border-[#141413]">
          <div className="border-b border-[#C8C3B8] pb-4 text-center space-y-1.5">
            <span className="step-pill bg-[#1D3557] text-white">
              Layar Pemain
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#141413] mt-1">
              Masuk Meja Permainan
            </h1>
            <p className="text-xs sm:text-sm text-[#484641] max-w-sm mx-auto">
              Ketik Kode Ruangan dari layar Controller dan tentukan Nama Tim Anda.
            </p>
          </div>

          {alert && (
            <div
              role="alert"
              className="p-3 rounded-[6px] text-xs font-mono-tabular border flex items-center gap-2 bg-[#FBE8E6] text-[#B83214] border-[#B83214]"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{alert.message}</span>
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label htmlFor="inputRoomPin" className="text-xs font-mono-tabular font-bold text-[#141413] uppercase tracking-wider block mb-1">
                Kode Ruangan PIN
              </label>
              <input
                id="inputRoomPin"
                type="text"
                required
                maxLength={10}
                placeholder="Contoh: 8821"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="input-field font-mono-tabular text-center text-xl font-bold tracking-widest uppercase"
              />
            </div>

            <div>
              <label htmlFor="inputTeamName" className="text-xs font-mono-tabular font-bold text-[#141413] uppercase tracking-wider block mb-1">
                Nama Tim Anda
              </label>
              <input
                id="inputTeamName"
                type="text"
                required
                maxLength={32}
                placeholder="Contoh: Tim Alfa"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="input-field text-base font-semibold"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full text-base font-semibold mt-2"
            >
              Masuk ke Ruangan Permainan
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#C8C3B8] text-center">
            <Link
              href="/modul"
              className="inline-flex items-center gap-1.5 text-xs font-mono-tabular font-semibold text-[#B83214] hover:text-[#96270E] p-2 rounded hover:bg-[#EAE6DC] transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Buka Modul Pembelajaran & Tujuan Belajar</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // SCREEN 2: LOADING DETAIL RUANGAN
  if (loading && !room) {
    return (
      <main className="min-h-screen bg-[#F4F1EA] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="inline-block w-8 h-8 border-2 border-[#141413] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-mono-tabular text-[#484641]">
            Menghubungkan ke Ruangan {roomCode}...
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#141413] flex flex-col justify-between">
      {/* Header Meja Pemain (Lebar Penuh Lega max-w-7xl) */}
      <header className="border-b-2 border-[#141413] bg-[#141413] text-[#F4F1EA] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono-tabular text-xs font-bold px-2.5 py-1 rounded bg-[#2B2B29] text-[#F4F1EA] border border-[#5A5852]">
              {currentTeam.name}
            </span>
            <span className="text-xs font-mono-tabular text-[#D0CCC3]">
              Ruang: <strong className="text-white">{roomCode}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {room && (
              <span className="text-xs font-mono-tabular px-2.5 py-1 rounded bg-[#252523] text-white border border-[#484641]">
                Ronde {room.currentRound} / {room.totalRounds}
              </span>
            )}
            <Link
              href="/modul"
              target="_blank"
              rel="noopener noreferrer"
              title="Buka modul pembelajaran di tab baru"
              className="text-xs font-mono-tabular px-2.5 py-1.5 rounded bg-[#252523] hover:bg-[#383835] text-[#F4F1EA] border border-[#5A5852] min-h-[36px] flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#B83214]" />
              <span className="hidden sm:inline">Modul</span>
            </Link>
            <button
              type="button"
              onClick={handleLeave}
              title="Keluar dari tim ini"
              className="text-xs font-mono-tabular px-3 py-1.5 rounded bg-[#252523] hover:bg-[#383835] text-[#F4F1EA] border border-[#5A5852] min-h-[36px] flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Konten Utama Layar Pemain (max-w-7xl untuk kenyamanan visual desktop) */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">
        {/* Banner Alert Pesan */}
        {alert && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 p-4 rounded-[6px] border-2 border-[#141413] bg-white flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full shrink-0 ${
                  alert.type === "error"
                    ? "bg-[#B83214]"
                    : alert.type === "success"
                    ? "bg-[#165B33]"
                    : "bg-[#1D3557]"
                }`}
              />
              <p className="text-xs sm:text-sm font-medium font-mono-tabular text-[#141413]">
                {alert.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAlert(null)}
              className="text-xs font-mono-tabular underline px-2 py-1 min-h-[36px]"
            >
              Tutup
            </button>
          </div>
        )}

        {/* FASE 1: LOBBY MENUNGGU (Layout 2 Kolom Lega pada Desktop) */}
        {room?.status === "LOBBY" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Kolom Kiri: Status & Panduan Tim */}
            <div className="lg:col-span-7 panel-frame p-6 sm:p-7 bg-white border-2 border-[#141413] space-y-5">
              <div className="border-b border-[#C8C3B8] pb-4">
                <span className="step-pill bg-[#1D3557] text-white">
                  Lobby Sesi
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#141413] mt-2">
                  Tim {currentTeam.name} Terdaftar
                </h1>
                <p className="text-xs sm:text-sm text-[#484641] mt-1">
                  Perangkat Anda telah terhubung ke Ruangan PIN <strong className="font-mono-tabular text-[#141413]">{roomCode}</strong>.
                </p>
              </div>

              <div className="panel-muted p-4 text-xs sm:text-sm font-mono-tabular text-[#141413] flex items-center gap-3 border border-[#C8C3B8]">
                <Clock className="w-5 h-5 text-[#B83214] shrink-0" />
                <span>Menunggu Controller memulai ronde pertama...</span>
              </div>

              <div className="space-y-2 pt-1 text-xs text-[#484641]">
                <span className="font-mono-tabular font-bold text-[#141413] uppercase tracking-wider block">
                  Alur Singkat Permainan:
                </span>
                <ul className="space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li><strong>Giliran Pembuat Soal:</strong> Tim pembuat menulis prompt rahasia dan sistem merender gambarnya.</li>
                  <li><strong>Sesi Pengamatan:</strong> Semua tim mengamati gambar keluaran yang tampil di layar proyektor.</li>
                  <li><strong>Giliran Menebak:</strong> Tim Anda menyusun kembali prompt yang menurut Anda menghasilkan gambar tersebut.</li>
                  <li><strong>Evaluasi Hibrida:</strong> Skor dihitung dari ketepatan objek (40 poin), gaya visual (35 poin), dan detail komposisi (25 poin).</li>
                </ul>
              </div>
            </div>

            {/* Kolom Kanan: Daftar Seluruh Tim yang Terhubung */}
            <div className="lg:col-span-5 panel-frame p-6 bg-white border-2 border-[#141413] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#C8C3B8]">
                <span className="text-xs font-mono-tabular font-bold text-[#141413] uppercase tracking-wider">
                  Tim Terhubung ({teams.length})
                </span>
                <span className="text-xs font-mono-tabular text-[#484641]">
                  {teams.length < 2 ? "Menunggu tim lain..." : "Siap bermain"}
                </span>
              </div>

              <div className="space-y-2.5">
                {teams.map((t, idx) => {
                  const isMyTeam = t.id === currentTeam.id;
                  return (
                    <div
                      key={t.id}
                      className={`flex items-center justify-between p-3 rounded-[6px] border transition-colors ${
                        isMyTeam
                          ? "bg-[#F4F1EA] border-[#141413]"
                          : "bg-white border-[#C8C3B8]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-[4px] bg-[#141413] text-[#F4F1EA] font-mono-tabular text-xs font-bold flex items-center justify-center shrink-0">
                          0{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-[#141413]">{t.name}</h3>
                            {isMyTeam && (
                              <span className="step-pill bg-[#B83214] text-white text-[10px] py-0.5 px-2">
                                Tim Anda
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono-tabular text-[#165B33] flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#165B33]" />
                            Terhubung
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono-tabular px-2.5 py-1 rounded bg-white border border-[#C8C3B8] text-[#141413]">
                        Siap
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* FASE 2: ROUND_MAKING */}
        {room?.status === "ROUND_MAKING" && (
          <div>
            {isMaker ? (
              // KASUS A: TIM INI PEMBUAT SOAL (Layout 2 Kolom Workstation Studio)
              <div className="space-y-6">
                <div className="panel-frame p-5 sm:p-6 bg-white border-2 border-[#141413] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="step-pill bg-[#B83214] text-white">
                        Tahap 1: Pembuatan Soal
                      </span>
                      <span className="font-mono-tabular text-xs text-[#484641]">
                        Ronde {room.currentRound} / {room.totalRounds}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#141413]">
                      Giliran Tim Anda: Buat Gambar Soal
                    </h2>
                    <p className="text-xs sm:text-sm text-[#484641] mt-0.5">
                      Tuliskan prompt gambar rahasia. Tim lain akan menebak instruksi dari gambar yang dihasilkan.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <CountdownTimer
                      timerEndsAt={room.timerEndsAt}
                      timerRemaining={room.timerRemaining}
                      timerPaused={room.timerPaused}
                      totalDuration={room.makerDuration || 120}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Kolom Kiri: Input Prompt & Parameter Terdeteksi */}
                  <div className="lg:col-span-6 panel-frame p-5 sm:p-6 bg-white border-2 border-[#141413] space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C8C3B8] pb-3">
                      <label htmlFor="secretMakerPrompt" className="text-base font-bold text-[#141413]">
                        Prompt Rahasia Gambar
                      </label>
                      <span className="font-mono-tabular text-xs px-2.5 py-1 rounded border border-[#141413] bg-[#F4F1EA]">
                        Minimal 3 kata
                      </span>
                    </div>

                    <div className="space-y-2">
                      <textarea
                        id="secretMakerPrompt"
                        rows={5}
                        placeholder="Contoh: Kucing oranye memakai helm astronot duduk di warung kopi pinggir jalan saat hujan malam hari, gaya lukisan cat minyak..."
                        value={makerPrompt}
                        onChange={(e) => setMakerPrompt(e.target.value)}
                        className="input-field font-mono-tabular text-sm leading-relaxed"
                      />
                      <div className="flex justify-between items-center text-xs font-mono-tabular text-[#484641]">
                        <span>{countWords(makerPrompt)} kata</span>
                        <span>Sebutkan objek utama, latar tempat, dan gaya visual</span>
                      </div>
                    </div>

                    {/* Deteksi Parameter Otomatis */}
                    <div className="panel-muted p-3.5 space-y-2 text-xs">
                      <div className="font-mono-tabular font-semibold uppercase tracking-wider text-[#141413]">
                        Parameter Gambar Terdeteksi
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono-tabular">
                        <div className="p-2 rounded bg-white border border-[#C8C3B8]">
                          <span className="block text-[11px] text-[#484641]">Gaya Visual</span>
                          <span className="font-semibold text-[#141413]">{detectedAttributes.style}</span>
                        </div>
                        <div className="p-2 rounded bg-white border border-[#C8C3B8]">
                          <span className="block text-[11px] text-[#484641]">Suasana Cahaya</span>
                          <span className="font-semibold text-[#141413]">{detectedAttributes.mood}</span>
                        </div>
                        <div className="p-2 rounded bg-white border border-[#C8C3B8]">
                          <span className="block text-[11px] text-[#484641]">Model Render</span>
                          <span className="font-semibold text-[#141413]">{detectedAttributes.modelLabel}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isGeneratingMakerImage || countWords(makerPrompt) < 3}
                      onClick={handleMakerGenerateImage}
                      className="btn-primary w-full text-base font-semibold"
                    >
                      {isGeneratingMakerImage ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4" />
                      )}
                      <span>
                        {isGeneratingMakerImage
                          ? "Sedang Merender Gambar..."
                          : "Buat Gambar dari Prompt"}
                      </span>
                    </button>
                  </div>

                  {/* Kolom Kanan: Pratinjau Gambar Soal */}
                  <div className="lg:col-span-6 panel-frame p-5 sm:p-6 bg-white border-2 border-[#141413] flex flex-col justify-between min-h-[380px] space-y-4">
                    <div>
                      <div className="flex items-center justify-between border-b border-[#C8C3B8] pb-3 mb-4">
                        <h3 className="text-base font-bold text-[#141413]">Pratinjau Gambar Soal</h3>
                        <span className="font-mono-tabular text-xs px-2.5 py-0.5 rounded bg-[#EAE6DC] text-[#484641]">
                          {makerGeneratedImage || room.generatedImageUrl ? "Gambar Siap" : "Belum Dibuat"}
                        </span>
                      </div>

                      {isGeneratingMakerImage ? (
                        <div className="py-16 text-center space-y-3">
                          <div className="inline-block w-8 h-8 border-2 border-[#141413] border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-sm font-mono-tabular text-[#484641]">Merender gambar dari prompt rahasia...</p>
                        </div>
                      ) : makerGeneratedImage || room.generatedImageUrl ? (
                        <div className="space-y-3">
                          <div className="p-2.5 rounded-[6px] border border-[#141413] bg-[#F4F1EA] max-h-[320px] flex items-center justify-center overflow-hidden">
                            <img
                              src={makerGeneratedImage || room.generatedImageUrl}
                              alt="Pratinjau Gambar Soal"
                              className="max-h-[300px] w-auto object-contain rounded-[4px]"
                            />
                          </div>

                          <div className="panel-muted p-4 space-y-1 text-xs">
                            <p className="font-bold font-mono-tabular text-[#165B33] flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-[#165B33]" />
                              Gambar Berhasil Terkirim ke Controller
                            </p>
                            <p className="text-[#484641] leading-relaxed">
                              Gambar ini kini tampil di layar Controller. Tunggu Controller mengunci gambar untuk membuka sesi diskusi.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="py-16 px-4 text-center panel-muted border border-[#C8C3B8]">
                          <p className="text-xs sm:text-sm text-[#484641]">
                            Belum ada gambar. Ketik prompt pada panel kiri lalu klik <strong>Buat Gambar dari Prompt</strong>.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // KASUS B: TIM PENEBAK MENUNGGU PEMBUAT
              <div className="panel-frame p-8 sm:p-12 bg-white border-2 border-[#141413] text-center space-y-5 max-w-2xl mx-auto">
                <span className="step-pill bg-[#1D3557] text-white">
                  Menunggu Pembuatan Soal
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#141413]">
                  Tim {room.makerTeamName} Sedang Merancang Gambar
                </h2>
                <div className="py-2 flex justify-center">
                  <CountdownTimer
                    timerEndsAt={room.timerEndsAt}
                    timerRemaining={room.timerRemaining}
                    timerPaused={room.timerPaused}
                    totalDuration={room.makerDuration || 120}
                    size="md"
                  />
                </div>
                <p className="text-xs sm:text-sm text-[#484641] max-w-md mx-auto leading-relaxed">
                  Harap bersiap bersama rekan tim Anda. Gambar soal akan segera dikunci oleh Controller untuk sesi pengamatan bersama di layar proyektor.
                </p>
              </div>
            )}
          </div>
        )}

        {/* FASE 3: ROUND_DISCUSSION */}
        <DiscussionModal
          isOpen={room?.status === "ROUND_DISCUSSION"}
          isController={false}
          currentRound={room?.currentRound || 1}
          totalRounds={room?.totalRounds || 3}
          makerTeamName={room?.makerTeamName || "Pembuat Gambar"}
          imageUrl={room?.generatedImageUrl || ""}
          timerEndsAt={room?.timerEndsAt || null}
          timerRemaining={room?.timerRemaining || null}
          timerPaused={room?.timerPaused || false}
          totalDuration={room?.discussionDuration || 60}
        />

        {/* FASE 4: ROUND_GUESSING */}
        {room?.status === "ROUND_GUESSING" && (
          <div>
            {isMaker ? (
              // Tim Pembuat Menunggu Penebak Selesai
              <div className="panel-frame p-6 sm:p-8 bg-white border-2 border-[#141413] text-center space-y-5 max-w-2xl mx-auto">
                <span className="step-pill bg-[#141413] text-white">
                  Tim Pembuat Soal
                </span>
                <h2 className="text-2xl font-bold text-[#141413]">
                  Tim Lawan Sedang Menebak Prompt Gambar Anda
                </h2>
                <p className="text-xs sm:text-sm text-[#484641] max-w-md mx-auto">
                  Sebagai pembuat soal di ronde ini, perhatikan jalannya tebakan tim lawan di layar utama Controller.
                </p>
                <div className="p-2.5 rounded-[6px] border border-[#141413] bg-[#F4F1EA] max-h-[300px] flex items-center justify-center overflow-hidden">
                  <img
                    src={room.generatedImageUrl}
                    alt="Gambar Soal Anda"
                    className="max-h-[280px] w-auto object-contain rounded-[4px]"
                  />
                </div>
              </div>
            ) : (
              // Tim Penebak: Layout 2 Kolom Sisi-ke-Sisi (Gambar di Kiri, Form Tebak di Kanan)
              <div className="space-y-6">
                <div className="panel-frame p-5 sm:p-6 bg-white border-2 border-[#141413] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="step-pill bg-[#1D3557] text-white">
                        Tahap 2: Tebak Prompt Gambar
                      </span>
                      <span className="font-mono-tabular text-xs text-[#484641]">
                        Ronde {room.currentRound} / {room.totalRounds}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#141413]">
                      Amati Gambar &amp; Susun Tebakan
                    </h2>
                    <p className="text-xs sm:text-sm text-[#484641] mt-0.5">
                      Perhatikan objek utama, aktivitas, warna, dan gaya visual pada gambar di samping.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <CountdownTimer
                      timerEndsAt={room.timerEndsAt}
                      timerRemaining={room.timerRemaining}
                      timerPaused={room.timerPaused}
                      totalDuration={room.guessDuration}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Kolom Kiri: Gambar yang Harus Ditebak */}
                  <div className="lg:col-span-6 panel-frame p-5 sm:p-6 bg-white border-2 border-[#141413] space-y-4">
                    <div className="flex items-center justify-between border-b border-[#C8C3B8] pb-2">
                      <span className="font-mono-tabular text-xs font-semibold px-2 py-0.5 rounded bg-[#141413] text-white">
                        Gambar Soal
                      </span>
                      <span className="text-xs font-mono-tabular text-[#484641]">
                        Soal oleh: <strong className="text-[#141413]">{room.makerTeamName}</strong>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-[6px] border border-[#141413] bg-[#F4F1EA] max-h-[380px] flex items-center justify-center overflow-hidden">
                      <img
                        src={room.generatedImageUrl}
                        alt="Gambar Soal"
                        className="max-h-[360px] w-auto object-contain rounded-[4px]"
                      />
                    </div>
                  </div>

                  {/* Kolom Kanan: Form Input Tebakan atau Status Sudah Terkirim */}
                  <div className="lg:col-span-6 panel-frame p-5 sm:p-6 bg-white border-2 border-[#141413] space-y-4">
                    <div className="border-b border-[#C8C3B8] pb-2 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-[#141413]">
                        Tebakan dari {currentTeam.name}
                      </h3>
                      <span className="font-mono-tabular text-xs text-[#484641]">
                        Input Tim
                      </span>
                    </div>

                    {mySubmission ? (
                      <div className="panel-muted p-5 border border-[#52B788] bg-[#D8F3DC] text-center space-y-3">
                        <span className="font-mono-tabular text-xs font-bold text-[#081C15] flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-5 h-5 text-[#165B33]" />
                          Tebakan Tim Telah Terkirim
                        </span>
                        <div className="p-3 bg-white rounded-[4px] border border-[#52B788] text-xs sm:text-sm font-mono-tabular text-[#081C15] font-semibold italic text-left">
                          &ldquo;{mySubmission.guessed_prompt}&rdquo;
                        </div>
                        <p className="text-xs text-[#165B33] pt-1">
                          Tebakan Anda telah tersimpan. Menunggu seluruh tim menyelesaikan tebakan mereka untuk membuka evaluasi skor.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitGuess} className="space-y-4">
                        <p className="text-xs text-[#484641] leading-relaxed">
                          Tuliskan kembali prompt sedetail mungkin: sebutkan karakter, latar suasana, pencahayaan, dan gaya lukisan atau foto gambar.
                        </p>

                        <div>
                          <label htmlFor="inputGuessedPrompt" className="sr-only">
                            Kalimat Prompt Tebakan Tim
                          </label>
                          <textarea
                            id="inputGuessedPrompt"
                            rows={5}
                            required
                            placeholder="Ketik tebakan prompt gambar tim Anda di sini..."
                            value={guessPrompt}
                            onChange={(e) => setGuessPrompt(e.target.value)}
                            className="input-field font-mono-tabular text-sm leading-relaxed"
                          />
                          <div className="flex justify-between items-center text-xs font-mono-tabular text-[#484641] mt-1.5">
                            <span>Minimal 2 kata</span>
                            <span>{countWords(guessPrompt)} kata</span>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingGuess || countWords(guessPrompt) < 2}
                          className="btn-primary w-full text-base font-semibold"
                        >
                          {isSubmittingGuess ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          <span>
                            {isSubmittingGuess ? "Mengirimkan Tebakan..." : "Kirim Tebakan Tim"}
                          </span>
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FASE 5: ROUND_RESULTS */}
        {room?.status === "ROUND_RESULTS" && (
          <div className="space-y-6">
            {/* Tab Switcher antara Sandingan Hasil Tim vs Papan Skor */}
            <div className="flex items-center gap-3 border-b border-[#C8C3B8] pb-3">
              <button
                type="button"
                onClick={() => setPlayerResultTab("evaluation")}
                className={`py-2 px-5 rounded-[6px] font-mono-tabular text-xs font-bold transition-colors min-h-[44px] flex items-center gap-2 ${
                  playerResultTab === "evaluation"
                    ? "bg-[#141413] text-[#F4F1EA] border border-[#141413]"
                    : "bg-white text-[#141413] border border-[#C8C3B8] hover:bg-[#EAE6DC]"
                }`}
              >
                <span>Komparasi Sandingan</span>
              </button>
              <button
                type="button"
                onClick={() => setPlayerResultTab("leaderboard")}
                className={`py-2 px-5 rounded-[6px] font-mono-tabular text-xs font-bold transition-colors min-h-[44px] flex items-center gap-2 ${
                  playerResultTab === "leaderboard"
                    ? "bg-[#141413] text-[#F4F1EA] border border-[#141413]"
                    : "bg-white text-[#141413] border border-[#C8C3B8] hover:bg-[#EAE6DC]"
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Papan Skor Ronde</span>
              </button>
            </div>

            {playerResultTab === "evaluation" ? (
              <PlayerResultsComparison
                secretPrompt={room.secretPrompt}
                originalImageUrl={room.generatedImageUrl}
                makerName={room.makerTeamName || "Pembuat Gambar"}
                teamName={currentTeam.name}
                guessedPrompt={mySubmission?.guessed_prompt || guessPrompt}
                reconstructedImageUrl={mySubmission?.generated_image_url || reconstructedImageUrl}
                imageSource={mySubmission?.image_source}
                scoreData={mySubmission?.score_data}
                isGenerating={isGeneratingReconstruction}
                onRegenerate={() =>
                  generateReconstructionImage(mySubmission?.guessed_prompt || guessPrompt)
                }
                allSubmissions={submissions}
                isMaker={isMaker}
              />
            ) : (
              <LeaderboardView
                teams={teams}
                submissions={submissions}
                makerTeamId={room.makerTeamId}
                currentRound={room.currentRound}
                totalRounds={room.totalRounds}
                isFinal={false}
              />
            )}

            <div className="p-4 bg-white rounded-[6px] border border-[#C8C3B8] text-center text-xs font-mono-tabular text-[#484641]">
              Menunggu Controller melanjutkan ke ronde berikutnya atau membuka rekapitulasi akhir...
            </div>
          </div>
        )}

        {/* FASE 6: FINAL_STANDINGS */}
        {room?.status === "FINAL_STANDINGS" && (() => {
          const sorted = [...teams].sort((a, b) => b.score - a.score);
          const myTeamRank = currentTeam ? sorted.findIndex((t) => t.id === currentTeam.id) + 1 : undefined;
          const myTeamData = currentTeam ? teams.find((t) => t.id === currentTeam.id) : undefined;

          return (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="panel-frame p-4 sm:p-6 bg-white border border-[#141413] text-center space-y-2">
                <span className="font-mono-tabular text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#141413] text-white">
                  Sesi Berakhir
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-[#141413]">
                  Seluruh Ronde Selesai
                </h1>
                <p className="text-xs sm:text-sm text-[#484641] max-w-md mx-auto leading-relaxed">
                  Hasil akhir dapat dilihat pada layar utama. Silakan isi formulir evaluasi pembelajaran di bawah ini.
                </p>
              </div>

              {currentTeam && (
                <>
                  <StudentPostTestSection
                    roomCode={roomCode}
                    teamId={currentTeam.id}
                    teamName={currentTeam.name}
                    onCompleted={() => showAlert("Jawaban post-test tersimpan. Lanjutkan ke formulir evaluasi di bawah ini.", "success")}
                  />

                  <StudentFeedbackSection
                    roomCode={roomCode}
                    teamId={currentTeam.id}
                    teamName={currentTeam.name}
                    teamRank={myTeamRank && myTeamRank > 0 ? myTeamRank : undefined}
                    teamScore={myTeamData?.score}
                    onSuccess={() => showAlert("Tanggapan evaluasi tim Anda telah tersimpan.", "success")}
                  />
                </>
              )}
            </div>
          );
        })()}
      </main>
    </div>
  );
}
