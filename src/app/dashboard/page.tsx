import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, ImageIcon, Home, Zap, ArrowRight } from "lucide-react";
import CreativeCard from "@/components/dashboard/CreativeCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [creditsResult, creativesResult, propertiesResult] =
    await Promise.all([
      supabase
        .from("credits")
        .select("balance")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("creatives")
        .select("id, title, type, status, created_at, image_url")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("properties")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true),
    ]);

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("full_name, company_name, plan_id")
    .eq("id", user.id)
    .single();

  type ProfileData = { full_name: string | null; company_name: string | null; plan_id: string | null };
  const profileData = profileRaw as ProfileData | null;

  const planName = profileData?.plan_id
    ? await supabase
        .from("plans")
        .select("name")
        .eq("id", profileData.plan_id)
        .single()
        .then((r) => (r.data as { name: string } | null)?.name ?? "free")
    : "free";

  const profile = profileData ? { ...profileData, plans: { name: planName } } : null;
  const balance = (creditsResult.data as { balance: number } | null)?.balance ?? 0;
  const creatives = (creativesResult.data ?? []) as Array<{
    id: string;
    title: string | null;
    type: string;
    status: string;
    created_at: string;
    image_url: string | null;
  }>;
  const propertyCount = propertiesResult.data?.length ?? 0;

  const firstName = profile?.full_name?.split(" ")[0] ?? "Corretor";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">
            Olá, {firstName} 👋
          </h1>
          <p className="text-white/60 text-sm">
            {profile?.company_name ?? "Bem-vindo ao CriativImob"}
          </p>
        </div>
        <Link
          href="/dashboard/criar"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          Criar criativo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Créditos restantes",
            value: balance,
            icon: Zap,
            color: "text-yellow-400",
            bg: "bg-yellow-400/10",
          },
          {
            label: "Criativos gerados",
            value: creatives.length,
            icon: ImageIcon,
            color: "text-brand-400",
            bg: "bg-brand-400/10",
          },
          {
            label: "Imóveis cadastrados",
            value: propertyCount,
            icon: Home,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
          },
          {
            label: "Plano atual",
            value: (profile?.plans as { name?: string } | null)?.name?.toUpperCase() ?? "FREE",
            icon: ArrowRight,
            color: "text-purple-400",
            bg: "bg-purple-400/10",
            isText: true,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white/[0.04] border border-white/8 rounded-2xl p-5"
          >
            <div
              className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}
            >
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className={`text-2xl font-black ${stat.isText ? "text-lg" : "text-white"}`}>
              {stat.value}
            </p>
            <p className="text-white/60 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Créditos baixos */}
      {balance <= 2 && (
        <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-white font-semibold text-sm">
                Você tem apenas {balance} crédito{balance !== 1 ? "s" : ""} restante{balance !== 1 ? "s" : ""}
              </p>
              <p className="text-white/60 text-xs">Faça upgrade para continuar gerando criativos</p>
            </div>
          </div>
          <Link
            href="/dashboard/plano"
            className="text-sm bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Ver planos
          </Link>
        </div>
      )}

      {/* Últimos criativos */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Seus criativos</h2>
          <Link
            href="/dashboard/criativos"
            className="text-sm text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
          >
            Ver todos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {creatives.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/8 border-dashed rounded-2xl p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-6 h-6 text-white/50" />
            </div>
            <p className="text-white/70 mb-1 font-medium">Nenhum criativo ainda</p>
            <p className="text-white/50 text-sm mb-6">
              Crie seu primeiro criativo em menos de 2 minutos
            </p>
            <Link
              href="/dashboard/criar"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Criar primeiro criativo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {creatives.map((creative) => (
              <CreativeCard key={creative.id} creative={creative} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
