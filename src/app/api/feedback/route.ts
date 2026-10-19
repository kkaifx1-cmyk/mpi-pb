import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomCode = searchParams.get("code")?.trim().toUpperCase();
    const teamId = searchParams.get("teamId")?.trim();

    if (!roomCode) {
      return NextResponse.json({ error: "roomCode required" }, { status: 400 });
    }

    const { data: feedbacks, error } = await supabaseAdmin
      .from("mpi_feedbacks")
      .select("*")
      .eq("room_code", roomCode)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching feedbacks:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const list = feedbacks || [];
    const myFeedback = teamId ? list.find((fb) => fb.team_id === teamId) || null : null;

    return NextResponse.json({
      success: true,
      feedbacks: list,
      myFeedback,
    });
  } catch (err: any) {
    console.error("GET /api/feedback error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const roomCode = (body.roomCode || "").trim().toUpperCase();
    const teamId = (body.teamId || "").trim();
    const teamName = (body.teamName || "").trim();
    const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
    const todayFeedback = (body.todayFeedback || "").trim();
    const futureFeedback = (body.futureFeedback || "").trim();

    if (!roomCode || !teamId || !teamName) {
      return NextResponse.json(
        { error: "Data tim dan kode ruangan wajib disertakan." },
        { status: 400 }
      );
    }

    if (!todayFeedback || !futureFeedback) {
      return NextResponse.json(
        { error: "Kedua isian feedback (hari ini & berikutnya) wajib diisi." },
        { status: 400 }
      );
    }

    const id = `fb_${roomCode}_${teamId}`;
    const payload = {
      id,
      room_code: roomCode,
      team_id: teamId,
      team_name: teamName,
      rating,
      today_feedback: todayFeedback,
      future_feedback: futureFeedback,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("mpi_feedbacks")
      .upsert(payload, { onConflict: "room_code,team_id" })
      .select()
      .single();

    if (error) {
      console.error("Error saving feedback:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Feedback berhasil dikirimkan!",
      feedback: data,
    });
  } catch (err: any) {
    console.error("POST /api/feedback error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
