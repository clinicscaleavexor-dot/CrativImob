import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Zap,
  CheckCircle2,
  Crown,
  Building2,
  Images,
  Sparkles,
} from "lucide-react";
import type { Tables } from "@/types/database";

type Plan = Tables<"plans">;
type Subscription = Tables<"subscriptions">;
type Credits = Tables<"credits">;

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <Zap className="w-5 h-5" />,
  basic: <Sparkles className="w-5 h-5" />,
  pro: <Crown className="w-5 h-5" />,
};

const PLAN_COLORS: Record<string, string> = {
  free: "from-white/5 to-white/8 border-white/10",
  basic: "from-brand-500/10 to-blue-600/10 border-brand-500/30",
  pro: "from-yellow-500/10 to-amber-600/10 border-yellow-500/30",
};

const PLAN_ACCENT: Record<string, string> = {
  free: "text-white/60",
  basic: "text-brand-400",
  pro: "text-yellow-400",
};

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
      .eq("status", "active")
      .single(),
    supabase.from("credits").select("balance").eq("user_id", user.id).single(),
  ]);

  const plans = (plansRes.data as Plan[]) ?? [];
  const subscription = subRes.data as Subscription | null;
  const credits = creditsRes.data as Credits | null;

  const currentPlan = plans.find((p) => p.id === subscription?.plan_id);

  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Plano & Créditos</h1>
        <p className="text-white/60 text-sm">Gerencie seu plano e acompanhe seus créditos</p>
      </div>

      {/* Current Status */}
      {currentPlan && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">Plano Atual</h2>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  currentPlan.name.toLowerCase() === "pro"
                    ? "bg-yellow-500/15 text-yellow-400"
                    : currentPlan.name.toLowerCase().includes("basic") || currentPlan.name.toLowerCase().includes("starter")
                    ? "bg-brand-500/15 text-brand-400"
                    : "bg-white/8 text-white/70"
                }`}
              >
                {PLAN_ICONS[currentPlan.name.toLowerCase()] ?? <Zap className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-white font-bold text-lg">{currentPlan.name}</p>
                <p className="text-white/60 text-sm">
                  {currentPlan.price_cents === 0
                    ? "Gratuito"
                    : `R$ ${(currentPlan.price_cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês`}
                </p>
              </div>
            </div>
            <div className="text-right">
              {periodEnd && (
                <p className="text-white/60 text-sm">Renova em {periodEnd}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Credits balance */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1 bg-white/[0.03] border border-white/8 rounded-2xl p-5 text-center">
          <Zap className="w-5 h-5 text-brand-400 mx-auto mb-2" />
          <p className="text-3xl font-black text-white">{credits?.balance ?? 0}</p>
          <p className="text-white/60 text-xs mt-1">Créditos disponíveis</p>
        </div>
        <div className="col-span-1 bg-white/[0.03] border border-white/8 rounded-2xl p-5 text-center">
          <Images className="w-5 h-5 text-white/50 mx-auto mb-2" />
          <p className="text-3xl font-black text-white">{currentPlan?.credits_per_month ?? 0}</p>
          <p className="text-white/60 text-xs mt-1">Créditos/mês</p>
        </div>
        <div className="col-span-1 bg-white/[0.03] border border-white/8 rounded-2xl p-5 text-center">
          <Building2 className="w-5 h-5 text-white/50 mx-auto mb-2" />
          <p className="text-3xl font-black text-white">{currentPlan?.max_properties ?? 0}</p>
          <p className="text-white/60 text-xs mt-1">Imóveis máx.</p>
        </div>
      </div>

      {/* Plans comparison */}
      <div>
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">Planos Disponíveis</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((plan) => {
            const planKey = plan.name.toLowerCase();
            const isCurrent = plan.id === subscription?.plan_id;
            const isPro = planKey === "pro";
            const gradient = PLAN_COLORS[planKey] ?? PLAN_COLORS.free;
            const accent = PLAN_ACCENT[planKey] ?? "text-white/60";
            const features = (plan.features as string[]) ?? [];

            return (
              <div
                key={plan.id}
                className={`relative bg-gradient-to-br ${gradient} border rounded-2xl p-5 ${
                  isPro ? "ring-1 ring-yellow-500/20" : ""
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-black px-3 py-1 rounded-full">
                    MAIS POPULAR
                  </div>
                )}

                <div className={`flex items-center gap-2 mb-4 ${accent}`}>
                  {PLAN_ICONS[planKey] ?? <Zap className="w-5 h-5" />}
                  <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                </div>

                <div className="mb-4">
                  {plan.price_cents === 0 ? (
                    <p className="text-3xl font-black text-white">Grátis</p>
                  ) : (
                    <>
                      <p className="text-3xl font-black text-white">
                        R${" "}
                        {(plan.price_cents / 100).toLocaleString("pt-BR", {
                          minimumFractionDigits: 0,
                        })}
                      </p>
                      <p className="text-white/60 text-sm">/mês</p>
                    </>
                  )}
                </div>

                <ul className="space-y-2 mb-5">
                  <li className="flex items-center gap-2 text-sm text-white/70">
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${accent}`} />
                    {plan.credits_per_month} créditos/mês
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/70">
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${accent}`} />
                    Até {plan.max_properties} imóveis
                  </li>
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${accent}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl text-sm font-semibold bg-white/8 text-white/60 cursor-default"
                  >
                    Plano atual
                  </button>
                ) : plan.price_cents === 0 ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl text-sm font-semibold bg-white/5 text-white/50 cursor-default"
                  >
                    Downgrade
                  </button>
                ) : (
                  <button
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isPro
                        ? "bg-yellow-500 hover:bg-yellow-400 text-black"
                        : "bg-brand-500 hover:bg-brand-600 text-white"
                    }`}
                    onClick={() => {
                      // Payment integration TBD
                      alert("Em breve! Integração de pagamento em desenvolvimento.");
                    }}
                  >
                    {isPro ? "Assinar Pro" : "Fazer upgrade"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Credits info */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">Como funcionam os créditos</h2>
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          {[
            { icon: "🖼️", text: "1 crédito = 1 imagem gerada com IA" },
            { icon: "🔄", text: "Créditos renovam mensalmente" },
            { icon: "♾️", text: "Créditos não expiram no Pro" },
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-2 text-white/70">
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
