import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: "Room code required" }, { status: 400 });
    }

    const [historyRes, subsRes] = await Promise.all([
      supabaseAdmin
        .from("mpi_round_history")
        .select("*")
        .eq("room_code", code)
        .order("round_number", { ascending: true }),
      supabaseAdmin
        .from("mpi_submissions")
        .select("id, round_number, team_id, generated_image_url, image_source, english_prompt")
        .eq("room_code", code),
    ]);

    if (historyRes.error) {
      return NextResponse.json({ error: historyRes.error.message }, { status: 500 });
    }

    const history = historyRes.data || [];
    const submissions = subsRes.data || [];

    // Merge latest generated_image_url from mpi_submissions into history entries
    const mergedHistory = history.map((item) => {
      const itemSubs = Array.isArray(item.submissions) ? item.submissions : [];
      const updatedSubs = itemSubs.map((sub: any) => {
        const liveSub = submissions.find(
          (s) => s.id === sub.id || (s.round_number === item.round_number && s.team_id === sub.team_id)
        );
        if (liveSub && liveSub.generated_image_url) {
          return {
            ...sub,
            generated_image_url: liveSub.generated_image_url,
            image_source: liveSub.image_source || sub.image_source,
            english_prompt: liveSub.english_prompt || sub.english_prompt,
          };
        }
        return sub;
      });

      return {
        ...item,
        submissions: updatedSubs,
      };
    });

    return NextResponse.json({ success: true, history: mergedHistory });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
