import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

// Rota temporária para confirmar e-mail de usuário usando service role
// DELETE este arquivo após resolver o problema de login
export async function POST(request: NextRequest) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY não configurada no Vercel" },
      { status: 500 }
    );
  }

  const { email } = await request.json() as { email: string };

  if (!email) {
    return NextResponse.json({ error: "email é obrigatório" }, { status: 400 });
  }

  const admin = createSupabaseAdmin(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Buscar usuário pelo e-mail
  const { data: { users }, error: listError } = await admin.auth.admin.listUsers();
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 });
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    return NextResponse.json({ error: `Usuário ${email} não encontrado` }, { status: 404 });
  }

  // Confirmar e-mail
  const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
    email_confirm: true,
  });

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: `E-mail ${email} confirmado com sucesso. Agora você pode fazer login.`,
  });
}
