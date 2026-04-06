import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";
import type { Tables } from "@/types/database";

type ProfileRow = Pick<Tables<"profiles">, "full_name" | "company_name" | "avatar_url" | "plan_id">;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("full_name, company_name, avatar_url, plan_id")
    .eq("id", user.id)
    .single();

  const { data: creditsRaw } = await supabase
    .from("credits")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  const profileData = profileRaw as ProfileRow | null;
  const creditsData = creditsRaw as { balance: number } | null;

  const planName = profileData?.plan_id
    ? await supabase
        .from("plans")
        .select("name")
        .eq("id", profileData.plan_id)
        .single()
        .then((r) => (r.data as { name: string } | null)?.name ?? "free")
    : "free";

  const profile = profileData ? { ...profileData, plans: { name: planName } } : null;
  const credits = creditsData;
  const userRole = (user.user_metadata?.role as string) ?? null;

  return (
    <DashboardShell
      user={user}
      credits={credits?.balance ?? 0}
      profile={profile}
      userRole={userRole}
    >
      {children}
    </DashboardShell>
  );
}
