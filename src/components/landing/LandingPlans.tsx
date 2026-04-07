"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Zap,
  Rocket,
  Sparkles,
  Crown,
  Diamond,
  CheckCircle,
} from "lucide-react";

interface Plan {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  credits_per_month: number;
  max_properties: number;
  features: string[];
}

const PLAN_META: Record<
  string,
  {
    icon: React.ReactNode;
    accent: string;
    border: string;
    bg: string;
    cta: string;
    ctaStyle: React.CSSProperties;
  }
> = {
  free: {
    icon: <Zap className="w-5 h-5" />,
    accent: "text-white/50",
    border: "border-white/8",
    bg: "rgba(255,255,255,0.022)",
    cta: "Começar grátis",
    ctaStyle: { background: "rgba(255,255,255,0.06)", color: "#fff" },
  },
  start: {
    icon: <Rocket className="w-5 h-5" />,
    accent: "text-blue-400",
    border: "border-blue-500/20",
    bg: "rgba(37,99,235,0.04)",
    cta: "Assinar Start",
    ctaStyle: { background: "rgba(37,99,235,0.15)", color: "#60a5fa" },
  },
  intermedium: {
    icon: <Sparkles className="w-5 h-5" />,
    accent: "text-purple-400",
    border: "border-purple-500/20",
    bg: "rgba(147,51,234,0.04)",
    cta: "Assinar Intermedium",
    ctaStyle: { background: "rgba(147,51,234,0.15)", color: "#c084fc" },
  },
  gold: {
    icon: <Crown className="w-5 h-5" />,
    accent: "text-yellow-400",
    border: "border-yellow-500/30",
    bg: "rgba(234,179,8,0.06)",
    cta: "Assinar Gold",
    ctaStyle: {
      background: "linear-gradient(135deg,#eab308,#ca8a04)",
      color: "#000",
      boxShadow: "0 8px 24px rgba(234,179,8,0.25)",
    },
  },
  diamante: {
    icon: <Diamond className="w-5 h-5" />,
    accent: "text-cyan-400",
    border: "border-cyan-500/20",
    bg: "rgba(6,182,212,0.04)",
    cta: "Assinar Diamante",
    ctaStyle: { background: "rgba(6,182,212,0.15)", color: "#22d3ee" },
  },
};

export default function LandingPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPlans(data);
      })
      .catch(() => {});
  }, []);

  if (plans.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 max-w-6xl mx-auto">
      {plans.map((plan) => {
        const slug = plan.slug ?? "free";
        const meta = PLAN_META[slug] ?? PLAN_META.free;
        const isPopular = slug === "gold";

        return (
          <div
            key={plan.id}
            className={`relative p-6 rounded-2xl border flex flex-col transition-all ${meta.border} ${
              isPopular ? "ring-1 ring-yellow-500/30 scale-[1.02]" : ""
            }`}
            style={{ background: meta.bg }}
          >
            {isPopular && (
              <div
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-black text-black px-3 py-1 rounded-full shadow-lg whitespace-nowrap"
                style={{
                  background: "linear-gradient(135deg,#eab308,#ca8a04)",
                }}
              >
                Mais popular
              </div>
            )}

            <div className={`flex items-center gap-2 mb-4 ${meta.accent}`}>
              {meta.icon}
              <h3 className="font-bold text-white text-base">{plan.name}</h3>
            </div>

            <div className="mb-5">
              {plan.price_cents === 0 ? (
                <p className="text-3xl font-black text-white">Grátis</p>
              ) : (
                <>
                  <p className="text-3xl font-black text-white">
                    R${" "}
                    {(plan.price_cents / 100).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-white/30 text-sm">/mês</p>
                </>
              )}
            </div>

            <ul className="space-y-2 mb-6 flex-1">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle
                  className={`w-4 h-4 flex-shrink-0 ${meta.accent}`}
                />
                <span className="text-white/60">
                  {plan.credits_per_month >= 999
                    ? "Créditos ilimitados"
                    : `${plan.credits_per_month} créditos/mês`}
                </span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle
                  className={`w-4 h-4 flex-shrink-0 ${meta.accent}`}
                />
                <span className="text-white/60">
                  {plan.max_properties === -1
                    ? "Imóveis ilimitados"
                    : `Até ${plan.max_properties} imóveis`}
                </span>
              </li>
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle
                    className={`w-4 h-4 flex-shrink-0 ${meta.accent}`}
                  />
                  <span className="text-white/60">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href={`/register?plan=${slug}`}
              className="block text-center py-3 rounded-xl font-black text-sm transition-all hover:scale-105"
              style={meta.ctaStyle}
            >
              {meta.cta}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
