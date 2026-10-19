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

    const { data: list, error } = await supabaseAdmin
      .from("mpi_post_tests")
      .select("*")
      .eq("room_code", roomCode)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching post tests:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const postTests = list || [];
    const myPostTest = teamId ? postTests.find((pt) => pt.team_id === teamId) || null : null;

    return NextResponse.json({
      success: true,
      postTests,
      myPostTest,
    });
  } catch (err: any) {
    console.error("GET /api/post-test error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const roomCode = (body.roomCode || "").trim().toUpperCase();
    const teamId = (body.teamId || "").trim();
    const teamName = (body.teamName || "").trim();
    const answer = (body.answer || "").trim();

    if (!roomCode || !teamId || !teamName) {
      return NextResponse.json(
        { error: "Data tim dan kode ruangan wajib disertakan." },
        { status: 400 }
      );
    }

    if (!answer) {
      return NextResponse.json(
        { error: "Isian uraian evaluasi wajib diisi." },
        { status: 400 }
      );
    }

    const id = `posttest_${roomCode}_${teamId}`;
    const payload = {
      id,
      room_code: roomCode,
      team_id: teamId,
      team_name: teamName,
      answer,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("mpi_post_tests")
      .upsert(payload, { onConflict: "room_code,team_id" })
      .select()
      .single();

    if (error) {
      console.error("Error saving post test:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Jawaban evaluasi berhasil disimpan.",
      postTest: data,
    });
  } catch (err: any) {
    console.error("POST /api/post-test error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
