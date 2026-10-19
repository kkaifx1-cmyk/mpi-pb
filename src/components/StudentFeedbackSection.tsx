"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Star, Check, Edit3, Loader2 } from "lucide-react";
import { MultiplayerFeedback } from "@/lib/types";

interface StudentFeedbackSectionProps {
  roomCode: string;
  teamId: string;
  teamName: string;
  teamRank?: number;
  teamScore?: number;
  onSuccess?: () => void;
}

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: "1 dari 5 - Kurang memadai",
  2: "2 dari 5 - Perlu perbaikan",
  3: "3 dari 5 - Cukup baik",
  4: "4 dari 5 - Baik dan aplikatif",
  5: "5 dari 5 - Sangat baik dan bermanfaat",
};

const TODAY_PROMPTS = [
  "Penyusunan kata kunci detail",
  "Pemilihan gaya dan pencahayaan",
  "Koordinasi dan diskusi tim",
  "Analisis rekonstruksi visual",
];

const FUTURE_PROMPTS = [
  "Prompt karakter 3D",
  "Latar arsitektur dan sejarah",
  "Mode tebak cepat berbatas waktu",
  "Studi kasus gaya visual modern",
];

export const StudentFeedbackSection: React.FC<StudentFeedbackSectionProps> = ({
  roomCode,
  teamId,
  teamName,
  teamRank,
  teamScore,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [todayFeedback, setTodayFeedback] = useState<string>("");
  const [futureFeedback, setFutureFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
  const [submittedFeedback, setSubmittedFeedback] = useState<MultiplayerFeedback | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const starRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchExistingFeedback() {
      if (!roomCode || !teamId) {
        if (isMounted) setIsLoadingInitial(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/feedback?code=${encodeURIComponent(roomCode)}&teamId=${encodeURIComponent(teamId)}`
        );
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.success && data.myFeedback) {
            setSubmittedFeedback(data.myFeedback);
            setRating(data.myFeedback.rating || 5);
            setTodayFeedback(data.myFeedback.today_feedback || "");
            setFutureFeedback(data.myFeedback.future_feedback || "");
          }
        }
      } catch (err) {
        console.warn("Failed to load feedback:", err);
      } finally {
        if (isMounted) setIsLoadingInitial(false);
      }
    }

    fetchExistingFeedback();
    return () => {
      isMounted = false;
    };
  }, [roomCode, teamId]);

  // WAI-ARIA radiogroup keyboard navigation: arrows move focus and select rating
  const handleStarKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = index < 5 ? index + 1 : 1;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = index > 1 ? index - 1 : 5;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 1;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = 5;
    }

    if (nextIndex > 0) {
      setRating(nextIndex);
      starRefs.current[nextIndex - 1]?.focus();
    }
  };

  const handleAppendPrompt = (text: string, target: "today" | "future") => {
    if (target === "today") {
      setTodayFeedback((prev) => {
        const trimmed = prev.trim();
        if (!trimmed) return text;
        if (trimmed.includes(text)) return trimmed;
        return `${trimmed}. ${text}`;
      });
    } else {
      setFutureFeedback((prev) => {
        const trimmed = prev.trim();
        if (!trimmed) return text;
        if (trimmed.includes(text)) return trimmed;
        return `${trimmed}. ${text}`;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanToday = todayFeedback.trim();
    const cleanFuture = futureFeedback.trim();

    if (!cleanToday) {
      setErrorMsg("Isian evaluasi pembelajaran hari ini belum dilengkapi.");
      return;
    }

    if (!cleanFuture) {
      setErrorMsg("Isian usulan pembelajaran berikutnya belum dilengkapi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode,
          teamId,
          teamName,
          rating,
          todayFeedback: cleanToday,
          futureFeedback: cleanFuture,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.feedback) {
        setSubmittedFeedback(data.feedback);
        setIsEditing(false);
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(data.error || "Gagal menyimpan formulir evaluasi. Silakan coba kembali.");
      }
    } catch {
      setErrorMsg("Koneksi gagal. Periksa jaringan internet perangkat Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRating = hoverRating || rating;
  const currentRatingText = RATING_DESCRIPTIONS[activeRating] || RATING_DESCRIPTIONS[5];

  if (isLoadingInitial) {
    return (
      <section
        aria-label="Memuat formulir evaluasi"
        className="panel-frame p-6 bg-white border border-[#141413] text-center"
      >
        <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#141413]" aria-hidden="true" />
        <p className="text-xs font-mono-tabular text-[#484641] mt-2">
          Memuat formulir evaluasi pembelajaran...
        </p>
      </section>
    );
  }

  if (submittedFeedback && !isEditing) {
    return (
      <section
        aria-label="Ringkasan evaluasi tim"
        className="panel-frame p-4 sm:p-6 bg-white border border-[#141413] space-y-5"
      >
        <div className="p-4 rounded border border-[#165B33] bg-[#F2F8F4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className="w-5 h-5 rounded-full bg-[#165B33] text-white flex items-center justify-center shrink-0 mt-0.5"
              aria-hidden="true"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-[#141413]">
                Evaluasi pembelajaran telah tercatat
              </h2>
              <p className="text-xs text-[#2E7D32] mt-0.5">
                Tanggapan tim {teamName} telah disimpan dan terangkum pada layar instruktur.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="btn-secondary min-h-[44px] text-xs px-4 py-2 self-start sm:self-auto border border-[#141413] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#141413]"
          >
            <Edit3 className="w-4 h-4 mr-1.5" aria-hidden="true" />
            <span>Perbarui Tanggapan</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="border-b border-[#C8C3B8] pb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold font-mono-tabular uppercase tracking-wider text-[#484641]">
              Ringkasan Nilai &amp; Catatan Tim
            </span>
            <div
              className="flex items-center gap-1"
              aria-label={`Rating tersimpan: ${submittedFeedback.rating} dari 5`}
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= submittedFeedback.rating;
                return (
                  <Star
                    key={star}
                    aria-hidden="true"
                    className={`w-4 h-4 ${
                      filled
                        ? "text-[#D97706] fill-[#D97706]"
                        : "text-[#6B7280]"
                    }`}
                  />
                );
              })}
              <span className="text-xs font-bold font-mono-tabular text-[#141413] ml-1">
                ({submittedFeedback.rating}/5)
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded border border-[#C8C3B8] bg-[#FAF8F5]">
              <h3 className="text-xs font-bold text-[#141413] mb-1">
                Evaluasi Pembelajaran Hari Ini
              </h3>
              <p className="text-sm text-[#141413] font-mono-tabular leading-relaxed whitespace-pre-wrap">
                {submittedFeedback.today_feedback}
              </p>
            </div>

            <div className="p-3.5 rounded border border-[#C8C3B8] bg-[#FAF8F5]">
              <h3 className="text-xs font-bold text-[#141413] mb-1">
                Usulan Pembelajaran Berikutnya
              </h3>
              <p className="text-sm text-[#141413] font-mono-tabular leading-relaxed whitespace-pre-wrap">
                {submittedFeedback.future_feedback}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="feedback-form-title"
      className="panel-frame p-4 sm:p-6 bg-white border border-[#141413] space-y-6 text-left"
    >
      <header className="border-b border-[#C8C3B8] pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-mono-tabular text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#141413] text-white">
            Formulir Evaluasi
          </span>
          {typeof teamRank === "number" && (
            <span className="font-mono-tabular text-xs font-semibold px-2 py-0.5 rounded border border-[#C8C3B8] text-[#141413]">
              Peringkat #{teamRank} ({teamScore || 0} Poin)
            </span>
          )}
        </div>
        <h2 id="feedback-form-title" className="text-xl sm:text-2xl font-bold text-[#141413]">
          Refleksi Pembelajaran Sesi Ini
        </h2>
        <p className="text-xs sm:text-sm text-[#484641] mt-1 leading-relaxed">
          Sampaikan penilaian objektif dan masukan tim {teamName} untuk perbaikan modul serta sesi latihan berikutnya.
        </p>
      </header>

      {errorMsg && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3 rounded border border-[#B83214] bg-[#FDF2F2] text-xs font-mono-tabular text-[#96270E]"
        >
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
            <span id="rating-group-label" className="text-sm font-bold text-[#141413]">
              1. Rating Keseluruhan Sesi
            </span>
            <span
              aria-live="polite"
              className="text-xs font-semibold font-mono-tabular text-[#141413]"
            >
              {currentRatingText}
            </span>
          </div>
          <p id="rating-desc" className="text-xs text-[#484641] mb-3">
            Pilih skala 1 (kurang memadai) hingga 5 (sangat baik dan bermanfaat).
          </p>

          <div
            role="radiogroup"
            aria-labelledby="rating-group-label"
            aria-describedby="rating-desc"
            className="flex items-center gap-1 sm:gap-2"
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const isSelected = rating === star;
              const isHighlighted = star <= (hoverRating || rating);

              return (
                <button
                  key={star}
                  ref={(el) => {
                    starRefs.current[star - 1] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`${star} bintang: ${RATING_DESCRIPTIONS[star]}`}
                  tabIndex={isSelected || (rating === 0 && star === 1) ? 0 : -1}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onKeyDown={(e) => handleStarKeyDown(e, star)}
                  className="min-h-[44px] min-w-[44px] p-2 rounded flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#141413] border border-transparent hover:border-[#C8C3B8]"
                >
                  <Star
                    aria-hidden="true"
                    className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                      isHighlighted
                        ? "text-[#D97706] fill-[#D97706]"
                        : "text-[#6B7280] hover:text-[#141413]"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="todayFeedback"
              className="text-sm font-bold text-[#141413]"
            >
              2. Bagaimana pembelajaran hari ini?
            </label>
            <span className="text-xs font-mono-tabular text-[#484641]">
              Wajib diisi
            </span>
          </div>
          <p id="today-help" className="text-xs text-[#484641] leading-relaxed">
            Sampaikan apa yang berhasil dipelajari, kendala teknis saat menyusun prompt, atau efektivitas diskusi tim.
          </p>

          <textarea
            id="todayFeedback"
            name="todayFeedback"
            rows={3}
            required
            aria-required="true"
            aria-describedby="today-help"
            value={todayFeedback}
            onChange={(e) => setTodayFeedback(e.target.value)}
            placeholder="Tuliskan pengalaman atau evaluasi proses pembelajaran tim..."
            className="input-field font-mono-tabular text-base sm:text-sm leading-relaxed w-full min-h-[96px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
          />

          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-mono-tabular text-[#484641] block">
              Pilihan topik cepat:
            </span>
            <div className="flex flex-wrap gap-2">
              {TODAY_PROMPTS.map((promptText, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAppendPrompt(promptText, "today")}
                  className="min-h-[44px] text-xs font-mono-tabular px-3 py-2 rounded border border-[#C8C3B8] bg-[#FAF8F5] text-[#141413] hover:bg-[#EAE6DC] active:bg-[#DCD8CF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
                >
                  + {promptText}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="futureFeedback"
              className="text-sm font-bold text-[#141413]"
            >
              3. Pembelajaran berikutnya mau seperti apa?
            </label>
            <span className="text-xs font-mono-tabular text-[#484641]">
              Wajib diisi
            </span>
          </div>
          <p id="future-help" className="text-xs text-[#484641] leading-relaxed">
            Sampaikan usulan topik, eksplorasi gaya gambar, atau mekanisme latihan yang diharapkan pada pertemuan selanjutnya.
          </p>

          <textarea
            id="futureFeedback"
            name="futureFeedback"
            rows={3}
            required
            aria-required="true"
            aria-describedby="future-help"
            value={futureFeedback}
            onChange={(e) => setFutureFeedback(e.target.value)}
            placeholder="Tuliskan topik atau format latihan yang ingin dipelajari berikutnya..."
            className="input-field font-mono-tabular text-base sm:text-sm leading-relaxed w-full min-h-[96px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
          />

          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-mono-tabular text-[#484641] block">
              Pilihan topik cepat:
            </span>
            <div className="flex flex-wrap gap-2">
              {FUTURE_PROMPTS.map((promptText, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAppendPrompt(promptText, "future")}
                  className="min-h-[44px] text-xs font-mono-tabular px-3 py-2 rounded border border-[#C8C3B8] bg-[#FAF8F5] text-[#141413] hover:bg-[#EAE6DC] active:bg-[#DCD8CF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
                >
                  + {promptText}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="min-h-[44px] px-2 text-xs font-mono-tabular underline text-[#484641] hover:text-[#141413] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
              >
                Batal perbarui
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !todayFeedback.trim() || !futureFeedback.trim()}
            aria-busy={isSubmitting}
            className="btn-primary min-h-[44px] w-full sm:w-auto px-6 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#141413]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
                <span>Menyimpan Tanggapan...</span>
              </>
            ) : (
              <span>Simpan Tanggapan Evaluasi</span>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
