import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import DashboardTopbar from "@/components/dashboard/Topbar";
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

  return (
    <div className="min-h-screen bg-[#060b14] flex">
      <DashboardSidebar profile={profile} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar
          user={user}
          credits={credits?.balance ?? 0}
          profile={profile}
        />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
