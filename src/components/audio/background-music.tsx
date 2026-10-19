"use client";

import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Music } from "lucide-react";

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showPanel, setShowPanel] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inisialisasi audio dan restore preferensi user dari localStorage
  useEffect(() => {
    const savedMuted = localStorage.getItem("mpi_bgm_muted");
    const savedVolume = localStorage.getItem("mpi_bgm_volume");

    const initialMuted = savedMuted === "true";
    const initialVolume = savedVolume ? parseFloat(savedVolume) : 0.3;

    setIsMuted(initialMuted);
    setVolume(initialVolume);

    if (audioRef.current) {
      audioRef.current.volume = initialMuted ? 0 : initialVolume;
    }

    setIsInitialized(true);
  }, []);

  // Penanganan Autoplay Browser: Putar audio saat pertama kali ada gesture interaksi
  useEffect(() => {
    if (!isInitialized) return;

    const audio = audioRef.current;
    if (!audio) return;

    const tryPlay = async () => {
      if (isMuted) return;
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        // Autoplay terblokir sementara oleh browser hingga user melakukan klik/sentuhan
        setIsPlaying(false);
      }
    };

    tryPlay();

    // Event listener gesture pengguna saat browser menahan autoplay
    const handleFirstGesture = () => {
      if (audio.paused && !isMuted) {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    };

    window.addEventListener("click", handleFirstGesture, { passive: true });
    window.addEventListener("keydown", handleFirstGesture, { passive: true });
    window.addEventListener("touchstart", handleFirstGesture, { passive: true });

    return () => {
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
    };
  }, [isInitialized, isMuted]);

  // Handler toggle Mute / Unmute
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem("mpi_bgm_muted", String(nextMuted));

    if (nextMuted) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.volume = volume > 0 ? volume : 0.3;
      if (volume === 0) {
        setVolume(0.3);
        localStorage.setItem("mpi_bgm_volume", "0.3");
      }
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  // Handler perubahan Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    localStorage.setItem("mpi_bgm_volume", String(newVolume));

    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
      if (newVolume === 0) {
        setIsMuted(true);
        localStorage.setItem("mpi_bgm_muted", "true");
        audio.pause();
        setIsPlaying(false);
      } else {
        if (isMuted) {
          setIsMuted(false);
          localStorage.setItem("mpi_bgm_muted", "false");
        }
        if (audio.paused) {
          audio
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => {});
        }
      }
    }
  };

  return (
    <>
      {/* Element Audio HTML5: Memutar bgm.mp3 secara berulang */}
      <audio
        ref={audioRef}
        src="/audio/bgm.mp3"
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Floating BGM Controller Bar di Sudut Kanan Bawah */}
      <aside
        aria-label="Pengontrol Musik Latar Permainan"
        onMouseEnter={() => setShowPanel(true)}
        onMouseLeave={() => setShowPanel(false)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 select-none"
      >
        {/* Panel Pengaturan Volume (Muncul saat hover / toggle) */}
        {showPanel && (
          <div className="flex items-center gap-3 bg-[#141413] text-[#F4F1EA] px-3.5 py-2 rounded-full border border-[#383835] shadow-xl text-xs font-mono-tabular">
            <span className="font-semibold text-white flex items-center gap-1.5 whitespace-nowrap">
              <Music className="w-3.5 h-3.5 text-[#B83214]" />
              <span>Musik Latar</span>
            </span>

            {/* Slider Volume */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 sm:w-24 h-1.5 bg-[#383835] rounded-lg appearance-none cursor-pointer accent-[#B83214]"
              aria-label="Volume Musik Latar"
            />

            <span className="text-[11px] text-[#D0CCC3] w-8 text-right font-mono-tabular">
              {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
            </span>
          </div>
        )}

        {/* Tombol Utama Kontrol Musik */}
        <button
          type="button"
          onClick={toggleMute}
          onMouseEnter={() => setShowPanel(true)}
          title={isMuted ? "Nyalakan Musik Latar" : "Matikan Musik Latar"}
          aria-label={isMuted ? "Nyalakan Musik Latar" : "Matikan Musik Latar"}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border-2 transition-all min-h-[44px] shadow-md font-mono-tabular text-xs ${
            !isMuted && isPlaying
              ? "bg-[#141413] text-[#F4F1EA] border-[#141413] hover:bg-[#252523]"
              : "bg-[#EAE6DC] text-[#484641] border-[#C8C3B8] hover:bg-[#DCD7CD] hover:text-[#141413]"
          }`}
        >
          {/* Animated Equalizer Wave Bars saat memutar */}
          {!isMuted && isPlaying ? (
            <div className="flex items-end gap-0.5 h-4 w-3.5 justify-center" aria-hidden="true">
              <span className="w-0.5 bg-[#B83214] rounded-full animate-music-bar-1" />
              <span className="w-0.5 bg-[#F4F1EA] rounded-full animate-music-bar-2" />
              <span className="w-0.5 bg-[#B83214] rounded-full animate-music-bar-3" />
            </div>
          ) : (
            <VolumeX className="w-4 h-4 text-[#B83214]" />
          )}

          {/* Icon Speaker saat aktif */}
          {!isMuted && isPlaying ? (
            <Volume2 className="w-4 h-4 text-[#F4F1EA]" />
          ) : null}

          {/* Status Label Ringkas */}
          <span className="font-bold tracking-wider uppercase">
            {!isMuted && isPlaying ? "BGM" : "Mute"}
          </span>
        </button>
      </aside>
    </>
  );
}
