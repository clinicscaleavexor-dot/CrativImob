import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

// Pre-created Asaas payment links per plan slug
const PLAN_PAYMENT_LINKS: Record<string, string> = {
  start: "https://sandbox.asaas.com/c/b7xsja5e6vxrbei5",
  intermedium: "https://sandbox.asaas.com/c/l57yp47rqs2jknkk",
  gold: "https://sandbox.asaas.com/c/hdhh48m7b6refpil",
  diamante: "https://sandbox.asaas.com/c/tzj22dqgplt7lfq4",
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { planId, cpfCnpj } = await req.json();

    if (!planId || !cpfCnpj) {
      return NextResponse.json(
        { error: "planId e cpfCnpj são obrigatórios" },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Get plan details
    const { data: plan, error: planError } = await serviceClient
      .from("plans")
      .select("*")
      .eq("id", planId)
      .eq("is_active", true)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
    }

    if (plan.price_cents === 0) {
      return NextResponse.json(
        { error: "Plano Free não requer assinatura" },
        { status: 400 }
      );
    }

    // Check if payment link exists for this plan
    const paymentLink = PLAN_PAYMENT_LINKS[plan.slug as string];
    if (!paymentLink) {
      return NextResponse.json(
        { error: "Link de pagamento não configurado para este plano" },
        { status: 400 }
      );
    }

    // Save CPF/CNPJ to profile
    await serviceClient
      .from("profiles")
      .update({ cpf_cnpj: cpfCnpj.replace(/\D/g, "") })
      .eq("id", user.id);

    // Build externalReference: "user_{USER_ID}_plan_{SLUG}"
    const externalReference = `user_${user.id}_plan_${plan.slug}`;

    // Deactivate any existing active/pending subscription
    await serviceClient
      .from("subscriptions")
      .update({ status: "canceled" })
      .eq("user_id", user.id)
      .in("status", ["active", "pending"]);

    // Calculate period end (30 days from now)
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    // Create local subscription record with status "pending"
    const { error: subError } = await serviceClient
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_id: planId,
        status: "pending",
        external_reference: externalReference,
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd.toISOString(),
      });

    if (subError) {
      console.error("Error creating subscription:", subError);
      return NextResponse.json(
        { error: "Erro ao salvar assinatura" },
        { status: 500 }
      );
    }

    // Build payment URL with externalReference
    const invoiceUrl = `${paymentLink}?externalReference=${encodeURIComponent(externalReference)}`;

    return NextResponse.json({
      success: true,
      invoiceUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Subscription error:", message);
    return NextResponse.json(
      { error: `Erro ao criar assinatura: ${message}` },
      { status: 500 }
    );
  }
}
