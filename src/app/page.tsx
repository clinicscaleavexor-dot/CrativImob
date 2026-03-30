import Link from "next/link";
import {
  Zap,
  Star,
  CheckCircle,
  ArrowRight,
  Home,
  ImageIcon,
  Share2,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060b14] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#060b14]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">CriativImob</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a>
          <a href="#exemplos" className="hover:text-white transition-colors">Exemplos</a>
          <a href="#planos" className="hover:text-white transition-colors">Planos</a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="text-sm bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm px-4 py-1.5 rounded-full mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Geramos + de 10.000 criativos por mês
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            Criativos imobiliários
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-blue-300">
              prontos em segundos
            </span>
          </h1>

          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Envie a foto do imóvel, preencha os dados — e a IA gera posts
            profissionais para Instagram, Stories e tráfego pago.{" "}
            <span className="text-white/80">Sem designer. Sem complicação.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-brand-500/25"
            >
              Criar criativo agora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-white/40 text-sm">
              5 criativos grátis · Sem cartão
            </p>
          </div>
        </div>

        {/* Mock cards */}
        <div className="relative max-w-5xl mx-auto mt-20">
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto opacity-90">
            {[
              { label: "Post Instagram", color: "from-blue-600 to-blue-900", badge: "LANÇAMENTO" },
              { label: "Stories", color: "from-purple-600 to-purple-900", badge: "OPORTUNIDADE", featured: true },
              { label: "Tráfego Pago", color: "from-emerald-600 to-emerald-900", badge: "DESTAQUE" },
            ].map((card, i) => (
              <div
                key={i}
                className={`relative rounded-2xl bg-gradient-to-b ${card.color} border border-white/10 overflow-hidden ${card.featured ? "scale-105 shadow-2xl z-10" : ""}`}
                style={{ aspectRatio: card.label === "Stories" ? "9/16" : "1/1" }}
              >
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <span className="self-start text-[10px] font-bold bg-white/20 backdrop-blur px-2 py-0.5 rounded-full">
                    {card.badge}
                  </span>
                  <div>
                    <div className="h-2 bg-white/30 rounded mb-1.5 w-3/4" />
                    <div className="h-1.5 bg-white/20 rounded mb-1 w-1/2" />
                    <div className="h-6 bg-white/20 rounded-lg mt-3 w-2/3 text-[8px] flex items-center justify-center text-white/70">
                      Agende sua visita
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-8 bg-brand-500/30 blur-xl rounded-full" />
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight mb-4">
              Como funciona
            </h2>
            <p className="text-white/50 text-lg">3 passos. Menos de 2 minutos.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Home,
                title: "Preencha os dados",
                desc: "Tipo, preço, localização, quartos, destaques. E faça upload das fotos do imóvel.",
              },
              {
                step: "02",
                icon: Sparkles,
                title: "A IA trabalha",
                desc: "Nossa IA melhora as imagens, escolhe o layout ideal e gera os textos do anúncio automaticamente.",
              },
              {
                step: "03",
                icon: Share2,
                title: "Baixe e publique",
                desc: "Criativo pronto em HD. Baixe, copie os textos e publique direto no Instagram ou WhatsApp.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-8 rounded-2xl bg-white/[0.03] border border-white/8 hover:bg-white/[0.06] transition-colors group"
              >
                <div className="text-6xl font-black text-white/5 absolute top-6 right-6 select-none">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6 group-hover:bg-brand-500/20 transition-colors">
                  <item.icon className="w-5 h-5 text-brand-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight mb-4">
              Tudo que você precisa
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: ImageIcon,
                title: "Melhoria automática de imagens",
                desc: "A IA melhora iluminação, cores e qualidade das suas fotos antes de usar no criativo.",
              },
              {
                icon: Zap,
                title: "Copy gerada por IA",
                desc: "Headline, descrição e CTA criados automaticamente com base no perfil do imóvel e público-alvo.",
              },
              {
                icon: Star,
                title: "Templates por segmento",
                desc: "Templates para luxo, popular, investimento e lançamento — cada um com visual adequado.",
              },
              {
                icon: Share2,
                title: "Multi-formato",
                desc: "Post 1:1 para feed, 9:16 para Stories e formato banner para tráfego pago — tudo de uma vez.",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="flex gap-5 p-6 rounded-xl bg-white/[0.03] border border-white/8"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                  <feat.icon className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{feat.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight mb-4">Planos simples</h2>
            <p className="text-white/50 text-lg">Comece grátis. Escale quando precisar.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Free",
                price: "Grátis",
                period: "",
                features: ["5 criativos/mês", "3 imóveis", "Templates básicos"],
                cta: "Começar grátis",
                highlighted: false,
              },
              {
                name: "Basic",
                price: "R$19",
                period: "/mês",
                features: ["30 criativos/mês", "20 imóveis", "Todos os templates", "Download HD"],
                cta: "Assinar Basic",
                highlighted: true,
              },
              {
                name: "Pro",
                price: "R$49",
                period: "/mês",
                features: [
                  "Criativos ilimitados",
                  "Imóveis ilimitados",
                  "Variações automáticas",
                  "IA prioritária",
                  "Envio por WhatsApp",
                ],
                cta: "Assinar Pro",
                highlighted: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-2xl border ${
                  plan.highlighted
                    ? "bg-brand-500/10 border-brand-500/40 shadow-xl shadow-brand-500/10"
                    : "bg-white/[0.03] border-white/8"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs bg-brand-500 text-white px-3 py-1 rounded-full font-semibold">
                    Mais popular
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-white/50 text-sm mb-1">{plan.name}</p>
                  <p className="text-4xl font-black">
                    {plan.price}
                    <span className="text-lg font-normal text-white/40">{plan.period}</span>
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-brand-400 flex-shrink-0" />
                      <span className="text-white/70">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlighted
                      ? "bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25"
                      : "bg-white/8 hover:bg-white/12 text-white"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Pronto para criar seu primeiro criativo?
          </h2>
          <p className="text-white/50 text-lg mb-10">
            Comece grátis agora. 5 criativos incluídos. Sem cartão.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-xl shadow-brand-500/30"
          >
            Criar criativo agora
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-500 flex items-center justify-center">
              <Home className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm">CriativImob</span>
          </div>
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} CriativImob. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
