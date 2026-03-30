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
                  {/* Night sky – São Paulo twilight */}
                  <div className="absolute inset-0" style={{background:"linear-gradient(to bottom, #020510 0%, #050d22 40%, #080f28 60%, #05080f 100%)"}} />
                  {/* Stars */}
                  {[{t:4,l:8},{t:7,l:22},{t:3,l:35},{t:9,l:48},{t:5,l:61},{t:2,l:74},{t:8,l:87},{t:11,l:15},{t:6,l:29},{t:4,l:53},{t:10,l:68},{t:7,l:82},{t:3,l:91},{t:6,l:42},{t:12,l:77}].map((s,i)=>(
                    <div key={i} className="absolute rounded-full bg-white" style={{top:`${s.t}%`,left:`${s.l}%`,width:`${1+(i%2)}px`,height:`${1+(i%2)}px`,opacity:0.15+(i%4)*0.1}} />
                  ))}
                  {/* Horizon amber glow (city warmth) */}
                  <div className="absolute" style={{bottom:"28%",left:0,right:0,height:"100px",background:"radial-gradient(ellipse at 50% 100%, rgba(255,140,20,0.22) 0%, rgba(200,80,10,0.08) 60%, transparent 100%)"}} />
                  {/* Far buildings – small/dark */}
                  {[{l:"0%",w:"5%",h:"18%"},{l:"5%",w:"4%",h:"24%"},{l:"9%",w:"7%",h:"16%"},{l:"16%",w:"3%",h:"28%"},{l:"19%",w:"6%",h:"15%"},{l:"25%",w:"4%",h:"22%"},{l:"29%",w:"3%",h:"18%"},{l:"32%",w:"8%",h:"32%"},{l:"40%",w:"4%",h:"17%"},{l:"44%",w:"5%",h:"25%"},{l:"49%",w:"3%",h:"15%"},{l:"52%",w:"7%",h:"29%"},{l:"59%",w:"4%",h:"19%"},{l:"63%",w:"6%",h:"23%"},{l:"69%",w:"3%",h:"17%"},{l:"72%",w:"8%",h:"26%"},{l:"80%",w:"4%",h:"20%"},{l:"84%",w:"5%",h:"16%"},{l:"89%",w:"4%",h:"24%"},{l:"93%",w:"7%",h:"18%"}].map((b,i)=>(
                    <div key={i} className="absolute" style={{bottom:"29%",left:b.l,width:b.w,height:b.h,background:`rgba(${5+i%4},${10+i%5},${28+i%8},0.88)`}} />
                  ))}
                  {/* Mid-layer buildings */}
                  {[{l:"4%",w:"9%",h:"38%"},{l:"13%",w:"5%",h:"46%"},{l:"18%",w:"12%",h:"30%"},{l:"30%",w:"4%",h:"52%"},{l:"34%",w:"7%",h:"34%"},{l:"41%",w:"5%",h:"42%"},{l:"46%",w:"9%",h:"28%"},{l:"55%",w:"5%",h:"44%"},{l:"60%",w:"8%",h:"36%"},{l:"68%",w:"4%",h:"50%"},{l:"72%",w:"7%",h:"32%"},{l:"79%",w:"9%",h:"40%"},{l:"88%",w:"5%",h:"46%"},{l:"93%",w:"7%",h:"30%"}].map((b,i)=>(
                    <div key={i} className="absolute" style={{bottom:"29%",left:b.l,width:b.w,height:b.h,background:`rgba(${8+i%3},${14+i%5},${36+i%10},0.95)`,border:"1px solid rgba(60,80,160,0.06)"}} />
                  ))}
                  {/* CENTRAL TOWER — most detailed */}
                  <div className="absolute" style={{bottom:"29%",left:"37%",width:"27%",height:"65%",background:"rgba(9,17,45,0.99)",border:"1px solid rgba(80,110,200,0.14)"}}>
                    {[0,1,2,3,4,5,6,7].map(row=>[0,1,2,3].map(col=>(
                      <div key={`${row}-${col}`} className="absolute" style={{width:"16%",height:"8%",top:`${5+row*11}%`,left:`${7+col*22}%`,background:(row*4+col)%7===0?"rgba(255,225,85,0.88)":(row*4+col)%7===1?"rgba(255,245,160,0.55)":(row*4+col)%7===2?"rgba(180,220,255,0.3)":(row*4+col)%7===3?"rgba(255,200,60,0.45)":"rgba(8,16,55,0.5)",borderRadius:"1px"}} />
                    )))}
                  </div>
                  {/* Left secondary tower */}
                  <div className="absolute" style={{bottom:"29%",left:"9%",width:"22%",height:"48%",background:"rgba(7,13,38,0.98)",border:"1px solid rgba(60,80,140,0.08)"}}>
                    {[0,1,2,3,4].map(row=>[0,1,2].map(col=>(
                      <div key={`${row}-${col}`} className="absolute" style={{width:"22%",height:"10%",top:`${10+row*17}%`,left:`${10+col*30}%`,background:(row+col)%4===0?"rgba(255,210,55,0.65)":(row+col)%4===1?"rgba(200,230,255,0.2)":"rgba(6,13,45,0.45)",borderRadius:"1px"}} />
                    )))}
                  </div>
                  {/* Right sidebuilding */}
                  <div className="absolute" style={{bottom:"29%",right:"4%",width:"19%",height:"54%",background:"rgba(8,15,40,0.98)",border:"1px solid rgba(60,80,140,0.07)"}}>
                    {[0,1,2,3,4,5].map(row=>[0,1].map(col=>(
                      <div key={`${row}-${col}`} className="absolute" style={{width:"28%",height:"9%",top:`${8+row*15}%`,left:`${14+col*46}%`,background:col===0?"rgba(255,215,55,0.6)":"rgba(10,22,70,0.4)",borderRadius:"1px"}} />
                    )))}
                  </div>
                  {/* Ground glow line */}
                  <div className="absolute" style={{bottom:"28.5%",left:0,right:0,height:"8px",background:"linear-gradient(to top, rgba(255,100,0,0.1), transparent)"}} />
                  {/* Bottom gradient overlay */}
                  <div className="absolute bottom-0 left-0 right-0" style={{height:"38%",background:"linear-gradient(to top, rgba(4,7,16,0.99) 0%, rgba(4,7,16,0.72) 55%, transparent 100%)"}} />
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
            <div className="card-hover relative rounded-2xl overflow-hidden" style={{ aspectRatio: "1/1" }}>
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
            <div className="card-hover relative rounded-2xl overflow-hidden" style={{ aspectRatio: "1/1" }}>
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
            <div className="col-span-12 sm:col-span-4 md:col-span-3 card-hover relative rounded-2xl overflow-hidden" style={{ aspectRatio: "9/16" }}>
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
            <div className="col-span-12 sm:col-span-8 md:col-span-5 card-hover relative rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
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
            <div className="col-span-12 sm:col-span-12 md:col-span-4 card-hover relative rounded-2xl overflow-hidden" style={{ aspectRatio: "1/1" }}>
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
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-black tracking-tighter mb-4" style={{fontSize:"clamp(2rem,4.5vw,3.2rem)"}}>Planos simples</h2>
            <p className="text-white/35 text-lg">Comece grátis. Escale quando precisar.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {name:"Free",  price:"Grátis", period:"",     desc:"Para começar a explorar",     features:["5 criativos/mês","3 imóveis","Templates básicos"],                                                              cta:"Começar grátis", highlighted:false},
              {name:"Basic", price:"R$19",   period:"/mês", desc:"Para corretores individuais", features:["30 criativos/mês","20 imóveis","Todos os templates","Download HD","Histórico completo"],                       cta:"Assinar Basic",  highlighted:true},
              {name:"Pro",   price:"R$49",   period:"/mês", desc:"Para equipes e imobiliárias", features:["Criativos ilimitados","Imóveis ilimitados","Variações automáticas","IA prioritária","Envio por WhatsApp"], cta:"Assinar Pro",    highlighted:false},
            ].map((plan) => (
              <div key={plan.name} className="relative p-7 rounded-2xl border transition-all" style={plan.highlighted ? {background:"rgba(37,99,235,0.07)",borderColor:"rgba(37,99,235,0.35)",boxShadow:"0 20px 60px rgba(37,99,235,0.12)"} : {background:"rgba(255,255,255,0.022)",borderColor:"rgba(255,255,255,0.06)"}}>
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-black text-white px-3 py-1 rounded-full shadow-lg" style={{background:"linear-gradient(135deg,#2563eb,#1d4ed8)"}}>
                    Mais popular
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-xs font-black uppercase tracking-widest text-white/35 mb-0.5">{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-white/30 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-white/30 text-xs mt-1">{plan.desc}</p>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{color: plan.highlighted ? "#60a5fa" : "rgba(255,255,255,0.25)"}} />
                      <span className="text-white/60">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block text-center py-3.5 rounded-xl font-black text-sm transition-all hover:scale-105" style={plan.highlighted ? {background:"linear-gradient(135deg,#2563eb,#1d4ed8)",color:"#fff",boxShadow:"0 8px 24px rgba(37,99,235,0.35)"} : {background:"rgba(255,255,255,0.06)",color:"#fff"}}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
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
