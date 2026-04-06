import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CriativosClient from "./CriativosClient";
import type { Tables } from "@/types/database";

type Creative = Tables<"creatives">;

export default async function CriativosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const serviceClient = createServiceClient();
  const { data: creatives } = await serviceClient
    .from("creatives")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return <CriativosClient initialCreatives={(creatives as Creative[]) ?? []} />;
}
