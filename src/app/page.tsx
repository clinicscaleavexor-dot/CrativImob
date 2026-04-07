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
import LandingPlans from "@/components/landing/LandingPlans";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#06080e] text-white overflow-x-hidden">
      <style>{`
        @keyframes float {
          0%,100%{transform:translateY(0px) rotate(0.3deg)}
          50%{transform:translateY(-10px) rotate(-0.3deg)}
        }
        @keyframes grain {
          0%,100%{transform:translate(0,0)}
          10%{transform:translate(-1.5%,-1%)}
          20%{transform:translate(1%,0)}
          30%{transform:translate(0,1.5%)}
          40%{transform:translate(-1%,1%)}
          50%{transform:translate(1.5%,-1%)}
          60%{transform:translate(-1%,0)}
          70%{transform:translate(1%,1.5%)}
          80%{transform:translate(-1%,-1%)}
          90%{transform:translate(0,-1.5%)}
        }
        @keyframes fadeUp {
          from{opacity:0;transform:translateY(18px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes ticker {
          0%{transform:translateX(0)}
          100%{transform:translateX(-50%)}
        }
        .hero-card{animation:float 7s ease-in-out infinite}
        .grain::after{
          content:'';position:absolute;inset:-30%;width:160%;height:160%;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E");
          background-size:200px 200px;
          opacity:0.35;
          animation:grain 0.65s steps(1) infinite;
          pointer-events:none;z-index:20;border-radius:inherit;
          mix-blend-mode:overlay;
        }
        .a1{animation:fadeUp 0.7s 0.1s ease both}
        .a2{animation:fadeUp 0.7s 0.25s ease both}
        .a3{animation:fadeUp 0.7s 0.4s ease both}
        .a4{animation:fadeUp 0.7s 0.55s ease both}
        .ticker-wrap{animation:ticker 30s linear infinite}
        .card-hover{transition:transform 0.3s ease,box-shadow 0.3s ease}
        .card-hover:hover{transform:translateY(-4px) scale(1.01);box-shadow:0 24px 60px rgba(0,0,0,0.6)}
      `}</style>
      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-6 lg:px-10 py-4 bg-[#06080e]/88 backdrop-blur-xl border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30" style={{background:"linear-gradient(135deg,#2563eb,#1d4ed8)"}}>
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-[17px] tracking-tight">Criativ<span className="text-blue-400">Imob</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/45">
            <a href="#exemplos" className="hover:text-white transition-colors">Exemplos</a>
            <a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a>
            <a href="#planos" className="hover:text-white transition-colors">Planos</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm text-white/50 hover:text-white transition-colors px-4 py-2">Entrar</Link>
            <Link href="/register" className="text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-all hover:scale-105" style={{background:"linear-gradient(135deg,#2563eb,#1d4ed8)",boxShadow:"0 4px 20px rgba(37,99,235,0.35)"}}>
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Ambient mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{background:"linear-gradient(to bottom, #060c1e 0%, #06080e 100%)"}} />
          <div className="absolute" style={{top:"15%",left:"8%",width:"520px",height:"520px",background:"radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)",borderRadius:"50%",filter:"blur(8px)"}} />
          <div className="absolute" style={{top:"40%",right:"2%",width:"380px",height:"380px",background:"radial-gradient(circle, rgba(99,57,235,0.07) 0%, transparent 70%)",borderRadius:"50%",filter:"blur(10px)"}} />
          <div className="absolute" style={{bottom:"10%",left:"30%",width:"300px",height:"200px",background:"radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)",filter:"blur(6px)"}} />
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-[0.025]" style={{backgroundImage:"linear-gradient(to right, rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,1) 1px, transparent 1px)",backgroundSize:"80px 80px"}} />
          {/* Diagonal accent line */}
          <div className="absolute" style={{top:"0",right:"38%",width:"1px",height:"100%",background:"linear-gradient(to bottom, transparent, rgba(37,99,235,0.15) 40%, transparent)",transform:"rotate(8deg)",transformOrigin:"top center"}} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 w-full py-20 lg:py-28">
          <div className="grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] gap-10 lg:gap-16 items-center">

            {/* ── Left: Copy ── */}
            <div className="order-2 lg:order-1">
              <div className="a1 inline-flex items-center gap-2 text-blue-400 text-xs font-black px-4 py-2 rounded-full mb-8 uppercase tracking-[0.2em] border border-blue-500/20" style={{background:"rgba(37,99,235,0.08)"}}>
                <Sparkles className="w-3 h-3" />
                IA imobiliária brasileira
              </div>

              <h1 className="a2 font-black tracking-tighter leading-[1.0] mb-6" style={{fontSize:"clamp(2.6rem,5.5vw,4.8rem)"}}>
                Criativos que
                <br />
                <span style={{backgroundImage:"linear-gradient(90deg,#60a5fa,#93c5fd,#38bdf8)",WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
                  vendem imóveis
                </span>
                <br />
                — em segundos.
              </h1>

              <p className="a3 text-lg text-white/45 leading-relaxed mb-10 max-w-[480px]">
                Envie a foto, preencha os dados — nossa IA gera posts para Instagram,
                Stories e tráfego pago.{" "}
                <span className="text-white/70 font-semibold">Sem designer. Sem espera.</span>
              </p>

              {/* Stats row */}
              <div className="a3 flex gap-7 mb-10">
                {[["10k+","criativos/mês"],["500+","corretores"],["4.9★","avaliação"]].map(([n,l])=>(
                  <div key={l}>
                    <p className="text-2xl font-black text-white">{n}</p>
                    <p className="text-xs text-white/30 mt-0.5">{l}</p>
                  </div>
                ))}
              </div>

              <div className="a4 flex flex-col sm:flex-row gap-3 items-start">
                <Link href="/register" className="group inline-flex items-center gap-2.5 text-white font-black px-8 py-4 rounded-2xl transition-all hover:scale-105" style={{background:"linear-gradient(135deg,#2563eb,#1d4ed8)",boxShadow:"0 8px 32px rgba(37,99,235,0.4)"}}>
                  Criar meu primeiro criativo
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-white/25 text-sm flex items-center py-4 sm:py-0">
                  5 criativos grátis · Sem cartão
                </p>
              </div>
            </div>

            {/* ── Right: Flagship creative card ── */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative">
                {/* Floating indicator */}
                <div className="absolute -top-5 -left-3 z-30 rounded-2xl px-4 py-2.5 shadow-2xl" style={{background:"rgba(8,12,28,0.95)",border:"1px solid rgba(37,99,235,0.25)"}}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" style={{boxShadow:"0 0 6px rgba(74,222,128,0.8)",animation:"grain 0.65s steps(1) infinite"}} />
                    <span className="text-xs text-white/65 font-medium">Gerado por IA agora há pouco</span>
                  </div>
                  <p className="text-[10px] text-white/30 mt-0.5">Tempo de geração: 2,3s</p>
                </div>

                {/* The hero creative card */}
                <div className="hero-card grain relative rounded-3xl overflow-hidden shadow-2xl" style={{width:"clamp(300px,40vw,440px)",aspectRatio:"1/1",boxShadow:"0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)"}}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{background:"linear-gradient(to bottom, rgba(2,5,16,0.25) 0%, rgba(2,5,16,0.1) 35%, rgba(2,5,16,0.55) 60%, rgba(2,5,16,0.97) 100%)"}} />
                  {/* AD CONTENT */}
                  <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-1.5 rounded-lg px-2 py-1 border border-white/10" style={{background:"rgba(0,0,0,0.45)",backdropFilter:"blur(8px)"}}>
                        <div className="w-4 h-4 rounded flex items-center justify-center text-[6px] font-black text-white" style={{background:"linear-gradient(135deg,#2563eb,#1d4ed8)"}}>VR</div>
                        <span className="text-[8px] font-bold text-white/65 tracking-widest uppercase">Vidal Realty</span>
                      </div>
                      <span className="text-[8px] font-black text-black px-2.5 py-0.5 rounded-full shadow-lg" style={{background:"#fbbf24"}}>LANÇAMENTO</span>
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-1 mb-2.5">
                        {["3 suítes","Rooftop","Vaga dupla"].map(t=>(
                          <span key={t} className="text-[7px] text-white/40 border border-white/10 px-2 py-0.5 rounded-full" style={{background:"rgba(255,255,255,0.06)"}}>{t}</span>
                        ))}
                      </div>
                      <p className="text-[8px] uppercase tracking-[0.25em] mb-0.5" style={{color:"rgba(147,197,253,0.5)"}}>Jardins · São Paulo · SP</p>
                      <h3 className="font-black leading-tight mb-1.5" style={{fontSize:"clamp(18px,4vw,26px)"}}>SKY<br/>RESIDENCES</h3>
                      <p className="text-[10px] text-white/35 mb-3">A partir de <span className="text-white/80 font-black text-sm">R$ 2,4M</span></p>
                      <div className="text-[9px] font-black py-2.5 rounded-xl text-center tracking-widest uppercase" style={{background:"rgba(37,99,235,0.92)"}}>
                        Agendar visita exclusiva →
                      </div>
                    </div>
                  </div>
                </div>

                {/* Format pills pinned to side */}
                <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex-col gap-2.5 hidden xl:flex">
                  {[{l:"Feed 1:1",c:"#2563eb"},{l:"Stories",c:"#7c3aed"},{l:"Banner",c:"#059669"}].map((c,i)=>(
                    <div key={i} className="w-12 h-12 rounded-xl flex items-center justify-center text-center" style={{border:`1px solid ${c.c}40`,background:`${c.c}14`}}>
                      <p className="text-[8px] font-bold text-white/50 leading-tight">{c.l}</p>
                    </div>
                  ))}
                </div>

                {/* Glow under card */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-56 h-14 rounded-full" style={{background:"rgba(37,99,235,0.22)",filter:"blur(24px)"}} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS TICKER ── */}
      <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(255,255,255,0.015)"}}>
        <div className="max-w-5xl mx-auto px-6 py-7">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[["10.483","criativos gerados este mês"],["1.247","corretores ativos"],["98%","taxa de satisfação"]].map(([n,l])=>(
              <div key={l}>
                <p className="text-2xl md:text-3xl font-black" style={{color:"#60a5fa"}}>{n}</p>
                <p className="text-xs text-white/25 mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── EXEMPLOS ── */}
      <section id="exemplos" className="py-24 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="block text-xs font-black uppercase tracking-[0.3em] mb-4" style={{color:"#60a5fa"}}>Galeria de exemplos</span>
              <h2 className="font-black tracking-tighter leading-tight" style={{fontSize:"clamp(2rem,4.5vw,3.5rem)"}}>
                Criativos gerados<br />
                <span className="text-white/30">pela nossa IA</span>
              </h2>
            </div>
            <p className="text-white/35 text-sm max-w-xs leading-relaxed">
              Cada peça foi criada em menos de 3 segundos a partir de dados e fotos reais de imóveis.
            </p>
          </div>

          {/* Row 1: 3 square cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">

            {/* Card 1: Luxury Lançamento */}
            <div className="card-hover relative rounded-2xl overflow-hidden" style={{ aspectRatio: "1/1" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{background:"linear-gradient(to bottom, rgba(4,8,20,0.3) 0%, rgba(4,8,20,0.15) 30%, rgba(4,8,20,0.7) 60%, rgba(4,8,20,0.97) 100%)"}} />
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
            <div className="card-hover relative rounded-2xl overflow-hidden" style={{ aspectRatio: "1/1" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{background:"linear-gradient(to bottom, rgba(5,20,30,0.2) 0%, rgba(5,20,30,0.1) 25%, rgba(15,10,5,0.65) 60%, rgba(15,10,5,0.97) 100%)"}} />
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
            <div className="card-hover relative rounded-2xl overflow-hidden" style={{ aspectRatio: "1/1" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{background:"linear-gradient(to bottom, rgba(2,15,6,0.25) 0%, rgba(2,15,6,0.1) 25%, rgba(2,15,6,0.7) 60%, rgba(2,15,6,0.97) 100%)"}} />
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
            <div className="col-span-12 sm:col-span-4 md:col-span-3 card-hover relative rounded-2xl overflow-hidden" style={{ aspectRatio: "9/16" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{background:"linear-gradient(to bottom, rgba(30,10,0,0.3) 0%, rgba(30,10,0,0.15) 30%, rgba(10,5,0,0.75) 60%, rgba(10,5,0,0.97) 100%)"}} />
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
            <div className="col-span-12 sm:col-span-8 md:col-span-5 card-hover relative rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{background:"linear-gradient(to bottom, rgba(2,4,8,0.35) 0%, rgba(2,4,8,0.15) 25%, rgba(2,4,8,0.7) 60%, rgba(2,4,8,0.97) 100%)"}} />
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
            <div className="col-span-12 sm:col-span-12 md:col-span-4 card-hover relative rounded-2xl overflow-hidden" style={{ aspectRatio: "1/1" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{background:"linear-gradient(to bottom, rgba(4,15,14,0.2) 0%, rgba(4,15,14,0.1) 25%, rgba(4,15,14,0.65) 60%, rgba(4,15,14,0.97) 100%)"}} />
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

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0" style={{background:"rgba(255,255,255,0.012)",borderTop:"1px solid rgba(255,255,255,0.05)",borderBottom:"1px solid rgba(255,255,255,0.05)"}} />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-black tracking-tighter mb-4" style={{fontSize:"clamp(2rem,4.5vw,3.2rem)"}}>
              3 passos. Menos de 2 minutos.
            </h2>
            <p className="text-white/35 text-lg">Do imóvel ao criativo publicado.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-[25%] right-[25%] h-px" style={{background:"linear-gradient(to right, transparent, rgba(37,99,235,0.4), transparent)"}} />

            {[
              {step:"01", icon: Home,     title:"Preencha os dados",   desc:"Tipo, preço, localização, quartos, destaques. Upload das fotos do imóvel."},
              {step:"02", icon: Sparkles, title:"A IA trabalha",        desc:"Nossa IA melhora imagens, escolhe o layout ideal e gera os textos automaticamente."},
              {step:"03", icon: Share2,   title:"Baixe e publique",     desc:"Criativo pronto em HD. Baixe e publique no Instagram, Stories ou WhatsApp."},
            ].map((item) => (
              <div key={item.step} className="relative p-8 rounded-2xl border transition-colors group" style={{background:"rgba(255,255,255,0.022)",borderColor:"rgba(255,255,255,0.06)"}}>
                <div className="absolute top-5 right-5 font-black select-none leading-none" style={{fontSize:"72px",color:"rgba(255,255,255,0.04)"}}>{item.step}</div>
                <div className="w-12 h-12 rounded-2xl border flex items-center justify-center mb-6 transition-colors group-hover:border-blue-500/30" style={{background:"rgba(37,99,235,0.08)",borderColor:"rgba(37,99,235,0.2)"}}>
                  <item.icon className="w-5 h-5" style={{color:"#60a5fa"}} />
                </div>
                <h3 className="text-lg font-black mb-3">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-black tracking-tighter mb-4" style={{fontSize:"clamp(2rem,4.5vw,3.2rem)"}}>
              Tudo que você precisa
            </h2>
            <p className="text-white/35">Tecnologia de ponta, uso simples.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {icon:ImageIcon, title:"Melhoria automática de imagens", desc:"A IA aprimora iluminação, cores e qualidade das fotos antes de usar no criativo."},
              {icon:Zap,        title:"Copy gerada por IA",             desc:"Headline, descrição e CTA criados automaticamente com base no imóvel e público-alvo."},
              {icon:Star,       title:"Templates por segmento",         desc:"Templates para luxo, popular, investimento e lançamento — cada um com visual adequado."},
              {icon:Share2,     title:"Multi-formato simultâneo",       desc:"Post 1:1, Stories 9:16 e banner para tráfego pago — todos de uma só vez."},
            ].map((feat) => (
              <div key={feat.title} className="flex gap-4 p-6 rounded-2xl border transition-all group" style={{background:"rgba(255,255,255,0.022)",borderColor:"rgba(255,255,255,0.06)"}}>
                <div className="flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center transition-colors group-hover:border-blue-500/30" style={{background:"rgba(37,99,235,0.08)",borderColor:"rgba(37,99,235,0.18)"}}>
                  <feat.icon className="w-5 h-5" style={{color:"#60a5fa"}} />
                </div>
                <div>
                  <h3 className="font-black mb-1.5">{feat.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0" style={{background:"rgba(255,255,255,0.012)",borderTop:"1px solid rgba(255,255,255,0.05)",borderBottom:"1px solid rgba(255,255,255,0.05)"}} />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-black tracking-tighter mb-4" style={{fontSize:"clamp(2rem,4.5vw,3.2rem)"}}>Planos simples</h2>
            <p className="text-white/35 text-lg">Comece grátis. Escale quando precisar.</p>
          </div>
          <LandingPlans />
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-28 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{width:"650px",height:"300px",background:"radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%)"}} />
          <div className="absolute inset-0 opacity-[0.025]" style={{backgroundImage:"linear-gradient(to right, rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,1) 1px, transparent 1px)",backgroundSize:"80px 80px"}} />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <h2 className="font-black tracking-tighter mb-6" style={{fontSize:"clamp(2.2rem,5vw,4rem)"}}>
            Pronto para criar<br />
            <span style={{backgroundImage:"linear-gradient(90deg,#60a5fa,#93c5fd,#38bdf8)",WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
              seu primeiro criativo?
            </span>
          </h2>
          <p className="text-white/40 text-lg mb-10">Comece grátis agora. 5 criativos incluídos. Sem cartão.</p>
          <Link href="/register" className="inline-flex items-center gap-3 font-black text-lg text-white px-10 py-5 rounded-2xl transition-all hover:scale-105" style={{background:"linear-gradient(135deg,#2563eb,#1d4ed8)",boxShadow:"0 12px 40px rgba(37,99,235,0.45)"}}>
            Criar criativo agora
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-10" style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{background:"linear-gradient(135deg,#2563eb,#1d4ed8)"}}>
              <Home className="w-3 h-3 text-white" />
            </div>
            <span className="font-black text-sm">Criativ<span style={{color:"#60a5fa"}}>Imob</span></span>
          </Link>
          <div className="flex gap-6 text-xs text-white/25">
            <a href="#planos" className="hover:text-white/50 transition-colors">Planos</a>
            <a href="#exemplos" className="hover:text-white/50 transition-colors">Exemplos</a>
            <Link href="/login" className="hover:text-white/50 transition-colors">Entrar</Link>
          </div>
          <p className="text-white/20 text-xs">© {new Date().getFullYear()} CriativImob</p>
        </div>
      </footer>
    </div>
  );
}
