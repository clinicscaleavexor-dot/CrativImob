import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("prompt_categories")
      .select("id, slug, label, description")
      .eq("is_active", true)
      .neq("slug", "prompt-padrao")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Erro ao buscar estilos" }, { status: 500 });
    }

    return NextResponse.json({ styles: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
