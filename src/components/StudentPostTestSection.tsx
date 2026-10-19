"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Check, Edit3, Loader2, ArrowRight, Eye } from "lucide-react";
import { MultiplayerPostTest } from "@/lib/types";

interface RoundHistorySubmission {
  id?: string;
  team_id: string;
  team_name: string;
  guessed_prompt: string;
  generated_image_url?: string;
  image_source?: string;
  score_data?: {
    totalScore?: number;
    similarityScore?: number;
    peScore?: number;
  };
}

interface RoundHistoryEntry {
  round_number: number;
  maker_name: string;
  secret_prompt: string;
  generated_image_url?: string;
  submissions?: RoundHistorySubmission[];
}

interface StudentPostTestSectionProps {
  roomCode: string;
  teamId: string;
  teamName: string;
  onCompleted?: () => void;
}

export const StudentPostTestSection: React.FC<StudentPostTestSectionProps> = ({
  roomCode,
  teamId,
  teamName,
  onCompleted,
}) => {
  const [history, setHistory] = useState<RoundHistoryEntry[]>([]);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [submittedPostTest, setSubmittedPostTest] = useState<MultiplayerPostTest | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedSubmissionPerRound, setSelectedSubmissionPerRound] = useState<Record<number, string>>({});
  const [enlargedImage, setEnlargedImage] = useState<{ url: string; title: string } | null>(null);

  const loadData = useCallback(async () => {
    if (!roomCode) return;
    try {
      const [historyRes, postTestRes] = await Promise.all([
        fetch(`/api/history?code=${encodeURIComponent(roomCode)}`),
        fetch(
          `/api/post-test?code=${encodeURIComponent(roomCode)}&teamId=${encodeURIComponent(teamId)}`
        ),
      ]);

      if (historyRes.ok) {
        const hData = await historyRes.json();
        if (hData.success) {
          setHistory(hData.history || []);
        }
      }

      if (postTestRes.ok) {
        const ptData = await postTestRes.json();
        if (ptData.success && ptData.myPostTest) {
          setSubmittedPostTest(ptData.myPostTest);
          setAnswer(ptData.myPostTest.answer || "");
        }
      }
    } catch (err) {
      console.warn("Failed to load post test data:", err);
    } finally {
      setIsLoadingInitial(false);
    }
  }, [roomCode, teamId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanAnswer = answer.trim();
    if (!cleanAnswer) {
      setErrorMsg("Mohon lengkapi jawaban uraian sebelum mengirimkan.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/post-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode,
          teamId,
          teamName,
          answer: cleanAnswer,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.postTest) {
        setSubmittedPostTest(data.postTest);
        setIsEditing(false);
        if (onCompleted) onCompleted();
      } else {
        setErrorMsg(data.error || "Gagal menyimpan jawaban. Silakan coba kembali.");
      }
    } catch {
      setErrorMsg("Koneksi gagal. Periksa koneksi internet perangkat Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingInitial) {
    return (
      <section
        aria-label="Memuat soal evaluasi akhir"
        className="panel-frame p-6 bg-white border border-[#141413] text-center"
      >
        <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#141413]" aria-hidden="true" />
        <p className="text-xs font-mono-tabular text-[#484641] mt-2">
          Memuat data gambar ronde dan soal evaluasi akhir...
        </p>
      </section>
    );
  }

  if (submittedPostTest && !isEditing) {
    return (
      <section
        aria-label="Jawaban evaluasi akhir tim tersimpan"
        className="panel-frame p-4 sm:p-6 bg-white border border-[#141413] space-y-4"
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
                Post-Test Telah Selesai Dikerjakan
              </h2>
              <p className="text-xs text-[#2E7D32] mt-0.5">
                Jawaban uraian tim {teamName} telah berhasil disimpan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="btn-secondary min-h-[44px] text-xs px-4 py-2 self-start sm:self-auto border border-[#141413] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#141413]"
          >
            <Edit3 className="w-4 h-4 mr-1.5" aria-hidden="true" />
            <span>Perbarui Jawaban</span>
          </button>
        </div>

        <div className="p-4 rounded border border-[#C8C3B8] bg-[#FAF8F5] space-y-2">
          <span className="text-xs font-bold font-mono-tabular uppercase tracking-wider text-[#484641] block">
            Jawaban Uraian Tim:
          </span>
          <p className="text-sm text-[#141413] font-mono-tabular leading-relaxed whitespace-pre-wrap">
            {submittedPostTest.answer}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="post-test-title"
      className="panel-frame p-4 sm:p-6 bg-white border border-[#141413] space-y-6 text-left"
    >
      <header className="border-b border-[#C8C3B8] pb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono-tabular text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#B83214] text-white">
            Tahap 1: Evaluasi Akhir (Post-Test)
          </span>
        </div>
        <h2 id="post-test-title" className="text-xl sm:text-2xl font-bold text-[#141413]">
          Soal Uraian Pemahaman Prompt Engineering
        </h2>
        <p className="text-xs sm:text-sm text-[#484641] mt-1 leading-relaxed">
          Amati perbandingan antara <strong>Gambar Soal (Target Asli)</strong> dengan <strong>Gambar Hasil Tebakan</strong> dari setiap ronde di bawah ini, lalu jawab pertanyaan refleksi konsep secara berkelompok.
        </p>
      </header>

      {history.length > 0 && (
        <section aria-label="Sandingan Gambar Soal dan Tebakan per Ronde" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono-tabular uppercase tracking-wider text-[#484641]">
              Sandingan Gambar Soal vs Gambar Hasil Tebakan per Ronde
            </h3>
            <span className="text-xs font-mono-tabular text-[#484641]">
              {history.length} Ronde Terarsip
            </span>
          </div>

          <div className="space-y-6">
            {history.map((h) => {
              const subs = h.submissions || [];
              const mySub = subs.find((s) => s.team_id === teamId);
              const selectedSubId =
                selectedSubmissionPerRound[h.round_number] ||
                (mySub ? mySub.team_id : subs[0]?.team_id);
              const activeSub = subs.find((s) => s.team_id === selectedSubId) || mySub || subs[0];

              const targetImg = h.generated_image_url || "";
              const guessedImg = activeSub?.generated_image_url || "";

              return (
                <article
                  key={h.round_number}
                  className="p-4 sm:p-5 rounded border border-[#141413] bg-white space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#C8C3B8] pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm sm:text-base font-bold font-mono-tabular text-[#141413]">
                        Ronde {h.round_number}
                      </span>
                      <span className="text-xs font-mono-tabular px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#C8C3B8] text-[#484641]">
                        Pembuat Soal: <strong className="text-[#141413]">{h.maker_name}</strong>
                      </span>
                      {mySub && (
                        <span className="text-xs font-mono-tabular px-2 py-0.5 rounded bg-[#F2F8F4] border border-[#165B33] text-[#165B33] font-semibold">
                          Tebakan Tim Anda
                        </span>
                      )}
                    </div>

                    {subs.length > 1 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                        <span className="text-xs font-mono-tabular text-[#484641] shrink-0">
                          Pilih tebakan:
                        </span>
                        {subs.map((s) => (
                          <button
                            key={s.team_id}
                            type="button"
                            onClick={() =>
                              setSelectedSubmissionPerRound((prev) => ({
                                ...prev,
                                [h.round_number]: s.team_id,
                              }))
                            }
                            className={`min-h-[36px] text-xs font-mono-tabular px-3 py-1 rounded border transition-colors shrink-0 ${
                              activeSub?.team_id === s.team_id
                                ? "bg-[#141413] text-white border-[#141413] font-bold"
                                : "bg-[#FAF8F5] text-[#141413] border-[#C8C3B8] hover:bg-[#EAE6DC]"
                            }`}
                          >
                            {s.team_id === teamId ? "Tim Anda" : s.team_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Kolom 1: Gambar Target Asli */}
                    <div className="p-3.5 rounded border border-[#C8C3B8] bg-[#FAF8F5] space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-1 border-b border-[#EAE6DC] pb-2">
                          <span className="text-xs font-mono-tabular font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1D3557] text-white">
                            1. Gambar Soal (Target Asli)
                          </span>
                          <span className="text-xs font-mono-tabular text-[#484641]">
                            Oleh: <strong className="text-[#141413]">{h.maker_name}</strong>
                          </span>
                        </div>

                        <div className="rounded border border-[#C8C3B8] bg-white overflow-hidden aspect-square flex items-center justify-center p-2">
                          {targetImg ? (
                            <img
                              src={targetImg}
                              alt={`Gambar target asli ronde ${h.round_number} oleh ${h.maker_name}`}
                              className="w-full h-full object-contain rounded"
                              loading="lazy"
                            />
                          ) : (
                            <div className="text-xs text-[#484641] font-mono-tabular">
                              Gambar target tidak tersedia
                            </div>
                          )}
                        </div>

                        {targetImg && (
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                setEnlargedImage({
                                  url: targetImg,
                                  title: `Gambar Target Ronde ${h.round_number} (Oleh ${h.maker_name})`,
                                })
                              }
                              className="btn-secondary min-h-[36px] text-xs px-3 py-1 flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Perbesar Gambar</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 pt-1 border-t border-[#EAE6DC]">
                        <span className="text-xs font-mono-tabular font-bold text-[#484641] block">
                          Prompt Asli Pembuat Soal:
                        </span>
                        <p className="text-xs sm:text-sm text-[#141413] font-mono-tabular bg-white p-2.5 rounded border border-[#EAE6DC] leading-relaxed">
                          &ldquo;{h.secret_prompt}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Kolom 2: Gambar Hasil Tebakan (Rekonstruksi AI) */}
                    <div className="p-3.5 rounded border border-[#C8C3B8] bg-[#FAF8F5] space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-1 border-b border-[#EAE6DC] pb-2">
                          <span className="text-xs font-mono-tabular font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#B83214] text-white">
                            2. Gambar Hasil Tebakan (Rekonstruksi)
                          </span>
                          <span className="text-xs font-mono-tabular text-[#484641]">
                            Oleh: <strong className="text-[#141413]">{activeSub ? activeSub.team_name : "Tim"}</strong>
                          </span>
                        </div>

                        <div className="rounded border border-[#C8C3B8] bg-white overflow-hidden aspect-square flex items-center justify-center p-2">
                          {guessedImg && !guessedImg.startsWith("data:image/svg") ? (
                            <img
                              src={guessedImg}
                              alt={`Gambar hasil tebakan ronde ${h.round_number} oleh ${activeSub?.team_name || "Tim"}`}
                              className="w-full h-full object-contain rounded"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-4 text-center">
                              <p className="text-xs text-[#484641] font-mono-tabular">
                                Gambar tebakan tidak tersedia
                              </p>
                            </div>
                          )}
                        </div>

                        {guessedImg && !guessedImg.startsWith("data:image/svg") && (
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                setEnlargedImage({
                                  url: guessedImg,
                                  title: `Gambar Tebakan Ronde ${h.round_number} (Oleh ${activeSub?.team_name || "Tim"})`,
                                })
                              }
                              className="btn-secondary min-h-[36px] text-xs px-3 py-1 flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Perbesar Gambar</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 pt-1 border-t border-[#EAE6DC]">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono-tabular font-bold text-[#484641]">
                            Prompt Tebakan {activeSub?.team_name}:
                          </span>
                          {activeSub?.score_data && (
                            <span className="text-xs font-mono-tabular font-bold text-[#165B33]">
                              Skor: {activeSub.score_data.totalScore}/100
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-[#141413] font-mono-tabular bg-white p-2.5 rounded border border-[#EAE6DC] leading-relaxed">
                          &ldquo;{activeSub?.guessed_prompt || "-"}&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {enlargedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={enlargedImage.title}
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setEnlargedImage(null)}
        >
          <div
            className="bg-white p-4 rounded border border-[#141413] max-w-2xl w-full max-h-[90vh] flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#C8C3B8] pb-2">
              <span className="text-xs font-mono-tabular font-bold text-[#141413]">
                {enlargedImage.title}
              </span>
              <button
                type="button"
                onClick={() => setEnlargedImage(null)}
                className="btn-secondary min-h-[44px] text-xs px-3 py-1"
              >
                Tutup
              </button>
            </div>
            <div className="flex-1 overflow-hidden flex items-center justify-center bg-[#FAF8F5] p-2 rounded border border-[#C8C3B8]">
              <img
                src={enlargedImage.url}
                alt={enlargedImage.title}
                className="max-h-[70vh] w-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-5 rounded border-2 border-[#141413] bg-[#FAF8F5] space-y-4">
        <div className="space-y-3 text-xs sm:text-sm text-[#141413] leading-relaxed">
          <p>
            Kalian sudah berlatih dalam game untuk menebak prompt dari sebuah gambar. Kalian mungkin menemukan bahwa prompt yang dibuat sudah sangat detail dan bahkan sudah berusaha menggambarkan gambar target semirip mungkin.
          </p>
          <p>
            Namun, ketika prompt tersebut digunakan lagi, hasil gambarnya tetap bisa berbeda dari gambar sebelumnya.
          </p>
          <div className="p-3.5 rounded bg-white border border-[#141413] font-serif-editorial text-sm sm:text-base italic font-semibold text-[#141413]">
            &ldquo;Sebagus apa pun prompt yang kita buat, dan semirip apa pun prompt tersebut dengan gambar target, kenapa hasil gambar AI masih bisa berbeda? Lalu, bagaimana cara kita membuat hasil gambar menjadi lebih konsisten atau tetap sama?&rdquo;
          </div>
          <p className="font-semibold text-[#141413]">
            Jelaskan jawaban kalian dengan menghubungkan pengalaman kalian saat menebak prompt dari gambar dengan konsep <strong className="underline">Input</strong>, <strong className="underline">Persona</strong>, dan <strong className="underline">Output</strong> dalam prompt engineering.
          </p>
          <div className="p-3 rounded bg-white border border-[#C8C3B8] text-xs text-[#484641] leading-relaxed">
            <strong className="text-[#141413]">Petunjuk:</strong> Jangan hanya menjawab &ldquo;karena AI berbeda&rdquo;. Jelaskan bagian mana yang membuat hasil dapat berbeda dan apa yang dapat kita lakukan agar AI memiliki acuan yang lebih jelas.
          </div>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3 rounded border border-[#B83214] bg-[#FDF2F2] text-xs font-mono-tabular text-[#96270E]"
        >
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="postTestAnswer" className="text-sm font-bold text-[#141413] block">
            Tuliskan Jawaban Uraian Tim:
          </label>
          <textarea
            id="postTestAnswer"
            name="postTestAnswer"
            rows={6}
            required
            aria-required="true"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Ketikkan analisis tim Anda mengenai faktor perbedaan gambar AI serta solusinya berdasarkan konsep Input, Persona, dan Output..."
            className="input-field font-mono-tabular text-base sm:text-sm leading-relaxed w-full min-h-[140px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
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
            disabled={isSubmitting || !answer.trim()}
            aria-busy={isSubmitting}
            className="btn-primary min-h-[44px] w-full sm:w-auto px-6 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#141413]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
                <span>Menyimpan Jawaban...</span>
              </>
            ) : (
              <>
                <span>Simpan Jawaban Post-Test</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
