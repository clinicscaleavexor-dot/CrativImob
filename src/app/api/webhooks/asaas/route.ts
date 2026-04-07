import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN;

export async function POST(req: NextRequest) {
  try {
    // Verify webhook token if configured
    if (WEBHOOK_TOKEN) {
      const token = req.headers.get("asaas-access-token");
      if (token !== WEBHOOK_TOKEN) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json();
    const { event, payment, subscription: subData } = body;

    const serviceClient = createServiceClient();

    switch (event) {
      case "PAYMENT_CONFIRMED":
      case "PAYMENT_RECEIVED": {
        // Activate subscription on first payment
        const externalSubId = payment?.subscription;
        if (!externalSubId) break;

        const { data: sub } = await serviceClient
          .from("subscriptions")
          .select("id, user_id, plan_id, status")
          .eq("external_subscription_id", externalSubId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (sub) {
          // Update subscription to active
          const periodEnd = new Date();
          periodEnd.setDate(periodEnd.getDate() + 30);

          await serviceClient
            .from("subscriptions")
            .update({
              status: "active",
              current_period_start: new Date().toISOString(),
              current_period_end: periodEnd.toISOString(),
            })
            .eq("id", sub.id);

          // Grant/refresh credits on every confirmed payment (first activation + renewals)
          const { data: plan } = await serviceClient
            .from("plans")
            .select("credits_per_month")
            .eq("id", sub.plan_id)
            .single();

          if (plan) {
            await serviceClient
              .from("credits")
              .upsert(
                { user_id: sub.user_id, balance: plan.credits_per_month },
                { onConflict: "user_id" }
              );

            // Log credit transaction
            try {
              await serviceClient
                .from("credits_transactions")
                .insert({
                  user_id: sub.user_id,
                  amount: plan.credits_per_month,
                  type: "grant",
                  description: `Créditos do plano - pagamento ${payment?.id || "unknown"}`,
                });
            } catch (err) {
              console.error("Failed to log credit transaction:", err);
            }

            // Also ensure profile has the correct plan_id
            await serviceClient
              .from("profiles")
              .update({ plan_id: sub.plan_id })
              .eq("id", sub.user_id);
          }
        }
        break;
      }

      case "PAYMENT_OVERDUE": {
        const externalSubId = payment?.subscription;
        if (!externalSubId) break;

        await serviceClient
          .from("subscriptions")
          .update({ status: "overdue" })
          .eq("external_subscription_id", externalSubId)
          .in("status", ["active", "pending"]);
        break;
      }

      case "SUBSCRIPTION_DELETED":
      case "SUBSCRIPTION_INACTIVE": {
        const externalSubId = subData?.id || payment?.subscription;
        if (!externalSubId) break;

        const { data: sub } = await serviceClient
          .from("subscriptions")
          .select("id, user_id")
          .eq("external_subscription_id", externalSubId)
          .in("status", ["active", "pending", "overdue"])
          .maybeSingle();

        if (sub) {
          await serviceClient
            .from("subscriptions")
            .update({ status: "canceled" })
            .eq("id", sub.id);

          // Downgrade to free plan
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
              .eq("id", sub.user_id);

            await serviceClient
              .from("credits")
              .update({ balance: freePlan.credits_per_month })
              .eq("user_id", sub.user_id);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
