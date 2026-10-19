"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRoomSync } from "@/lib/useRoomSync";
import { ControllerNavbar } from "@/components/ControllerNavbar";
import { ControllerLobbyView } from "@/components/ControllerLobbyView";
import { ControllerMakingView } from "@/components/ControllerMakingView";
import { DiscussionModal } from "@/components/DiscussionModal";
import { ControllerGuessingView } from "@/components/ControllerGuessingView";
import { ControllerResultsView } from "@/components/ControllerResultsView";
import { ControllerStandingsView } from "@/components/ControllerStandingsView";
import { LeaderboardModal } from "@/components/LeaderboardModal";
import { ApiSettingsModal } from "@/components/ApiSettingsModal";
import { Footer } from "@/components/Footer";
import { ApiConfig } from "@/lib/types";
import { renderCanvasImageFromPrompt } from "@/lib/canvas-fallback";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ControllerPage() {
  const [roomCode, setRoomCode] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    type: "info" | "error" | "success";
  } | null>(null);

  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    workerUrl: "",
    accountId: "",
    apiToken: "",
    agnesApiKey: "",
    selectedModel: "agnes-image-2.1-flash",
  });

  // Load API config
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mpi_gambar_api_config");
      if (saved) {
        setApiConfig(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveApiConfig = (newConfig: ApiConfig) => {
    setApiConfig(newConfig);
    try {
      localStorage.setItem("mpi_gambar_api_config", JSON.stringify(newConfig));
    } catch {
      // ignore
    }
    showAlert("Pengaturan Model AI berhasil disimpan.", "success");
  };

  const showAlert = (
    message: string,
    type: "info" | "error" | "success" = "info"
  ) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  // Initialize or fetch active room
  const initializeRoom = useCallback(async (forcedCode?: string) => {
    setIsInitializing(true);
    try {
      let codeToUse = forcedCode || localStorage.getItem("mpi_controller_room");

      if (!codeToUse) {
        // Create new room with random 4-digit PIN
        const res = await fetch("/api/room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ totalRounds: 3 }),
        });
        const data = await res.json();
        if (data.success && data.roomCode) {
          codeToUse = data.roomCode;
        }
      }

      if (codeToUse) {
        setRoomCode(codeToUse.toUpperCase());
        localStorage.setItem("mpi_controller_room", codeToUse.toUpperCase());
      }
    } catch (err) {
      console.error("Room init error:", err);
      showAlert("Gagal menginisialisasi ruangan. Periksa koneksi.", "error");
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    initializeRoom();
  }, [initializeRoom]);

  // Real-time synchronization with Supabase
  const { room, teams, submissions, loading, error, isConnected, refresh } = useRoomSync({
    roomCode: roomCode || null,
  });

  // Update room settings (rounds, durations, model)
  const handleUpdateSettings = async (settings: {
    totalRounds?: number;
    discussionDuration?: number;
    guessDuration?: number;
    aiModel?: string;
  }) => {
    if (!roomCode) return;
    try {
      const res = await fetch("/api/room", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode, ...settings }),
      });
      if (res.ok) {
        refresh();
        showAlert("Pengaturan permainan berhasil diperbarui.", "success");
      }
    } catch (err) {
      showAlert("Gagal memperbarui pengaturan", "error");
    }
  };

  // Start game from lobby
  const handleStartGame = async () => {
    if (!roomCode) return;
    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "START_GAME", roomCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showAlert("Permainan Ronde 1 dimulai!", "success");
        refresh();
      } else {
        showAlert(data.error || "Gagal memulai permainan", "error");
      }
    } catch (err) {
      showAlert("Gagal menghubungi server", "error");
    }
  };

  // Kick/delete team
  const handleKickTeam = async (teamId: string) => {
    if (!roomCode) return;
    try {
      const res = await fetch(
        `/api/teams?teamId=${encodeURIComponent(teamId)}&roomCode=${encodeURIComponent(roomCode)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        showAlert("Tim berhasil dikeluarkan.", "info");
        refresh();
      }
    } catch (err) {
      showAlert("Gagal mengeluarkan tim", "error");
    }
  };

  // Lock image & start discussion countdown
  const handleLockAndDiscuss = async (data: {
    secretPrompt?: string;
    generatedImageUrl?: string;
    imageSource?: string;
    englishPrompt?: string;
  }) => {
    if (!roomCode) return;
    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "LOCK_AND_DISCUSS",
          roomCode,
          ...data,
        }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showAlert("Gambar berhasil dikunci! Sesi diskusi dimulai.", "success");
        refresh();
      } else {
        showAlert(resData.error || "Gagal mengunci gambar", "error");
      }
    } catch (err) {
      showAlert("Gagal menghubungi server", "error");
    }
  };

  // Start guessing phase (skip discussion or auto-triggered)
  const handleStartGuessing = async () => {
    if (!roomCode) return;
    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "START_GUESSING", roomCode }),
      });
      if (res.ok) {
        showAlert("Waktu diskusi selesai! Sesi input tebakan telah dibuka.", "success");
        refresh();
      }
    } catch (err) {
      showAlert("Gagal membuka sesi tebak", "error");
    }
  };

  // Timer control (Pause, Resume, Add 30, Skip)
  const handleTimerControl = async (subAction: "PAUSE" | "RESUME" | "ADD_30" | "SKIP") => {
    if (!roomCode) return;
    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TIMER_CONTROL",
          roomCode,
          subAction,
        }),
      });
      if (res.ok) {
        refresh();
      }
    } catch (err) {
      console.warn("Timer control failed:", err);
    }
  };

  // Evaluate round
  const handleEvaluateRound = async () => {
    if (!roomCode) return;
    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "EVALUATE_ROUND", roomCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showAlert("Ronde berhasil dievaluasi!", "success");
        refresh();
      } else {
        showAlert(data.error || "Gagal mengevaluasi ronde", "error");
      }
    } catch (err) {
      showAlert("Gagal menghubungi server", "error");
    }
  };

  // Next round
  const handleNextRound = async () => {
    if (!roomCode) return;
    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "NEXT_ROUND", roomCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        refresh();
      } else {
        showAlert(data.error || "Gagal lanjut ke ronde berikutnya", "error");
      }
    } catch (err) {
      showAlert("Gagal menghubungi server", "error");
    }
  };

  // Adjust score
  const handleAdjustScore = async (submissionId: string, delta: number) => {
    if (!roomCode) return;
    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADJUST_SCORE",
          roomCode,
          submissionId,
          delta,
        }),
      });
      if (res.ok) {
        refresh();
      }
    } catch (err) {
      showAlert("Gagal menyesuaikan skor", "error");
    }
  };

  // Assist / Curated challenge fallback for Maker
  const handleGenerateFallback = async (promptText: string) => {
    if (!roomCode) return;
    try {
      let imageUrl = "";
      let source = "";

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          model: room?.aiModel || "agnes-image-2.1-flash",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.image) {
          imageUrl = data.image;
          source = data.source || "AI";
        }
      }

      if (!imageUrl) {
        imageUrl = renderCanvasImageFromPrompt(promptText);
        source = "canvas-fallback";
      }

      await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_PROMPT",
          roomCode,
          secretPrompt: promptText,
          generatedImageUrl: imageUrl,
          imageSource: source,
        }),
      });

      refresh();
    } catch (err) {
      showAlert("Gagal membangkitkan gambar fallback", "error");
    }
  };

  // Reset or create brand new room
  const handleNewRoom = async () => {
    if (confirm("Buat ruangan permainan baru? Ruangan lama akan ditinggalkan.")) {
      localStorage.removeItem("mpi_controller_room");
      await initializeRoom();
      showAlert("Ruangan baru berhasil dibuat!", "success");
    }
  };

  if (isInitializing || (loading && !room)) {
    return (
      <main className="min-h-screen bg-[#F4F1EA] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="inline-block w-8 h-8 border-2 border-[#141413] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-mono-tabular text-[#484641]">Menyiapkan Meja Kendali Sesi...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F4F1EA] text-[#141413]">
      {/* Top Controller Navigation */}
      <ControllerNavbar
        roomCode={roomCode}
        currentRound={room?.currentRound || 1}
        totalRounds={room?.totalRounds || 3}
        isConnected={isConnected}
        onNewRoom={handleNewRoom}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onShowAlert={showAlert}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1">
        {alert && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 p-4 rounded-[6px] border-2 border-[#141413] bg-white flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-3 h-3 rounded-full shrink-0 ${
                  alert.type === "error"
                    ? "bg-[#B83214]"
                    : alert.type === "success"
                    ? "bg-[#165B33]"
                    : "bg-[#1D3557]"
                }`}
              />
              <p className="text-sm font-medium text-[#141413] font-mono-tabular">
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

        {/* 1. LOBBY VIEW */}
        {room?.status === "LOBBY" && (
          <ControllerLobbyView
            roomCode={roomCode}
            teams={teams}
            totalRounds={room.totalRounds}
            makerDuration={room.makerDuration}
            discussionDuration={room.discussionDuration}
            guessDuration={room.guessDuration}
            aiModel={room.aiModel}
            onUpdateSettings={handleUpdateSettings}
            onStartGame={handleStartGame}
            onKickTeam={handleKickTeam}
            onShowAlert={showAlert}
          />
        )}

        {/* 2. MAKER PHASE VIEW */}
        {room?.status === "ROUND_MAKING" && (
          <ControllerMakingView
            room={room}
            onLockAndDiscuss={handleLockAndDiscuss}
            onGenerateFallback={handleGenerateFallback}
            onTimerControl={handleTimerControl}
            onShowAlert={showAlert}
          />
        )}

        {/* 3. DISCUSSION POPUP MODAL (For Controller & Teams) */}
        <DiscussionModal
          isOpen={room?.status === "ROUND_DISCUSSION"}
          isController={true}
          currentRound={room?.currentRound || 1}
          totalRounds={room?.totalRounds || 3}
          makerTeamName={room?.makerTeamName || "Pembuat Gambar"}
          imageUrl={room?.generatedImageUrl || ""}
          secretPrompt={room?.secretPrompt || ""}
          timerEndsAt={room?.timerEndsAt || null}
          timerRemaining={room?.timerRemaining || null}
          timerPaused={room?.timerPaused || false}
          totalDuration={room?.discussionDuration || 60}
          onTimerControl={handleTimerControl}
          onStartGuessing={handleStartGuessing}
        />

        {/* 4. GUESSING PHASE VIEW */}
        {room?.status === "ROUND_GUESSING" && (
          <ControllerGuessingView
            room={room}
            teams={teams}
            submissions={submissions}
            onTimerControl={handleTimerControl}
            onEvaluateRound={handleEvaluateRound}
            onShowAlert={showAlert}
          />
        )}

        {/* 5. RESULTS PHASE VIEW */}
        {room?.status === "ROUND_RESULTS" && (
          <ControllerResultsView
            room={room}
            teams={teams}
            submissions={submissions}
            onNextRound={handleNextRound}
            onAdjustScore={handleAdjustScore}
            onShowAlert={showAlert}
          />
        )}

        {/* 6. FINAL STANDINGS VIEW */}
        {room?.status === "FINAL_STANDINGS" && (
          <ControllerStandingsView
            roomCode={roomCode}
            teams={teams}
            onResetGame={async () => {
              await fetch("/api/room", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomCode, resetTeams: true }),
              });
              refresh();
            }}
          />
        )}
      </main>

      {/* AI Settings Modal */}
      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={apiConfig}
        onSave={handleSaveApiConfig}
      />

      {/* Global Controller Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        teams={teams}
        submissions={submissions}
        makerTeamId={room?.makerTeamId}
        currentRound={room?.currentRound || 1}
        totalRounds={room?.totalRounds || 3}
        isFinal={room?.status === "FINAL_STANDINGS"}
      />

      <Footer />
    </div>
  );
}
