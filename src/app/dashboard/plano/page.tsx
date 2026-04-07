import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Tables } from "@/types/database";
import PlanoClient from "./PlanoClient";

type Plan = Tables<"plans">;
type Subscription = Tables<"subscriptions">;
type Credits = Tables<"credits">;

export default async function PlanoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [plansRes, subRes, creditsRes] = await Promise.all([
    supabase.from("plans").select("*").eq("is_active", true).order("price_cents"),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["active", "pending"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("credits").select("balance").eq("user_id", user.id).single(),
  ]);

  const plans = (plansRes.data as Plan[]) ?? [];
  const subscription = subRes.data as Subscription | null;
  const credits = creditsRes.data as Credits | null;

  return (
    <PlanoClient
      plans={plans}
      subscription={subscription}
      credits={credits}
    />
  );
}
