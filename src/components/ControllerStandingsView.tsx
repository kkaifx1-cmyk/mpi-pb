"use client";

import React, { useEffect, useState, useCallback } from "react";
import { MultiplayerTeam, MultiplayerFeedback, MultiplayerPostTest } from "@/lib/types";
import {
  Trophy,
  Medal,
  Award,
  RotateCcw,
  Star,
  RefreshCw,
  Users,
  BookOpen,
} from "lucide-react";

interface ControllerStandingsViewProps {
  roomCode: string;
  teams: MultiplayerTeam[];
  onResetGame: () => Promise<void>;
}

export const ControllerStandingsView: React.FC<ControllerStandingsViewProps> = ({
  roomCode,
  teams,
  onResetGame,
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<MultiplayerFeedback[]>([]);
  const [postTests, setPostTests] = useState<MultiplayerPostTest[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const winner = sortedTeams[0];
  const runnerUp = sortedTeams[1];
  const third = sortedTeams[2];

  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      try {
        const res = await fetch(`/api/history?code=${roomCode}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.success) {
            setHistory(data.history || []);
          }
        }
      } catch (err) {
        console.warn("Failed to load history:", err);
      }
    }
    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [roomCode]);

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const [feedbackRes, postTestRes] = await Promise.all([
        fetch(`/api/feedback?code=${roomCode}`),
        fetch(`/api/post-test?code=${roomCode}`),
      ]);

      if (feedbackRes.ok) {
        const fbData = await feedbackRes.json();
        if (fbData.success) {
          setFeedbacks(fbData.feedbacks || []);
        }
      }

      if (postTestRes.ok) {
        const ptData = await postTestRes.json();
        if (ptData.success) {
          setPostTests(ptData.postTests || []);
        }
      }
    } catch (err) {
      console.warn("Failed to load evaluation data:", err);
    } finally {
      if (isManual) setIsRefreshing(false);
    }
  }, [roomCode]);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 4000);

    return () => clearInterval(interval);
  }, [loadData]);

  const handleReset = async () => {
    if (confirm("Mulai sesi permainan baru? Semua ronde dan tebakan akan diatur ulang.")) {
      setIsResetting(true);
      try {
        await onResetGame();
      } finally {
        setIsResetting(false);
      }
    }
  };

  const totalFeedbacks = feedbacks.length;
  const totalPostTests = postTests.length;
  const averageRating =
    totalFeedbacks > 0
      ? (feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0) / totalFeedbacks).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      <div className="panel-frame p-4 sm:p-8 bg-white border border-[#141413]">
        <div className="border-b border-[#C8C3B8] pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono-tabular text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#141413] text-white">
              Rekapitulasi Sesi
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1 text-[#141413]">
              Klasemen Akhir Rekonstruksi Prompt
            </h1>
            <p className="text-xs sm:text-sm text-[#484641] mt-0.5">
              Seluruh ronde telah selesai dievaluasi. Berikut perolehan poin akhir dan daftar peringkat tim:
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isResetting}
              onClick={handleReset}
              className="btn-primary min-h-[44px] text-xs sm:text-sm px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#141413]"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" aria-hidden="true" />
              <span>{isResetting ? "Mengatur Ulang..." : "Mulai Sesi Baru"}</span>
            </button>
          </div>
        </div>

        {sortedTeams.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 items-end">
            {runnerUp && (
              <div className="p-4 sm:p-5 text-center order-2 sm:order-1 flex flex-col items-center border border-[#141413] bg-[#FAF8F5] rounded">
                <div
                  className="w-10 h-10 rounded bg-white border border-[#C8C3B8] flex items-center justify-center mb-2"
                  aria-hidden="true"
                >
                  <Medal className="w-5 h-5 text-[#484641]" />
                </div>
                <span className="font-mono-tabular text-xs font-bold uppercase tracking-wider text-[#484641]">
                  Peringkat 2
                </span>
                <h2 className="font-bold text-base sm:text-lg text-[#141413] mt-1">{runnerUp.name}</h2>
                <span className="font-mono-tabular text-xl sm:text-2xl font-bold text-[#141413] mt-1">
                  {runnerUp.score} Poin
                </span>
              </div>
            )}

            {winner && (
              <div className="p-5 sm:p-6 text-center order-1 sm:order-2 flex flex-col items-center border-2 border-[#141413] bg-white rounded shadow-sm">
                <div
                  className="w-12 h-12 rounded bg-[#141413] text-[#F4F1EA] flex items-center justify-center mb-2"
                  aria-hidden="true"
                >
                  <Trophy className="w-6 h-6 text-[#F4F1EA]" />
                </div>
                <span className="font-mono-tabular text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#B83214] text-white">
                  Pemenang Utama
                </span>
                <h2 className="font-bold text-xl sm:text-2xl text-[#141413] mt-2">{winner.name}</h2>
                <span className="font-mono-tabular text-2xl sm:text-4xl font-bold text-[#141413] mt-1">
                  {winner.score} Poin
                </span>
              </div>
            )}

            {third && (
              <div className="p-4 sm:p-5 text-center order-3 sm:order-3 flex flex-col items-center border border-[#141413] bg-[#FAF8F5] rounded">
                <div
                  className="w-10 h-10 rounded bg-white border border-[#C8C3B8] flex items-center justify-center mb-2"
                  aria-hidden="true"
                >
                  <Award className="w-5 h-5 text-[#484641]" />
                </div>
                <span className="font-mono-tabular text-xs font-bold uppercase tracking-wider text-[#484641]">
                  Peringkat 3
                </span>
                <h2 className="font-bold text-base sm:text-lg text-[#141413] mt-1">{third.name}</h2>
                <span className="font-mono-tabular text-xl sm:text-2xl font-bold text-[#141413] mt-1">
                  {third.score} Poin
                </span>
              </div>
            )}
          </div>
        )}

        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse border border-[#141413]">
            <caption className="sr-only">Tabel Hasil Akhir Seluruh Tim</caption>
            <thead>
              <tr className="bg-[#141413] text-[#F4F1EA] font-mono-tabular text-xs uppercase">
                <th scope="col" className="py-3 px-4 border border-[#383835]">Peringkat</th>
                <th scope="col" className="py-3 px-4 border border-[#383835]">Nama Tim</th>
                <th scope="col" className="py-3 px-4 border border-[#383835]">Rata-Rata Akurasi</th>
                <th scope="col" className="py-3 px-4 border border-[#383835] text-right">Total Poin</th>
              </tr>
            </thead>
            <tbody className="text-sm font-mono-tabular">
              {sortedTeams.map((team, idx) => (
                <tr
                  key={team.id}
                  className={`border-b border-[#C8C3B8] ${
                    idx === 0
                      ? "bg-white font-bold"
                      : idx % 2 === 1
                      ? "bg-[#FAF8F5]"
                      : "bg-white"
                  }`}
                >
                  <td className="py-3 px-4 border-r border-[#C8C3B8] font-bold">
                    #{idx + 1}
                  </td>
                  <td className="py-3 px-4 border-r border-[#C8C3B8] font-semibold text-[#141413]">
                    {team.name}
                  </td>
                  <td className="py-3 px-4 border-r border-[#C8C3B8] text-center">
                    {team.total_accuracy && team.guesses_count
                      ? `${Math.round(team.total_accuracy / team.guesses_count)}%`
                      : "-"}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-base text-[#141413]">
                    {team.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section
          aria-labelledby="post-test-heading"
          className="pt-6 border-t-2 border-[#141413] space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono-tabular text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#B83214] text-white">
                  Evaluasi Akhir
                </span>
                <span className="font-mono-tabular text-xs font-semibold px-2 py-0.5 rounded border border-[#C8C3B8] text-[#141413]">
                  {totalPostTests} dari {teams.length} Tim Mengisi
                </span>
              </div>
              <h2 id="post-test-heading" className="text-xl sm:text-2xl font-bold text-[#141413] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#B83214]" aria-hidden="true" />
                <span>Jawaban Post-Test Siswa: Konsep Input, Persona, &amp; Output</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#484641] mt-0.5">
                Analisis tim siswa mengenai alasan perbedaan hasil gambar AI dan strategi membuat hasil lebih konsisten:
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              aria-label="Segarkan data post test dan evaluasi"
              className="btn-secondary min-h-[44px] text-xs px-4 py-2 flex items-center gap-2 border border-[#141413] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#141413] self-start sm:self-auto"
            >
              <RefreshCw
                aria-hidden="true"
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>Segarkan Data</span>
            </button>
          </div>

          {postTests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {postTests.map((pt) => (
                <article
                  key={pt.id || pt.team_id}
                  className="p-4 sm:p-5 rounded bg-white border border-[#141413] space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#C8C3B8] pb-2">
                    <h3 className="font-bold text-sm sm:text-base text-[#141413]">
                      {pt.team_name}
                    </h3>
                    <span className="text-xs font-mono-tabular text-[#165B33] font-semibold bg-[#F2F8F4] px-2 py-0.5 rounded border border-[#165B33]">
                      Sudah Mengisi
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#484641] block">
                      Analisis &amp; Jawaban Uraian:
                    </span>
                    <p className="text-xs sm:text-sm text-[#141413] font-mono-tabular bg-[#FAF8F5] p-3 rounded border border-[#EAE6DC] leading-relaxed whitespace-pre-wrap">
                      {pt.answer}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-6 sm:p-8 text-center border border-[#C8C3B8] bg-[#FAF8F5] rounded space-y-1">
              <p className="text-sm font-semibold text-[#141413]">
                Belum ada tim yang menyelesaikan soal uraian post-test.
              </p>
              <p className="text-xs text-[#484641] max-w-md mx-auto">
                Jawaban siswa mengenai konsep Input, Persona, dan Output akan tampil otomatis di sini setelah dikirimkan.
              </p>
            </div>
          )}
        </section>

        <section
          aria-labelledby="eval-heading"
          className="pt-6 border-t-2 border-[#141413] space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono-tabular text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#141413] text-white">
                  Evaluasi Kelas
                </span>
                <span className="font-mono-tabular text-xs font-semibold px-2 py-0.5 rounded border border-[#C8C3B8] text-[#141413]">
                  {totalFeedbacks} dari {teams.length} Tim Mengisi
                </span>
              </div>
              <h2 id="eval-heading" className="text-xl sm:text-2xl font-bold text-[#141413]">
                Hasil Evaluasi &amp; Refleksi Tim Siswa
              </h2>
              <p className="text-xs sm:text-sm text-[#484641] mt-0.5">
                Penilaian sesi pembelajaran hari ini dan usulan materi berikutnya yang dikirim langsung dari perangkat peserta:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded border border-[#C8C3B8] bg-[#FAF8F5] flex items-center gap-4">
              <div
                className="w-12 h-12 rounded bg-white border border-[#C8C3B8] flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <Star className="w-6 h-6 text-[#D97706] fill-[#D97706]" />
              </div>
              <div>
                <span className="text-xs font-mono-tabular font-bold uppercase tracking-wider text-[#484641] block">
                  Rata-Rata Rating Pembelajaran
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-bold font-mono-tabular text-[#141413]">
                    {averageRating ? averageRating : "-"}
                  </span>
                  <span className="text-xs font-mono-tabular text-[#484641]">
                    / 5.0
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded border border-[#C8C3B8] bg-[#FAF8F5] flex items-center gap-4">
              <div
                className="w-12 h-12 rounded bg-white border border-[#C8C3B8] flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <Users className="w-6 h-6 text-[#141413]" />
              </div>
              <div>
                <span className="text-xs font-mono-tabular font-bold uppercase tracking-wider text-[#484641] block">
                  Partisipasi Pengisian
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-bold font-mono-tabular text-[#165B33]">
                    {teams.length > 0 ? `${Math.round((totalFeedbacks / teams.length) * 100)}%` : "0%"}
                  </span>
                  <span className="text-xs font-mono-tabular text-[#484641]">
                    ({totalFeedbacks} tim)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {feedbacks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbacks.map((fb) => (
                <article
                  key={fb.id || fb.team_id}
                  className="p-4 sm:p-5 rounded bg-white border border-[#141413] space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#C8C3B8] pb-2">
                    <h3 className="font-bold text-sm sm:text-base text-[#141413]">
                      {fb.team_name}
                    </h3>
                    <div
                      className="flex items-center gap-1"
                      aria-label={`Rating: ${fb.rating} dari 5 bintang`}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          aria-hidden="true"
                          className={`w-3.5 h-3.5 ${
                            star <= fb.rating
                              ? "text-[#D97706] fill-[#D97706]"
                              : "text-[#6B7280]"
                          }`}
                        />
                      ))}
                      <span className="text-xs font-mono-tabular font-bold ml-1 text-[#141413]">
                        {fb.rating}/5
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#141413] block">
                      Evaluasi Pembelajaran Hari Ini:
                    </span>
                    <p className="text-xs sm:text-sm text-[#141413] font-mono-tabular bg-[#FAF8F5] p-2.5 rounded border border-[#EAE6DC] leading-relaxed whitespace-pre-wrap">
                      {fb.today_feedback}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#141413] block">
                      Usulan Pembelajaran Berikutnya:
                    </span>
                    <p className="text-xs sm:text-sm text-[#141413] font-mono-tabular bg-[#FAF8F5] p-2.5 rounded border border-[#EAE6DC] leading-relaxed whitespace-pre-wrap">
                      {fb.future_feedback}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-6 sm:p-8 text-center border border-[#C8C3B8] bg-[#FAF8F5] rounded space-y-1">
              <p className="text-sm font-semibold text-[#141413]">
                Belum ada tim yang mengirimkan formulir evaluasi.
              </p>
              <p className="text-xs text-[#484641] max-w-md mx-auto">
                Siswa dapat mengisi evaluasi melalui formulir di layar masing-masing setelah sesi selesai.
              </p>
            </div>
          )}
        </section>

        {history.length > 0 && (
          <section
            aria-labelledby="archive-heading"
            className="space-y-3 pt-6 mt-6 border-t border-[#C8C3B8]"
          >
            <h2 id="archive-heading" className="text-base font-bold text-[#141413]">
              Arsip Ronde pada Sesi Ini
            </h2>
            <div className="space-y-3">
              {history.map((h, i) => (
                <div key={i} className="p-4 rounded border border-[#C8C3B8] bg-[#FAF8F5] space-y-2 text-xs">
                  <div className="flex justify-between items-center font-mono-tabular">
                    <span className="font-bold text-[#141413]">Ronde {h.round}</span>
                    <span className="text-[#484641]">Pembuat: {h.maker_name || "Tim"}</span>
                  </div>
                  <div className="p-2.5 rounded bg-white border border-[#C8C3B8] font-mono-tabular text-[#141413]">
                    {h.secret_prompt}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
