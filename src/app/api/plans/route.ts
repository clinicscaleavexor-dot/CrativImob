import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("plans")
    .select("id, slug, name, price_cents, credits_per_month, max_properties, features")
    .eq("is_active", true)
    .order("price_cents", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }

  return NextResponse.json(data);
}
