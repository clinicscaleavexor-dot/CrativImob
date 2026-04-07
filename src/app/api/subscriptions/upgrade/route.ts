import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { updateSubscription } from "@/lib/asaas";

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { planId } = await req.json();
    if (!planId) {
      return NextResponse.json({ error: "planId é obrigatório" }, { status: 400 });
    }

    const serviceClient = createServiceClient();

    // Get new plan
    const { data: newPlan } = await serviceClient
      .from("plans")
      .select("*")
      .eq("id", planId)
      .eq("is_active", true)
      .single();

    if (!newPlan) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
    }

    // Get current active subscription
    const { data: currentSub } = await serviceClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["active", "pending"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!currentSub?.external_subscription_id) {
      return NextResponse.json(
        { error: "Nenhuma assinatura ativa encontrada" },
        { status: 404 }
      );
    }

    // Build new externalReference
    const externalReference = `user_${user.id}_plan_${newPlan.slug}`;

    // Update subscription in Asaas (value + externalReference)
    await updateSubscription(currentSub.external_subscription_id, {
      value: newPlan.price_cents / 100,
      externalReference,
    });

    // Update local subscription
    await serviceClient
      .from("subscriptions")
      .update({
        plan_id: planId,
        external_reference: externalReference,
      })
      .eq("id", currentSub.id);

    // Update profile plan_id
    await serviceClient
      .from("profiles")
      .update({ plan_id: planId })
      .eq("id", user.id);

    // Update credits to new plan level
    await serviceClient
      .from("credits")
      .update({ balance: newPlan.credits_per_month })
      .eq("user_id", user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Upgrade error:", error);
    return NextResponse.json(
      { error: "Erro interno ao alterar plano" },
      { status: 500 }
    );
  }
}
