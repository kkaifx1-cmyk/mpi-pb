import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/teams -> Join room
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const roomCode = (body.roomCode || "").trim().toUpperCase();
    const teamName = (body.teamName || "").trim();

    if (!roomCode || !teamName) {
      return NextResponse.json(
        { error: "Kode Ruangan dan Nama Tim wajib diisi" },
        { status: 400 }
      );
    }

    // Check if room exists
    const { data: room, error: roomErr } = await supabaseAdmin
      .from("mpi_rooms")
      .select("*")
      .eq("room_code", roomCode)
      .single();

    if (roomErr || !room) {
      return NextResponse.json(
        { error: "Kode Ruangan tidak ditemukan. Periksa kembali kode dari Controller." },
        { status: 404 }
      );
    }

    // Check existing team with this name
    const { data: existingTeam } = await supabaseAdmin
      .from("mpi_teams")
      .select("*")
      .eq("room_code", roomCode)
      .ilike("name", teamName)
      .single();

    if (existingTeam) {
      // Return existing team to reconnect
      return NextResponse.json({
        success: true,
        message: "Kembali bergabung ke tim yang ada",
        team: existingTeam,
      });
    }

    // Check max teams (e.g. max 10 teams)
    const { count } = await supabaseAdmin
      .from("mpi_teams")
      .select("*", { count: "exact", head: true })
      .eq("room_code", roomCode);

    if (count && count >= 12) {
      return NextResponse.json(
        { error: "Ruangan sudah penuh (maksimal 12 tim)" },
        { status: 400 }
      );
    }

    // Create team
    const teamId = "team_" + Math.random().toString(36).substring(2, 9);
    const newTeam = {
      id: teamId,
      room_code: roomCode,
      name: teamName,
      score: 0,
      guesses_count: 0,
      total_accuracy: 0,
      is_connected: true,
    };

    const { data: insertedTeam, error: insertErr } = await supabaseAdmin
      .from("mpi_teams")
      .insert(newTeam)
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Berhasil bergabung ke ruangan!",
      team: insertedTeam,
    });
  } catch (err: any) {
    console.error("POST /api/teams error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/teams -> Kick/remove team
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const roomCode = searchParams.get("roomCode")?.toUpperCase();

    if (!teamId || !roomCode) {
      return NextResponse.json({ error: "teamId and roomCode required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("mpi_teams")
      .delete()
      .eq("id", teamId)
      .eq("room_code", roomCode);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Tim berhasil dihapus" });
  } catch (err: any) {
    console.error("DELETE /api/teams error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
