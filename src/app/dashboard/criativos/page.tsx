import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CriativosClient from "./CriativosClient";
import type { Tables } from "@/types/database";

type Creative = Tables<"creatives"> & {
  properties: Pick<Tables<"properties">, "title" | "type"> | null;
  templates: Pick<Tables<"templates">, "name"> | null;
};

export default async function CriativosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: creatives } = await supabase
    .from("creatives")
    .select(
      `
      *,
      properties (title, type),
      templates (name)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return <CriativosClient initialCreatives={(creatives as Creative[]) ?? []} />;
}
