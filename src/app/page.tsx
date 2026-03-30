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

      {/* Exemplos */}
      <section id="exemplos" className="py-24 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-brand-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Galeria de exemplos</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Criativos 100% feitos com nossa IA</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">Exemplos gerados em segundos — prontos para publicar no Instagram, Stories e tráfego pago</p>
          </div>

          {/* Row 1: 3 square cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">

            {/* Card 1: Luxury Lançamento */}
            <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "1/1" }}>
              <div className="absolute inset-0 bg-gradient-to-b from-[#070d1e] via-[#0f1e3d] to-[#060b18]" />
              <div className="absolute bottom-0 left-[8%] w-[11%] h-[45%] bg-[#1a2d5a] border border-blue-800/30" />
              <div className="absolute bottom-0 left-[19%] w-[7%] h-[32%] bg-[#152244]" />
              <div className="absolute bottom-0 left-[26%] w-[22%] h-[55%] bg-[#1e3468] border border-blue-700/30">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(to right, transparent 0, transparent 5px, rgba(100,150,255,0.4) 5px, rgba(100,150,255,0.4) 6px), repeating-linear-gradient(to bottom, transparent 0, transparent 7px, rgba(100,150,255,0.4) 7px, rgba(100,150,255,0.4) 8px)" }} />
              </div>
              <div className="absolute bottom-0 right-[12%] w-[14%] h-[50%] bg-[#1a2d5a] border border-blue-800/20" />
              <div className="absolute bottom-0 right-[4%] w-[8%] h-[35%] bg-[#12204e]" />
              <div className="absolute bottom-0 left-0 right-0 h-[70%] bg-gradient-to-t from-[#060b18] to-transparent" />
              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center text-[8px] font-black text-white">A</div>
                    <span className="text-[9px] font-bold text-white/80 tracking-widest uppercase">Ávila Incorporadora</span>
                  </div>
                  <span className="text-[9px] font-black bg-amber-400 text-black px-2.5 py-0.5 rounded-full">LANÇAMENTO</span>
                </div>
                <div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {["3 suítes","Rooftop","Vaga dupla"].map(t=>(
                      <span key={t} className="text-[8px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full border border-white/10">{t}</span>
                    ))}
                  </div>
                  <p className="text-blue-300/50 text-[10px] mb-0.5 uppercase tracking-widest">São Paulo · SP</p>
                  <h3 className="text-white font-black text-[22px] leading-tight mb-1">RESIDENCIAL<br/>ALTO DO ITAIM</h3>
                  <p className="text-white/40 text-[10px] mb-3">A partir de <span className="text-white/90 font-bold">R$ 1,8M</span></p>
                  <div className="bg-blue-600 text-white text-[10px] font-bold py-2.5 rounded-xl text-center tracking-wide">Agende seu tour exclusivo →</div>
                </div>
              </div>
            </div>

            {/* Card 2: Beach Terrenos */}
            <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "1/1" }}>
              <div className="absolute inset-0 bg-gradient-to-b from-[#0ea5c9] via-[#0369a1] to-[#7c4f1a]" />
              <div className="absolute top-[30%] left-0 right-0 h-px bg-white/25" />
              <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-[#78350f] to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-[65%] bg-gradient-to-t from-[#431407]/90 to-transparent" />
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-[7px] font-black text-white">PV</div>
                    <span className="text-[9px] font-bold text-white/80 tracking-widest uppercase">Praia Verde</span>
                  </div>
                  <span className="text-[9px] font-black bg-emerald-400 text-black px-2.5 py-0.5 rounded-full">OPORTUNIDADE</span>
                </div>
                <div>
                  <h3 className="text-white font-black text-2xl leading-none mb-1">TERRENOS<br/>NA BEIRA-MAR</h3>
                  <p className="text-amber-200/70 text-[10px] mb-3 uppercase tracking-widest">Itacaré · Bahia</p>
                  <div className="flex gap-2 mb-3">
                    {[["Lotes","300m²"],["Entrada","R$15k"],["Mensais","R$990"]].map(([l,v])=>(
                      <div key={l} className="flex-1 bg-black/30 backdrop-blur-sm rounded-lg p-2 text-center border border-white/10">
                        <p className="text-white/50 text-[8px] uppercase">{l}</p>
                        <p className="text-white font-black text-sm">{v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-teal-500 text-white text-[10px] font-bold py-2.5 rounded-xl text-center tracking-wide">Quero meu terreno →</div>
                </div>
              </div>
            </div>

            {/* Card 3: Saia do Aluguel */}
            <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "1/1" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#052e16] via-[#14532d] to-[#064e3b]" />
              {/* Building windows */}
              <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[55%] h-[45%] bg-[#166534]/30 border border-white/5">
                {[0,1,2].map(row=>[0,1,2,3].map(col=>(
                  <div key={`${row}-${col}`} className="absolute w-[18%] h-[24%] rounded-sm"
                    style={{ top:`${14+row*30}%`, left:`${7+col*24}%`, background: (col+row)%2===0 ? "rgba(253,224,71,0.5)" : "rgba(255,255,255,0.06)" }} />
                )))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[65%] bg-gradient-to-t from-[#021a0e] to-transparent" />
              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center text-[8px] font-black text-white">CF</div>
                    <span className="text-[9px] font-bold text-white/80 tracking-widest uppercase">Casa Feliz</span>
                  </div>
                  <span className="text-[9px] font-black bg-red-500 text-white px-2.5 py-0.5 rounded-full">SAIA DO ALUGUEL</span>
                </div>
                <div>
                  <p className="text-green-300/60 text-[9px] uppercase tracking-widest mb-1">Goiânia · GO</p>
                  <h3 className="text-white font-black text-2xl leading-tight mb-1">SEU APÊ<br/>2 QUARTOS</h3>
                  <div className="flex gap-3 mb-3">
                    <div>
                      <p className="text-white/40 text-[8px]">ENTRADA</p>
                      <p className="text-white font-black text-base">R$ 8.000</p>
                    </div>
                    <div className="w-px bg-white/10" />
                    <div>
                      <p className="text-white/40 text-[8px]">PARCELAS</p>
                      <p className="text-white font-black text-base">R$ 680/mês</p>
                    </div>
                  </div>
                  <div className="bg-green-500 text-white text-[10px] font-bold py-2.5 rounded-xl text-center tracking-wide">Conheça as unidades →</div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Stories + Wide + Square */}
          <div className="grid grid-cols-12 gap-4">

            {/* Card 4: Stories - Investimento */}
            <div className="col-span-12 sm:col-span-4 md:col-span-3 relative rounded-2xl overflow-hidden" style={{ aspectRatio: "9/16" }}>
              <div className="absolute inset-0 bg-gradient-to-b from-[#431407] via-[#7c2d12] to-[#1c0a00]" />
              <div className="absolute bottom-[42%] left-0 right-0 flex items-end justify-center gap-1 px-6 h-[20%]">
                {[40,65,55,80,70,95,88].map((h,i)=>(
                  <div key={i} className="flex-1 rounded-t-sm" style={{ height:`${h}%`, background:`rgba(251,191,36,${0.3+i*0.1})` }} />
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[55%] bg-gradient-to-t from-[#0d0600] to-transparent" />
              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded bg-amber-500 text-[7px] font-black text-black flex items-center justify-center">IF</div>
                    <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Investe Fácil</span>
                  </div>
                  <span className="text-[8px] font-black bg-amber-400/90 text-black px-2 py-0.5 rounded-full">RENDA</span>
                </div>
                <div>
                  <p className="text-amber-400/70 text-[9px] uppercase tracking-widest mb-2">Retorno garantido</p>
                  <h3 className="text-white font-black text-2xl leading-tight mb-2">RENDA<br/>PASSIVA<br/>REAL</h3>
                  <p className="text-white/50 text-[10px] mb-2">Kitnet mobiliada no centro</p>
                  <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-3 mb-3">
                    <p className="text-amber-400 font-black text-2xl">1,2%</p>
                    <p className="text-white/50 text-[9px]">ao mês · acima da poupança</p>
                  </div>
                  <p className="text-white/40 text-[9px] mb-3">A partir de <span className="text-white font-bold">R$ 130k</span></p>
                  <div className="bg-amber-500 text-black text-[10px] font-bold py-2.5 rounded-xl text-center tracking-wide">Quero investir agora →</div>
                </div>
              </div>
            </div>

            {/* Card 5: Banner 16:9 Comercial */}
            <div className="col-span-12 sm:col-span-8 md:col-span-5 relative rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111827] to-[#0a0a0a]" />
              {/* City silhouette */}
              <div className="absolute bottom-0 left-0 right-0 h-[55%]">
                {[
                  {l:"2%",w:"5%",h:"50%"},{l:"7%",w:"3%",h:"70%"},{l:"10%",w:"9%",h:"38%"},
                  {l:"19%",w:"4%",h:"82%"},{l:"23%",w:"11%",h:"95%"},{l:"34%",w:"5%",h:"58%"},
                  {l:"39%",w:"7%",h:"72%"},{l:"46%",w:"4%",h:"48%"},{l:"50%",w:"8%",h:"78%"},
                  {l:"58%",w:"5%",h:"62%"},{l:"63%",w:"9%",h:"52%"},{l:"72%",w:"4%",h:"68%"},{l:"76%",w:"6%",h:"42%"},
                  {l:"82%",w:"8%",h:"60%"},{l:"90%",w:"5%",h:"74%"},{l:"95%",w:"4%",h:"44%"}
                ].map((b,i)=>(
                  <div key={i} className="absolute bottom-0" style={{ left:b.l, width:b.w, height:b.h, background:`rgba(${18+i*2},${25+i*2},${45+i*3},0.95)`, borderLeft:"1px solid rgba(80,100,160,0.08)" }} />
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[72%] bg-gradient-to-t from-[#020408] to-transparent" />
              <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-32 h-16 bg-blue-500/15 rounded-full blur-2xl" />
              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded bg-white/10 border border-white/20 text-[7px] font-black text-white flex items-center justify-center">FL</div>
                    <span className="text-[9px] font-bold text-white/55 tracking-widest uppercase">Faria Lima & Cia</span>
                  </div>
                  <span className="text-[9px] bg-white/8 text-white/60 border border-white/12 px-2 py-0.5 rounded-full">COMERCIAL</span>
                </div>
                <div>
                  <p className="text-blue-300/45 text-[9px] uppercase tracking-widest mb-1">Faria Lima · São Paulo</p>
                  <h3 className="text-white font-black text-xl leading-tight mb-2.5">SALA COMERCIAL<br/>PREMIUM</h3>
                  <div className="flex gap-2.5 mb-2.5">
                    <div className="bg-white/5 border border-white/8 rounded-lg px-3 py-1.5">
                      <p className="text-white/35 text-[7px] uppercase mb-0.5">Área</p>
                      <p className="text-white font-bold text-xs">40m² a 180m²</p>
                    </div>
                    <div className="bg-white/5 border border-white/8 rounded-lg px-3 py-1.5">
                      <p className="text-white/35 text-[7px] uppercase mb-0.5">Vista</p>
                      <p className="text-white font-bold text-xs">Panorâmica</p>
                    </div>
                  </div>
                  <div className="bg-white text-black text-[9px] font-bold py-2 rounded-xl text-center max-w-[170px]">Consulte disponibilidade →</div>
                </div>
              </div>
            </div>

            {/* Card 6: Beach Resort */}
            <div className="col-span-12 sm:col-span-12 md:col-span-4 relative rounded-2xl overflow-hidden" style={{ aspectRatio: "1/1" }}>
              <div className="absolute inset-0 bg-gradient-to-b from-[#0c4a6e] via-[#0e7490] to-[#155e75]" />
              <div className="absolute top-[35%] left-0 right-0 h-px bg-white/25" />
              <div className="absolute top-[24%] left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white/25 blur-lg" />
              <div className="absolute top-[24%] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white/50" />
              {/* Sun reflection strip on water */}
              <div className="absolute top-[36%] left-1/2 -translate-x-1/2 w-10 h-[12%] bg-white/8 blur-sm" />
              <div className="absolute bottom-0 left-0 right-0 h-[22%] bg-gradient-to-t from-[#92400e]/60 to-transparent" />
              {/* Beach villas */}
              <div className="absolute bottom-[20%] left-[12%] w-[18%] h-[18%] bg-white/18 border border-white/25 rounded-t-sm" />
              <div className="absolute bottom-[20%] left-[18%] w-[20%] h-[23%] bg-white/22 border border-white/25 rounded-t-sm" />
              <div className="absolute bottom-[20%] right-[15%] w-[22%] h-[20%] bg-white/18 border border-white/20 rounded-t-sm" />
              <div className="absolute bottom-0 left-0 right-0 h-[65%] bg-gradient-to-t from-[#042f2e]/92 to-transparent" />
              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-cyan-400 text-[7px] font-black text-black flex items-center justify-center">IR</div>
                    <span className="text-[9px] font-bold text-white/80 tracking-widest uppercase">Island Realty</span>
                  </div>
                  <span className="text-[9px] font-black bg-cyan-400 text-black px-2.5 py-0.5 rounded-full">RESORT</span>
                </div>
                <div>
                  <p className="text-cyan-300/55 text-[10px] uppercase tracking-widest mb-1">Porto de Galinhas · PE</p>
                  <h3 className="text-white font-black text-[22px] leading-tight mb-2">VILLAS<br/>NO PARAÍSO</h3>
                  <div className="flex gap-1.5 mb-3">
                    <span className="text-[8px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full border border-white/10">Frente ao mar</span>
                    <span className="text-[8px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full border border-white/10">Piscina privativa</span>
                  </div>
                  <p className="text-white/40 text-[10px] mb-3">A partir de <span className="text-white font-bold">R$ 850k</span></p>
                  <div className="bg-cyan-500 text-white text-[10px] font-bold py-2.5 rounded-xl text-center tracking-wide">Ver disponibilidade →</div>
                </div>
              </div>
            </div>

          </div>

          {/* Format legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white/30 text-xs">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-white/8 border border-white/15" />Post Feed (1:1)</div>
            <div className="flex items-center gap-2"><div className="w-3 h-5 rounded bg-white/8 border border-white/15" />Stories (9:16)</div>
            <div className="flex items-center gap-2"><div className="w-7 h-4 rounded bg-white/8 border border-white/15" />Banner (16:9)</div>
          </div>
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
