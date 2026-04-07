import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { cancelSubscription } from "@/lib/asaas";

export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const serviceClient = createServiceClient();

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

    // Cancel in Asaas
    await cancelSubscription(currentSub.external_subscription_id);

    // Update local subscription
    await serviceClient
      .from("subscriptions")
      .update({ status: "canceled" })
      .eq("id", currentSub.id);

    // Find free plan and set it
    const { data: freePlan } = await serviceClient
      .from("plans")
      .select("id, credits_per_month")
      .eq("slug", "free")
      .eq("is_active", true)
      .single();

    if (freePlan) {
      await serviceClient
        .from("profiles")
        .update({ plan_id: freePlan.id })
        .eq("id", user.id);

      await serviceClient
        .from("credits")
        .update({ balance: freePlan.credits_per_month })
        .eq("user_id", user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel error:", error);
    return NextResponse.json(
      { error: "Erro interno ao cancelar assinatura" },
      { status: 500 }
    );
  }
}
