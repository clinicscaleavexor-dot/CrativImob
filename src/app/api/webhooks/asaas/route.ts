import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN;

/**
 * Parse externalReference format: "user_{USER_ID}_plan_{SLUG}"
 */
function parseExternalReference(ref: string | undefined | null): { userId: string; planSlug: string } | null {
  if (!ref) return null;
  const match = ref.match(/^user_(.+)_plan_(.+)$/);
  if (!match) return null;
  return { userId: match[1], planSlug: match[2] };
}

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
        // Try externalReference first, fall back to subscription ID lookup
        const extRef = payment?.externalReference;
        const parsed = parseExternalReference(extRef);

        let userId: string | null = null;
        let planId: string | null = null;
        let subId: string | null = null;

        if (parsed) {
          // Resolve plan from slug
          const { data: plan } = await serviceClient
            .from("plans")
            .select("id, credits_per_month")
            .eq("slug", parsed.planSlug)
            .eq("is_active", true)
            .single();

          if (plan) {
            userId = parsed.userId;
            planId = plan.id;

            // Find the local subscription record
            const { data: sub } = await serviceClient
              .from("subscriptions")
              .select("id")
              .eq("user_id", userId)
              .eq("external_reference", extRef)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            subId = sub?.id ?? null;
          }
        }

        // Fallback: look up by external_subscription_id
        if (!userId && payment?.subscription) {
          const { data: sub } = await serviceClient
            .from("subscriptions")
            .select("id, user_id, plan_id")
            .eq("external_subscription_id", payment.subscription)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (sub) {
            userId = sub.user_id;
            planId = sub.plan_id;
            subId = sub.id;
          }
        }

        if (!userId || !planId) {
          console.error("Webhook: could not identify user for payment", payment?.id);
          break;
        }

        // Activate subscription
        if (subId) {
          const periodEnd = new Date();
          periodEnd.setDate(periodEnd.getDate() + 30);

          await serviceClient
            .from("subscriptions")
            .update({
              status: "active",
              current_period_start: new Date().toISOString(),
              current_period_end: periodEnd.toISOString(),
            })
            .eq("id", subId);
        }

        // Grant credits
        const { data: plan } = await serviceClient
          .from("plans")
          .select("credits_per_month")
          .eq("id", planId)
          .single();

        if (plan) {
          await serviceClient
            .from("credits")
            .upsert(
              { user_id: userId, balance: plan.credits_per_month },
              { onConflict: "user_id" }
            );

          try {
            await serviceClient
              .from("credits_transactions")
              .insert({
                user_id: userId,
                amount: plan.credits_per_month,
                type: "grant",
                description: `Créditos do plano - pagamento ${payment?.id || "unknown"}`,
              });
          } catch (err) {
            console.error("Failed to log credit transaction:", err);
          }

          await serviceClient
            .from("profiles")
            .update({ plan_id: planId })
            .eq("id", userId);
        }
        break;
      }

      case "PAYMENT_OVERDUE": {
        const extRef = payment?.externalReference;
        const parsed = parseExternalReference(extRef);
        const externalSubId = payment?.subscription;

        if (parsed) {
          await serviceClient
            .from("subscriptions")
            .update({ status: "overdue" })
            .eq("external_reference", extRef)
            .in("status", ["active", "pending"]);
        } else if (externalSubId) {
          await serviceClient
            .from("subscriptions")
            .update({ status: "overdue" })
            .eq("external_subscription_id", externalSubId)
            .in("status", ["active", "pending"]);
        }
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
