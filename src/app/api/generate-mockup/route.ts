import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateMockup } from "@/lib/make-mockup";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await request.json() as {
      photo_url: string;
      logo_url?: string | null;
      room_label?: string | null;
      format?: string;
    };

    const { photo_url, logo_url, room_label, format = "1080x1080" } = body;

    if (!photo_url) {
      return NextResponse.json({ error: "photo_url é obrigatório" }, { status: 400 });
    }

    const base64 = await generateMockup(photo_url, logo_url ?? null, room_label ?? null, format);
    return NextResponse.json({ success: true, image_base64: base64 });
  } catch (err) {
    console.error("generate-mockup error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
