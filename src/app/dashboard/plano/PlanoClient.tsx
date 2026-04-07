"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  CheckCircle2,
  Crown,
  Building2,
  Images,
  Sparkles,
  Diamond,
  Rocket,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { Tables } from "@/types/database";
import CheckoutModal from "@/components/dashboard/CheckoutModal";

type Plan = Tables<"plans">;
type Subscription = Tables<"subscriptions">;
type Credits = Tables<"credits">;

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <Zap className="w-5 h-5" />,
  start: <Rocket className="w-5 h-5" />,
  intermedium: <Sparkles className="w-5 h-5" />,
  gold: <Crown className="w-5 h-5" />,
  diamante: <Diamond className="w-5 h-5" />,
};

const PLAN_COLORS: Record<string, string> = {
  free: "from-white/5 to-white/8 border-white/10",
  start: "from-brand-500/10 to-blue-600/10 border-brand-500/30",
  intermedium: "from-purple-500/10 to-violet-600/10 border-purple-500/30",
  gold: "from-yellow-500/10 to-amber-600/10 border-yellow-500/30",
  diamante: "from-cyan-500/10 to-teal-600/10 border-cyan-500/30",
};

const PLAN_ACCENT: Record<string, string> = {
  free: "text-white/60",
  start: "text-brand-400",
  intermedium: "text-purple-400",
  gold: "text-yellow-400",
  diamante: "text-cyan-400",
};

interface PlanoClientProps {
  plans: Plan[];
  subscription: Subscription | null;
  credits: Credits | null;
}

export default function PlanoClient({ plans, subscription, credits }: PlanoClientProps) {
  const router = useRouter();
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  const currentPlan = plans.find((p) => p.id === subscription?.plan_id);
  const hasActiveSubscription = subscription && ["active", "pending"].includes(subscription.status);

  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  async function handleCancel() {
    setCanceling(true);
    try {
      const res = await fetch("/api/subscriptions/cancel", { method: "DELETE" });
      if (res.ok) {
        router.refresh();
        setCancelConfirm(false);
      }
    } catch {
      // ignore
    } finally {
      setCanceling(false);
    }
  }

  async function handleUpgrade(plan: Plan) {
    if (hasActiveSubscription) {
      // Upgrade existing subscription
      const res = await fetch("/api/subscriptions/upgrade", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      if (res.ok) {
        router.refresh();
      }
    } else {
      // New subscription — open checkout
      setCheckoutPlan(plan);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Plano & Créditos</h1>
        <p className="text-white/60 text-sm">Gerencie seu plano e acompanhe seus créditos</p>
      </div>

      {/* Current Status */}
      {currentPlan && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">
            Plano Atual
          </h2>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  PLAN_ACCENT[currentPlan.slug ?? "free"]
                    ? `bg-current/15 ${PLAN_ACCENT[currentPlan.slug ?? "free"]}`
                    : "bg-white/8 text-white/70"
                }`}
              >
                {PLAN_ICONS[currentPlan.slug ?? "free"] ?? <Zap className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-white font-bold text-lg">{currentPlan.name}</p>
                <p className="text-white/60 text-sm">
                  {currentPlan.price_cents === 0
                    ? "Gratuito"
                    : `R$ ${(currentPlan.price_cents / 100).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}/mês`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {periodEnd && (
                <p className="text-white/60 text-sm">Renova em {periodEnd}</p>
              )}
              {hasActiveSubscription && currentPlan.price_cents > 0 && (
                <button
                  onClick={() => setCancelConfirm(true)}
                  className="text-red-400/70 hover:text-red-400 text-sm transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {/* Subscription status badge */}
          {subscription && subscription.status === "pending" && (
            <div className="mt-3 flex items-center gap-2 text-yellow-400 text-sm bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
              <AlertTriangle className="w-4 h-4" />
              Aguardando confirmação do pagamento
            </div>
          )}
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
          <p className="text-3xl font-black text-white">
            {currentPlan?.max_properties === -1 ? "∞" : currentPlan?.max_properties ?? 0}
          </p>
          <p className="text-white/60 text-xs mt-1">Imóveis máx.</p>
        </div>
      </div>

      {/* Plans comparison */}
      <div>
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">
          Planos Disponíveis
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {plans.map((plan) => {
            const slug = plan.slug ?? plan.name.toLowerCase();
            const isCurrent = plan.id === subscription?.plan_id;
            const isGold = slug === "gold";
            const isDiamante = slug === "diamante";
            const gradient = PLAN_COLORS[slug] ?? PLAN_COLORS.free;
            const accent = PLAN_ACCENT[slug] ?? "text-white/60";
            const features = (plan.features as string[]) ?? [];
            const isDowngrade =
              currentPlan && plan.price_cents < currentPlan.price_cents;

            return (
              <div
                key={plan.id}
                className={`relative bg-gradient-to-br ${gradient} border rounded-2xl p-5 flex flex-col ${
                  isGold ? "ring-1 ring-yellow-500/20" : ""
                }`}
              >
                {isGold && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-black px-3 py-1 rounded-full whitespace-nowrap">
                    MAIS POPULAR
                  </div>
                )}

                <div className={`flex items-center gap-2 mb-4 ${accent}`}>
                  {PLAN_ICONS[slug] ?? <Zap className="w-5 h-5" />}
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

                <ul className="space-y-2 mb-5 flex-1">
                  <li className="flex items-center gap-2 text-sm text-white/70">
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${accent}`} />
                    {plan.credits_per_month >= 999
                      ? "Créditos ilimitados"
                      : `${plan.credits_per_month} créditos/mês`}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/70">
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${accent}`} />
                    {plan.max_properties === -1
                      ? "Imóveis ilimitados"
                      : `Até ${plan.max_properties} imóveis`}
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
                    className="w-full py-2.5 rounded-xl text-sm font-semibold bg-white/5 text-white/40 cursor-default"
                  >
                    Plano gratuito
                  </button>
                ) : isDowngrade ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl text-sm font-semibold bg-white/5 text-white/40 cursor-default"
                  >
                    Downgrade
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan)}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isGold
                        ? "bg-yellow-500 hover:bg-yellow-400 text-black"
                        : "bg-brand-500 hover:bg-brand-600 text-white"
                    }`}
                  >
                    {hasActiveSubscription ? "Fazer upgrade" : "Assinar"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Credits info */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">
          Como funcionam os créditos
        </h2>
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          {[
            { icon: "🖼️", text: "1 crédito = 1 imagem gerada com IA" },
            { icon: "🔄", text: "Créditos renovam mensalmente" },
            { icon: "💎", text: "Créditos ilimitados no Diamante" },
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-2 text-white/70">
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Modal */}
      {checkoutPlan && (
        <CheckoutModal
          plan={{
            ...checkoutPlan,
            features: (checkoutPlan.features as string[]) ?? [],
          }}
          onClose={() => setCheckoutPlan(null)}
          onSuccess={() => {
            setCheckoutPlan(null);
            router.refresh();
          }}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setCancelConfirm(false)} />
          <div className="relative w-full max-w-sm bg-[#0e1117] border border-white/10 rounded-2xl p-6 text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Cancelar assinatura?</h3>
            <p className="text-white/60 text-sm">
              Você será movido para o plano Free e perderá os benefícios do plano atual.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/8 text-white/70 hover:bg-white/12 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleCancel}
                disabled={canceling}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {canceling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
