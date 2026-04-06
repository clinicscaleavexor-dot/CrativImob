import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Use service role to list auth.users (profiles.email can be null)
  const serviceClient = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: authData, error: authError } = await (serviceClient as any).auth.admin.listUsers();

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const authUsers: { id: string; email: string; created_at: string }[] = (authData?.users ?? []).map(
    (u: { id: string; email?: string; created_at: string }) => ({
      id: u.id,
      email: u.email ?? "",
      created_at: u.created_at,
    })
  );

  // Get profiles for names
  const { data: profiles } = await serviceClient
    .from("profiles")
    .select("id, full_name, company_name");

  const profileMap = new Map(
    (profiles ?? []).map((p: { id: string; full_name: string | null; company_name: string | null }) => [p.id, p])
  );

  // Get credits for all users
  const { data: credits } = await serviceClient
    .from("credits")
    .select("user_id, balance");

  const creditsMap = new Map(
    (credits ?? []).map((c: { user_id: string; balance: number }) => [c.user_id, c.balance])
  );

  const users = authUsers.map((au) => {
    const prof = profileMap.get(au.id) as { full_name: string | null; company_name: string | null } | undefined;
    return {
      id: au.id,
      full_name: prof?.full_name ?? null,
      company_name: prof?.company_name ?? null,
      email: au.email,
      created_at: au.created_at,
      credits: creditsMap.get(au.id) ?? 0,
    };
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { user_id, add_credits } = body as { user_id: string; add_credits: number };

  if (!user_id || !add_credits || add_credits <= 0 || add_credits > 10000) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  // Get current balance
  const { data: current } = await supabase
    .from("credits")
    .select("balance")
    .eq("user_id", user_id)
    .single();

  const currentBalance = (current as { balance: number } | null)?.balance ?? 0;
  const newBalance = currentBalance + add_credits;

  // Upsert credits
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: creditError } = await (supabase as any)
    .from("credits")
    .upsert({ user_id, balance: newBalance }, { onConflict: "user_id" });

  if (creditError) {
    return NextResponse.json({ error: creditError.message }, { status: 500 });
  }

  // Log transaction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("credits_transactions").insert({
    user_id,
    amount: add_credits,
    type: "admin_grant",
    description: `Admin adicionou ${add_credits} crédito(s)`,
  });

  return NextResponse.json({ success: true, new_balance: newBalance });
}
