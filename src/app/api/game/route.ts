import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { computeLocalScore, evaluatePromptEngineering } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;
    const roomCode = (body.roomCode || "").trim().toUpperCase();

    if (!roomCode || !action) {
      return NextResponse.json({ error: "roomCode and action required" }, { status: 400 });
    }

    // Fetch current room
    const { data: room, error: roomErr } = await supabaseAdmin
      .from("mpi_rooms")
      .select("*")
      .eq("room_code", roomCode)
      .single();

    if (roomErr || !room) {
      return NextResponse.json({ error: "Ruangan tidak ditemukan" }, { status: 404 });
    }

    // Fetch teams
    const { data: teams } = await supabaseAdmin
      .from("mpi_teams")
      .select("*")
      .eq("room_code", roomCode)
      .order("created_at", { ascending: true });

    const teamList = teams || [];

    // ==========================================
    // ACTION: START_GAME
    // ==========================================
    if (action === "START_GAME") {
      if (teamList.length < 2) {
        return NextResponse.json(
          { error: "Minimal 2 tim harus bergabung sebelum memulai permainan." },
          { status: 400 }
        );
      }

      // Reset team scores
      await supabaseAdmin
        .from("mpi_teams")
        .update({ score: 0, guesses_count: 0, total_accuracy: 0 })
        .eq("room_code", roomCode);

      // Clear existing submissions, history & feedbacks
      await supabaseAdmin.from("mpi_submissions").delete().eq("room_code", roomCode);
      await supabaseAdmin.from("mpi_round_history").delete().eq("room_code", roomCode);
      await supabaseAdmin.from("mpi_feedbacks").delete().eq("room_code", roomCode);
      await supabaseAdmin.from("mpi_post_tests").delete().eq("room_code", roomCode);

      // First team is maker
      const firstMaker = teamList[0];
      const makerDuration = room.maker_duration || 120;
      const timerEndsAt = new Date(Date.now() + makerDuration * 1000).toISOString();

      const { data: updatedRoom, error: updateErr } = await supabaseAdmin
        .from("mpi_rooms")
        .update({
          status: "ROUND_MAKING",
          current_round: 1,
          maker_team_id: firstMaker.id,
          maker_team_name: firstMaker.name,
          secret_prompt: "",
          generated_image_url: "",
          image_source: "",
          english_prompt: "",
          detected_meta: null,
          secret_prompt_pe: null,
          timer_ends_at: timerEndsAt,
          timer_remaining: makerDuration,
          timer_paused: false,
          updated_at: new Date().toISOString(),
        })
        .eq("room_code", roomCode)
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, room: updatedRoom });
    }

    // ==========================================
    // ACTION: UPDATE_PROMPT (Maker drafts / generates image)
    // ==========================================
    if (action === "UPDATE_PROMPT") {
      const {
        secretPrompt,
        generatedImageUrl,
        imageSource,
        englishPrompt,
        detectedMeta,
      } = body;

      const secretPromptPE = secretPrompt
        ? evaluatePromptEngineering(secretPrompt)
        : null;

      const { data: updatedRoom, error } = await supabaseAdmin
        .from("mpi_rooms")
        .update({
          secret_prompt: secretPrompt || "",
          generated_image_url: generatedImageUrl || "",
          image_source: imageSource || "",
          english_prompt: englishPrompt || "",
          detected_meta: detectedMeta || null,
          secret_prompt_pe: secretPromptPE,
          updated_at: new Date().toISOString(),
        })
        .eq("room_code", roomCode)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, room: updatedRoom });
    }

    // ==========================================
    // ACTION: LOCK_AND_DISCUSS (Controller locks image and starts discussion)
    // ==========================================
    if (action === "LOCK_AND_DISCUSS") {
      const {
        secretPrompt,
        generatedImageUrl,
        imageSource,
        englishPrompt,
        detectedMeta,
      } = body;

      const promptToUse = secretPrompt || room.secret_prompt;
      const imageToUse = generatedImageUrl || room.generated_image_url;

      if (!imageToUse) {
        return NextResponse.json(
          { error: "Gambar belum dibuat! Harap tunggu atau buat gambar terlebih dahulu sebelum mengunci." },
          { status: 400 }
        );
      }

      const secretPromptPE = promptToUse
        ? evaluatePromptEngineering(promptToUse)
        : room.secret_prompt_pe;

      const duration = room.discussion_duration || 60;
      const timerEndsAt = new Date(Date.now() + duration * 1000).toISOString();

      const { data: updatedRoom, error } = await supabaseAdmin
        .from("mpi_rooms")
        .update({
          secret_prompt: promptToUse,
          generated_image_url: imageToUse,
          image_source: imageSource || room.image_source,
          english_prompt: englishPrompt || room.english_prompt,
          detected_meta: detectedMeta || room.detected_meta,
          secret_prompt_pe: secretPromptPE,
          status: "ROUND_DISCUSSION",
          timer_ends_at: timerEndsAt,
          timer_remaining: duration,
          timer_paused: false,
          updated_at: new Date().toISOString(),
        })
        .eq("room_code", roomCode)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, room: updatedRoom });
    }

    // ==========================================
    // ACTION: START_GUESSING (Transition to guessing phase)
    // ==========================================
    if (action === "START_GUESSING") {
      const duration = room.guess_duration || 90;
      const timerEndsAt = new Date(Date.now() + duration * 1000).toISOString();

      const { data: updatedRoom, error } = await supabaseAdmin
        .from("mpi_rooms")
        .update({
          status: "ROUND_GUESSING",
          timer_ends_at: timerEndsAt,
          timer_remaining: duration,
          timer_paused: false,
          updated_at: new Date().toISOString(),
        })
        .eq("room_code", roomCode)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, room: updatedRoom });
    }

    // ==========================================
    // ACTION: TIMER_CONTROL (Pause, Resume, Add 30s, Skip)
    // ==========================================
    if (action === "TIMER_CONTROL") {
      const subAction = body.subAction; // 'PAUSE' | 'RESUME' | 'ADD_30' | 'SKIP'

      let updates: any = { updated_at: new Date().toISOString() };

      if (subAction === "PAUSE") {
        if (!room.timer_paused && room.timer_ends_at) {
          const now = Date.now();
          const ends = new Date(room.timer_ends_at).getTime();
          const remaining = Math.max(0, Math.round((ends - now) / 1000));
          updates.timer_paused = true;
          updates.timer_remaining = remaining;
          updates.timer_ends_at = null;
        }
      } else if (subAction === "RESUME") {
        if (room.timer_paused) {
          const rem = room.timer_remaining || 10;
          updates.timer_paused = false;
          updates.timer_ends_at = new Date(Date.now() + rem * 1000).toISOString();
        }
      } else if (subAction === "ADD_30") {
        if (room.timer_paused) {
          updates.timer_remaining = (room.timer_remaining || 0) + 30;
        } else if (room.timer_ends_at) {
          const ends = new Date(room.timer_ends_at).getTime();
          updates.timer_ends_at = new Date(ends + 30000).toISOString();
        }
      } else if (subAction === "SKIP") {
        if (room.status === "ROUND_DISCUSSION") {
          // Skip discussion -> go directly to guessing
          const duration = room.guess_duration || 90;
          updates.status = "ROUND_GUESSING";
          updates.timer_ends_at = new Date(Date.now() + duration * 1000).toISOString();
          updates.timer_remaining = duration;
          updates.timer_paused = false;
        } else if (room.status === "ROUND_GUESSING") {
          // Skip guessing -> end guessing immediately
          updates.timer_ends_at = new Date(Date.now() - 1000).toISOString();
          updates.timer_remaining = 0;
          updates.timer_paused = false;
        }
      }

      const { data: updatedRoom, error } = await supabaseAdmin
        .from("mpi_rooms")
        .update(updates)
        .eq("room_code", roomCode)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, room: updatedRoom });
    }

    // ==========================================
    // ACTION: SUBMIT_GUESS (Guesser submits prompt)
    // ==========================================
    if (action === "SUBMIT_GUESS") {
      const {
        teamId,
        teamName,
        guessedPrompt,
        generatedImageUrl,
        imageSource,
        englishPrompt,
      } = body;

      if (!teamId || !guessedPrompt) {
        return NextResponse.json(
          { error: "Data tebakan tidak lengkap." },
          { status: 400 }
        );
      }

      // Check if team is maker
      if (teamId === room.maker_team_id) {
        return NextResponse.json(
          { error: "Tim Pembuat Gambar tidak dapat mengirimkan tebakan di ronde ini." },
          { status: 400 }
        );
      }

      // Compute score
      const scoreData = computeLocalScore(room.secret_prompt, guessedPrompt);

      const submissionId = `sub_${roomCode}_r${room.current_round}_${teamId}`;
      const submissionPayload: any = {
        id: submissionId,
        room_code: roomCode,
        round_number: room.current_round,
        team_id: teamId,
        team_name: teamName,
        guessed_prompt: guessedPrompt.trim(),
        score_data: scoreData,
        submitted_at: new Date().toISOString(),
      };

      if (generatedImageUrl) {
        submissionPayload.generated_image_url = generatedImageUrl;
        submissionPayload.image_source = imageSource || "";
        submissionPayload.english_prompt = englishPrompt || "";
      }

      const { data: subData, error: subErr } = await supabaseAdmin
        .from("mpi_submissions")
        .upsert(submissionPayload, { onConflict: "room_code,round_number,team_id" })
        .select()
        .single();

      if (subErr) {
        return NextResponse.json({ error: subErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Tebakan Anda berhasil disimpan!",
        submission: subData,
      });
    }

    // ==========================================
    // ACTION: UPDATE_SUBMISSION_IMAGE
    // ==========================================
    if (action === "UPDATE_SUBMISSION_IMAGE") {
      const { submissionId, generatedImageUrl, imageSource, englishPrompt } = body;
      if (!submissionId || !generatedImageUrl) {
        return NextResponse.json(
          { error: "submissionId and generatedImageUrl required" },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("mpi_submissions")
        .update({
          generated_image_url: generatedImageUrl,
          image_source: imageSource || "",
          english_prompt: englishPrompt || "",
        })
        .eq("id", submissionId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (data && data.round_number) {
        const historyId = `hist_${roomCode}_r${data.round_number}`;
        const { data: hist } = await supabaseAdmin
          .from("mpi_round_history")
          .select("*")
          .eq("id", historyId)
          .single();

        if (hist && Array.isArray(hist.submissions)) {
          const updatedSubs = hist.submissions.map((s: any) =>
            s.id === submissionId || s.team_id === data.team_id
              ? {
                  ...s,
                  generated_image_url: generatedImageUrl,
                  image_source: imageSource || "",
                  english_prompt: englishPrompt || "",
                }
              : s
          );
          await supabaseAdmin
            .from("mpi_round_history")
            .update({ submissions: updatedSubs })
            .eq("id", historyId);
        }
      }

      return NextResponse.json({ success: true, submission: data });
    }


    // ==========================================
    // ACTION: EVALUATE_ROUND (Controller closes round and shows results)
    // ==========================================
    if (action === "EVALUATE_ROUND") {
      // 1. Fetch all submissions for current round
      const { data: subs } = await supabaseAdmin
        .from("mpi_submissions")
        .select("*")
        .eq("room_code", roomCode)
        .eq("round_number", room.current_round);

      const submissions = subs || [];

      // 2. Update each team's score in mpi_teams
      for (const sub of submissions) {
        const team = teamList.find((t) => t.id === sub.team_id);
        if (team) {
          const addedScore = sub.score_data?.totalScore || 0;
          const newScore = (team.score || 0) + addedScore;
          const newGuesses = (team.guesses_count || 0) + 1;
          const newTotalAccuracy = (team.total_accuracy || 0) + addedScore;

          await supabaseAdmin
            .from("mpi_teams")
            .update({
              score: newScore,
              guesses_count: newGuesses,
              total_accuracy: newTotalAccuracy,
            })
            .eq("id", team.id);
        }
      }

      // 3. Save into mpi_round_history
      const historyId = `hist_${roomCode}_r${room.current_round}`;
      await supabaseAdmin
        .from("mpi_round_history")
        .upsert(
          {
            id: historyId,
            room_code: roomCode,
            round_number: room.current_round,
            maker_name: room.maker_team_name || "Pembuat Gambar",
            secret_prompt: room.secret_prompt,
            generated_image_url: room.generated_image_url,
            submissions: submissions,
            created_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      // 4. Update room status to ROUND_RESULTS
      const { data: updatedRoom, error } = await supabaseAdmin
        .from("mpi_rooms")
        .update({
          status: "ROUND_RESULTS",
          timer_ends_at: null,
          timer_remaining: null,
          timer_paused: false,
          updated_at: new Date().toISOString(),
        })
        .eq("room_code", roomCode)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, room: updatedRoom });
    }

    // ==========================================
    // ACTION: ADJUST_SCORE (Jury modifies +/- 5 points)
    // ==========================================
    if (action === "ADJUST_SCORE") {
      const { submissionId, delta } = body;
      if (!submissionId || typeof delta !== "number") {
        return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
      }

      const { data: sub } = await supabaseAdmin
        .from("mpi_submissions")
        .select("*")
        .eq("id", submissionId)
        .single();

      if (!sub) {
        return NextResponse.json({ error: "Submission not found" }, { status: 404 });
      }

      const currentScoreData = sub.score_data || {};
      const newTotal = Math.max(0, Math.min(100, (currentScoreData.totalScore || 0) + delta));
      const updatedScoreData = {
        ...currentScoreData,
        totalScore: newTotal,
      };

      await supabaseAdmin
        .from("mpi_submissions")
        .update({ score_data: updatedScoreData })
        .eq("id", submissionId);

      // Update team score
      const { data: targetTeam } = await supabaseAdmin
        .from("mpi_teams")
        .select("*")
        .eq("id", sub.team_id)
        .single();

      if (targetTeam) {
        await supabaseAdmin
          .from("mpi_teams")
          .update({
            score: Math.max(0, (targetTeam.score || 0) + delta),
            total_accuracy: Math.max(0, (targetTeam.total_accuracy || 0) + delta),
          })
          .eq("id", sub.team_id);
      }

      return NextResponse.json({ success: true, newTotal });
    }

    // ==========================================
    // ACTION: NEXT_ROUND
    // ==========================================
    if (action === "NEXT_ROUND") {
      if (room.current_round >= room.total_rounds) {
        // Game Finished
        const { data: updatedRoom } = await supabaseAdmin
          .from("mpi_rooms")
          .update({
            status: "FINAL_STANDINGS",
            updated_at: new Date().toISOString(),
          })
          .eq("room_code", roomCode)
          .select()
          .single();

        return NextResponse.json({ success: true, room: updatedRoom });
      }

      // Next round: rotate maker
      const nextRound = room.current_round + 1;
      const nextMakerIdx = (nextRound - 1) % teamList.length;
      const nextMaker = teamList[nextMakerIdx];
      const makerDuration = room.maker_duration || 120;
      const timerEndsAt = new Date(Date.now() + makerDuration * 1000).toISOString();

      const { data: updatedRoom, error } = await supabaseAdmin
        .from("mpi_rooms")
        .update({
          status: "ROUND_MAKING",
          current_round: nextRound,
          maker_team_id: nextMaker.id,
          maker_team_name: nextMaker.name,
          secret_prompt: "",
          generated_image_url: "",
          image_source: "",
          english_prompt: "",
          detected_meta: null,
          secret_prompt_pe: null,
          timer_ends_at: timerEndsAt,
          timer_remaining: makerDuration,
          timer_paused: false,
          updated_at: new Date().toISOString(),
        })
        .eq("room_code", roomCode)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, room: updatedRoom });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali" }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/game error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
