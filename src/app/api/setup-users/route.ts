import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Rota temporária para criar usuários admin via service role (bypassa restrições de provider)
// DELETE este arquivo após criar os usuários
export async function POST(request: NextRequest) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY não configurada" },
      { status: 500 }
    );
  }

  const { email, password, role } = await request.json() as {
    email: string;
    password: string;
    role?: string;
  };

  if (!email || !password) {
    return NextResponse.json({ error: "email e password são obrigatórios" }, { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Verificar se usuário já existe
  const { data: { users } } = await admin.auth.admin.listUsers();
  const existing = users.find((u) => u.email === email);

  if (existing) {
    // Atualizar senha e confirmar e-mail
    const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { role: role ?? "user" },
    });
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      action: "updated",
      message: `Usuário ${email} atualizado — senha redefinida e e-mail confirmado.`,
    });
  }

  // Criar novo usuário
  const { data, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: role ?? "user" },
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    action: "created",
    message: `Usuário ${email} criado e confirmado com sucesso.`,
    id: data.user?.id,
  });
}
