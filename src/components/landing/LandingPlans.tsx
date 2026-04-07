"use client";

import Link from "next/link";
import {
  Zap,
  Rocket,
  Sparkles,
  Crown,
  Diamond,
  CheckCircle,
} from "lucide-react";

interface PlanCard {
  slug: string;
  name: string;
  price: string;
  credits: number;
  features: string[];
}

const PLANS: PlanCard[] = [
  {
    slug: "free",
    name: "Free",
    price: "Grátis",
    credits: 5,
    features: [
      "5 créditos/mês",
      "Pode criar 5 artes por mês",
      "Download das imagens",
    ],
  },
  {
    slug: "start",
    name: "Start",
    price: "R$ 39,90",
    credits: 15,
    features: [
      "15 créditos por mês",
      "Pode criar 15 artes por mês",
      "Download das imagens",
    ],
  },
  {
    slug: "intermedium",
    name: "Intermedium",
    price: "R$ 59,90",
    credits: 30,
    features: [
      "30 créditos por mês",
      "Pode criar 30 artes por mês",
      "Download das imagens",
    ],
  },
  {
    slug: "gold",
    name: "Gold",
    price: "R$ 99,90",
    credits: 50,
    features: [
      "50 créditos por mês",
      "Pode criar 50 artes por mês",
      "Download das imagens",
    ],
  },
  {
    slug: "diamante",
    name: "Diamante",
    price: "R$ 129,90",
    credits: 100,
    features: [
      "100 créditos por mês",
      "Pode criar 100 artes por mês",
      "Download das imagens",
    ],
  },
];

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
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 max-w-6xl mx-auto">
      {PLANS.map((plan) => {
        const meta = PLAN_META[plan.slug] ?? PLAN_META.free;
        const isPopular = plan.slug === "gold";

        return (
          <div
            key={plan.slug}
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
              {plan.slug === "free" ? (
                <p className="text-3xl font-black text-white">{plan.price}</p>
              ) : (
                <>
                  <p className="text-3xl font-black text-white">{plan.price}</p>
                  <p className="text-white/30 text-sm">/mês</p>
                </>
              )}
            </div>

            <ul className="space-y-2 mb-6 flex-1">
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
              href={`/register?plan=${plan.slug}`}
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
