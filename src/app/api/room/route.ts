import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Helper to format room data
function formatRoom(row: any) {
  if (!row) return null;
  return {
    roomCode: row.room_code,
    status: row.status,
    currentRound: row.current_round,
    totalRounds: row.total_rounds,
    makerTeamId: row.maker_team_id,
    makerTeamName: row.maker_team_name,
    secretPrompt: row.secret_prompt,
    generatedImageUrl: row.generated_image_url,
    imageSource: row.image_source,
    englishPrompt: row.english_prompt,
    detectedMeta: row.detected_meta,
    secretPromptPE: row.secret_prompt_pe,
    makerDuration: row.maker_duration || 120,
    discussionDuration: row.discussion_duration || 60,
    guessDuration: row.guess_duration || 90,
    timerEndsAt: row.timer_ends_at,
    timerRemaining: row.timer_remaining,
    timerPaused: row.timer_paused,
    aiModel: row.ai_model || "agnes-image-2.1-flash",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET /api/room?code=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: "Room code required" }, { status: 400 });
    }

    // 1. Fetch room
    const { data: room, error: roomErr } = await supabaseAdmin
      .from("mpi_rooms")
      .select("*")
      .eq("room_code", code)
      .single();

    if (roomErr || !room) {
      return NextResponse.json({ error: "Ruangan tidak ditemukan" }, { status: 404 });
    }

    // 2. Fetch teams
    const { data: teams, error: teamsErr } = await supabaseAdmin
      .from("mpi_teams")
      .select("*")
      .eq("room_code", code)
      .order("created_at", { ascending: true });

    // 3. Fetch submissions for the current round
    const { data: submissions, error: subsErr } = await supabaseAdmin
      .from("mpi_submissions")
      .select("*")
      .eq("room_code", code)
      .eq("round_number", room.current_round);

    return NextResponse.json({
      success: true,
      room: formatRoom(room),
      teams: teams || [],
      submissions: submissions || [],
    });
  } catch (err: any) {
    console.error("GET /api/room error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/room -> Create or reset room
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let roomCode = (body.roomCode || "").trim().toUpperCase();

    // Generate random 4-digit code if not provided
    if (!roomCode) {
      roomCode = Math.floor(1000 + Math.random() * 9000).toString();
    }

    const initialData = {
      room_code: roomCode,
      status: "LOBBY",
      current_round: 1,
      total_rounds: body.totalRounds || 3,
      maker_team_id: null,
      maker_team_name: null,
      secret_prompt: "",
      generated_image_url: "",
      image_source: "",
      english_prompt: "",
      detected_meta: null,
      secret_prompt_pe: null,
      maker_duration: body.makerDuration || 120,
      discussion_duration: body.discussionDuration || 60,
      guess_duration: body.guessDuration || 90,
      timer_ends_at: null,
      timer_remaining: null,
      timer_paused: false,
      ai_model: body.aiModel || "agnes-image-2.1-flash",
      updated_at: new Date().toISOString(),
    };

    // Upsert room
    const { data, error } = await supabaseAdmin
      .from("mpi_rooms")
      .upsert(initialData, { onConflict: "room_code" })
      .select()
      .single();

    if (error) {
      console.error("Failed to upsert room:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If reset requested, clear submissions, history, and feedbacks for this room
    if (body.resetTeams) {
      await supabaseAdmin.from("mpi_submissions").delete().eq("room_code", roomCode);
      await supabaseAdmin.from("mpi_round_history").delete().eq("room_code", roomCode);
      await supabaseAdmin.from("mpi_teams").delete().eq("room_code", roomCode);
      await supabaseAdmin.from("mpi_feedbacks").delete().eq("room_code", roomCode);
      await supabaseAdmin.from("mpi_post_tests").delete().eq("room_code", roomCode);
    }

    return NextResponse.json({
      success: true,
      room: formatRoom(data),
      roomCode,
    });
  } catch (err: any) {
    console.error("POST /api/room error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/room -> Update room settings
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const roomCode = body.roomCode?.trim().toUpperCase();

    if (!roomCode) {
      return NextResponse.json({ error: "Room code required" }, { status: 400 });
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (typeof body.totalRounds === "number") updates.total_rounds = body.totalRounds;
    if (typeof body.makerDuration === "number") updates.maker_duration = body.makerDuration;
    if (typeof body.discussionDuration === "number") updates.discussion_duration = body.discussionDuration;
    if (typeof body.guessDuration === "number") updates.guess_duration = body.guessDuration;
    if (body.aiModel) updates.ai_model = body.aiModel;

    const { data, error } = await supabaseAdmin
      .from("mpi_rooms")
      .update(updates)
      .eq("room_code", roomCode)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, room: formatRoom(data) });
  } catch (err: any) {
    console.error("PATCH /api/room error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
