"use client";

import React, { useEffect, useState } from "react";
import { Clock, Pause } from "lucide-react";

interface CountdownTimerProps {
  timerEndsAt: string | null;
  timerRemaining: number | null;
  timerPaused: boolean;
  totalDuration?: number;
  onExpire?: () => void;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  timerEndsAt,
  timerRemaining,
  timerPaused,
  totalDuration = 60,
  onExpire,
  label,
  size = "md",
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (timerPaused) return timerRemaining ?? 0;
    if (timerEndsAt) {
      return Math.max(0, Math.floor((new Date(timerEndsAt).getTime() - Date.now()) / 1000));
    }
    return 0;
  });

  useEffect(() => {
    if (timerPaused) {
      setSecondsLeft(timerRemaining ?? 0);
      return;
    }

    if (!timerEndsAt) {
      setSecondsLeft(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const end = new Date(timerEndsAt).getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setSecondsLeft(diff);

      if (diff === 0 && onExpire) {
        onExpire();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);

    return () => clearInterval(interval);
  }, [timerEndsAt, timerRemaining, timerPaused, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isUrgent = secondsLeft <= 10 && secondsLeft > 0;
  const isZero = secondsLeft === 0;

  // Percentage for progress bar
  const pct = Math.min(100, Math.max(0, (secondsLeft / Math.max(1, totalDuration)) * 100));

  if (size === "sm") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] font-mono-tabular text-xs font-semibold border min-h-[36px] ${
          timerPaused
            ? "bg-[#EAE6DC] text-[#141413] border-[#C8C3B8]"
            : isUrgent
            ? "bg-[#B83214] text-white border-[#141413]"
            : "bg-[#141413] text-[#F4F1EA] border-[#141413]"
        }`}
      >
        <Clock className="w-3.5 h-3.5" />
        <span>{formatted}</span>
        {timerPaused && <span className="text-[11px] text-[#484641]">(Jeda)</span>}
      </div>
    );
  }

  if (size === "lg") {
    return (
      <div className="flex flex-col items-center">
        {label && (
          <span className="text-xs font-mono-tabular uppercase tracking-wider text-[#484641] mb-1.5 font-semibold">
            {label}
          </span>
        )}
        <div
          className={`flex items-center gap-2 px-5 py-2 rounded-[6px] font-mono-tabular font-bold text-3xl sm:text-4xl border-2 transition-colors ${
            timerPaused
              ? "bg-[#EAE6DC] text-[#141413] border-[#C8C3B8]"
              : isUrgent
              ? "bg-[#B83214] text-white border-[#141413]"
              : isZero
              ? "bg-[#EAE6DC] text-[#484641] border-[#C8C3B8]"
              : "bg-[#141413] text-[#F4F1EA] border-[#141413]"
          }`}
          role="timer"
          aria-live="polite"
        >
          {timerPaused ? <Pause className="w-6 h-6 text-[#141413]" /> : <Clock className="w-6 h-6" />}
          <span>{formatted}</span>
          {timerPaused && <span className="text-xs font-mono-tabular text-[#484641] ml-1 uppercase">Jeda</span>}
        </div>
        {/* Progress bar */}
        <div className="w-48 sm:w-64 h-2 bg-[#EAE6DC] rounded-[4px] border border-[#C8C3B8] mt-2.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isUrgent ? "bg-[#B83214]" : timerPaused ? "bg-[#484641]" : "bg-[#165B33]"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  // Medium (default)
  return (
    <div className="flex items-center gap-2">
      <div
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] font-mono-tabular font-bold text-lg sm:text-xl border transition-colors min-h-[44px] ${
          timerPaused
            ? "bg-[#EAE6DC] text-[#141413] border-[#C8C3B8]"
            : isUrgent
            ? "bg-[#B83214] text-white border-[#141413]"
            : "bg-[#141413] text-[#F4F1EA] border-[#141413]"
        }`}
        role="timer"
        aria-live="polite"
      >
        {timerPaused ? <Pause className="w-4 h-4 text-[#141413]" /> : <Clock className="w-4 h-4" />}
        <span>{formatted}</span>
        {timerPaused && <span className="text-xs font-mono-tabular text-[#484641] ml-1 uppercase">(Jeda)</span>}
      </div>
    </div>
  );
};
