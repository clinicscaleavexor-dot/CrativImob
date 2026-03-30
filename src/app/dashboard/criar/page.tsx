"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Wand2,
  Loader2,
  CheckCircle2,
  Building2,
  LayoutGrid,
  Pencil,
  Eye,
  Download,
  Share2,
  BedDouble,
  Bath,
  Maximize2,
  MapPin,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import type { Tables } from "@/types/database";

type Property = Tables<"properties">;
type Template = Tables<"templates">;

const FORMATS = [
  {
    id: "1080x1080",
    label: "Post",
    sublabel: "1080 × 1080",
    icon: "⬛",
    ratio: "aspect-square",
  },
  {
    id: "1080x1920",
    label: "Stories",
    sublabel: "1080 × 1920",
    icon: "📱",
    ratio: "aspect-[9/16]",
  },
  {
    id: "1200x628",
    label: "Tráfego",
    sublabel: "1200 × 628",
    icon: "🖥️",
    ratio: "aspect-[1200/628]",
  },
];

const CREATIVE_TYPES = [
  { id: "post", label: "Feed" },
  { id: "story", label: "Story" },
  { id: "trafego_pago", label: "Tráfego Pago" },
];

const STEPS = [
  { id: 1, label: "Imóvel", icon: Building2 },
  { id: 2, label: "Template", icon: LayoutGrid },
  { id: 3, label: "Texto", icon: Pencil },
  { id: 4, label: "Gerar", icon: Eye },
];

function CriarPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedPropertyId = searchParams.get("property");

  const [step, setStep] = useState(1);
  const [properties, setProperties] = useState<Property[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Selections
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedFormat, setSelectedFormat] = useState("1080x1080");
  const [selectedType, setSelectedType] = useState("post");

  // Copy
  const [headline, setHeadline] = useState("");
  const [copyText, setCopyText] = useState("");
  const [ctaText, setCtaText] = useState("Saiba mais");

  // Generation
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [propRes, tplRes] = await Promise.all([
      supabase
        .from("properties")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("templates")
        .select("*")
        .eq("is_active", true)
        .order("name"),
    ]);

    const props = (propRes.data ?? []) as Property[];
    const tmpls = (tplRes.data ?? []) as Template[];

    setProperties(props);
    setTemplates(tmpls);

    if (preselectedPropertyId) {
      const found = props.find((p) => p.id === preselectedPropertyId);
      if (found) {
        setSelectedProperty(found);
        setStep(2);
      }
    }

    setLoadingData(false);
  }, [supabase, preselectedPropertyId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-fill copy when property/template is selected
  useEffect(() => {
    if (selectedProperty && !headline) {
      const typeLabel: Record<string, string> = {
        casa: "Casa",
        apartamento: "Apartamento",
        lote: "Lote",
        comercial: "Comercial",
        cobertura: "Cobertura",
        chacara: "Chácara",
      };
      const label = typeLabel[selectedProperty.type] ?? "Imóvel";
      const price = formatCurrency(selectedProperty.price_cents);
      setHeadline(`${label} à venda — ${price}`);
      const extras = [
        selectedProperty.bedrooms ? `${selectedProperty.bedrooms} quartos` : "",
        selectedProperty.area_sqm ? `${selectedProperty.area_sqm}m²` : "",
        selectedProperty.city ?? "",
      ].filter(Boolean).join(" · ");
      if (extras) setCopyText(extras);
    }
  }, [selectedProperty, headline]);

  async function handleGenerate() {
    if (!selectedProperty || !selectedTemplate) return;
    setGenerating(true);
    setGenError(null);

    try {
      const res = await fetch("/api/generate-creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: selectedProperty.id,
          template_id: selectedTemplate.id,
          format: selectedFormat,
          creative_type: selectedType,
          headline,
          copy_text: copyText,
          cta_text: ctaText,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        creative_id?: string;
        image_url?: string | null;
        status?: string;
        error?: string;
      };

      if (!res.ok) {
        setGenError(data.error ?? "Erro ao gerar criativo");
        return;
      }

      setGeneratedId(data.creative_id ?? null);
      setGeneratedUrl(data.image_url ?? null);
      setStep(4);
    } catch {
      setGenError("Erro de conexão. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  }

  const canNext =
    (step === 1 && selectedProperty !== null) ||
    (step === 2 && selectedTemplate !== null) ||
    (step === 3 && headline.length > 0);

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 text-white/40 hover:text-white hover:bg-white/8 rounded-xl transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">Criar Criativo</h1>
          <p className="text-white/40 text-sm">Gere imagens profissionais com IA</p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => isDone && setStep(s.id)}
                disabled={!isDone}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                    : isDone
                    ? "text-white/60 hover:text-white hover:bg-white/8 cursor-pointer"
                    : "text-white/25 cursor-default"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-brand-400" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.id}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-white/20 mx-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">

        {/* Step 1: Select Property */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white mb-4">Selecione o imóvel</h2>
            {properties.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/50 mb-4">Nenhum imóvel cadastrado</p>
                <a
                  href="/dashboard/imoveis"
                  className="inline-flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-600 transition-all"
                >
                  Cadastrar imóvel
                </a>
              </div>
            ) : (
              <div className="grid gap-3">
                {properties.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProperty(p)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedProperty?.id === p.id
                        ? "border-brand-500/60 bg-brand-500/10"
                        : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-brand-400 bg-brand-500/15 px-2 py-0.5 rounded-full capitalize">
                            {p.type}
                          </span>
                        </div>
                        <p className="text-white font-semibold">{p.title}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-white/40 text-xs">
                          {p.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {p.city}
                            </span>
                          )}
                          {p.bedrooms != null && p.bedrooms > 0 && (
                            <span className="flex items-center gap-1">
                              <BedDouble className="w-3 h-3" /> {p.bedrooms}
                            </span>
                          )}
                          {p.bathrooms != null && p.bathrooms > 0 && (
                            <span className="flex items-center gap-1">
                              <Bath className="w-3 h-3" /> {p.bathrooms}
                            </span>
                          )}
                          {p.area_sqm && (
                            <span className="flex items-center gap-1">
                              <Maximize2 className="w-3 h-3" /> {p.area_sqm}m²
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-white font-bold text-lg whitespace-nowrap">
                        {formatCurrency(p.price_cents)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Template + Format */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Template e Formato</h2>

            {/* Formato */}
            <div>
              <p className="text-sm text-white/60 font-medium mb-3">Formato</p>
              <div className="grid grid-cols-3 gap-3">
                {FORMATS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFormat(f.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      selectedFormat === f.id
                        ? "border-brand-500/60 bg-brand-500/10"
                        : "border-white/8 bg-white/3 hover:border-white/20"
                    }`}
                  >
                    <span className="text-2xl">{f.icon}</span>
                    <div className="text-center">
                      <p className="text-white font-semibold text-sm">{f.label}</p>
                      <p className="text-white/40 text-xs">{f.sublabel}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo */}
            <div>
              <p className="text-sm text-white/60 font-medium mb-3">Tipo de criativo</p>
              <div className="flex gap-2">
                {CREATIVE_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                      selectedType === t.id
                        ? "border-brand-500/60 bg-brand-500/10 text-brand-400"
                        : "border-white/8 text-white/50 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates */}
            <div>
              <p className="text-sm text-white/60 font-medium mb-3">Estilo visual</p>
              {templates.length === 0 ? (
                <p className="text-white/40 text-sm">Nenhum template disponível</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {templates.map((t) => {
                    const config = (t.config as Record<string, unknown>) ?? {};
                    const colors = (config.colors as string[]) ?? ["#2563eb", "#0f172a"];
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t)}
                        className={`relative rounded-xl overflow-hidden border transition-all ${
                          selectedTemplate?.id === t.id
                            ? "border-brand-500 ring-2 ring-brand-500/30"
                            : "border-white/8 hover:border-white/25"
                        }`}
                      >
                        {/* Preview visual */}
                        <div
                          className="h-28 flex flex-col items-center justify-center px-3 py-3 gap-1"
                          style={{
                            background: `linear-gradient(135deg, ${colors[0]}, ${colors[1] ?? colors[0]})`,
                          }}
                        >
                          <div className="w-3/4 h-2 rounded-full bg-white/40" />
                          <div className="w-1/2 h-1.5 rounded-full bg-white/25" />
                          <div className="w-5/6 h-1 rounded-full bg-white/15 mt-1" />
                        </div>
                        <div className="bg-[#0d1520] px-3 py-2">
                          <p className="text-white text-xs font-semibold truncate">{t.name}</p>
                          <p className="text-white/40 text-xs capitalize">{t.category}</p>
                        </div>
                        {selectedTemplate?.id === t.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Copy */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-bold text-white">Personalize o texto</h2>
              <span className="text-xs bg-white/5 text-white/40 px-2 py-1 rounded-lg">
                Gerado automaticamente — edite como quiser
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Headline <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={80}
                placeholder="Ex: Apartamento 2 quartos em São Paulo — R$ 350.000"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all"
              />
              <p className="text-white/30 text-xs mt-1 text-right">{headline.length}/80</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Descrição</label>
              <textarea
                value={copyText}
                onChange={(e) => setCopyText(e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="Ex: 3 quartos · 80m² · Jardim Paulista · Documentação ok"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all resize-none"
              />
              <p className="text-white/30 text-xs mt-1 text-right">{copyText.length}/200</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Chamada para ação (CTA)</label>
              <div className="flex gap-2 flex-wrap">
                {["Saiba mais", "Entre em contato", "Agende uma visita", "Investir agora"].map((cta) => (
                  <button
                    key={cta}
                    onClick={() => setCtaText(cta)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      ctaText === cta
                        ? "bg-brand-500/20 border-brand-500/50 text-brand-400"
                        : "bg-white/5 border-white/10 text-white/50 hover:border-white/25"
                    }`}
                  >
                    {cta}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Ou escreva o seu..."
                className="w-full mt-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all"
              />
            </div>

            {/* Preview summary */}
            {selectedProperty && selectedTemplate && (
              <div className="bg-white/5 border border-white/8 rounded-xl p-4 text-sm">
                <p className="text-white/40 text-xs font-medium mb-2 uppercase tracking-wide">Resumo</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-white/50">Imóvel</span>
                    <span className="text-white truncate max-w-[60%] text-right">{selectedProperty.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Template</span>
                    <span className="text-white">{selectedTemplate.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Formato</span>
                    <span className="text-white">{FORMATS.find((f) => f.id === selectedFormat)?.label} — {selectedFormat}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Result */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">
              {generating ? "Gerando criativo..." : generatedUrl ? "Criativo gerado!" : "Criativo salvo"}
            </h2>

            {generating ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-brand-500/20" />
                  <div className="absolute inset-0 rounded-full border-t-2 border-brand-500 animate-spin" />
                  <Wand2 className="absolute inset-0 m-auto w-6 h-6 text-brand-400" />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold">Processando com IA...</p>
                  <p className="text-white/40 text-sm mt-1">Isso pode levar até 30 segundos</p>
                </div>
              </div>
            ) : genError ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-center">
                <p className="text-red-400 font-medium mb-1">Erro na geração</p>
                <p className="text-red-400/70 text-sm">{genError}</p>
                <button
                  onClick={() => { setStep(3); setGenError(null); }}
                  className="mt-4 text-sm text-white/50 hover:text-white underline"
                >
                  Tentar novamente
                </button>
              </div>
            ) : generatedUrl ? (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/30">
                  <Image
                    src={generatedUrl}
                    alt="Criativo gerado"
                    width={800}
                    height={800}
                    className="w-full object-contain max-h-[500px]"
                    unoptimized={generatedUrl.startsWith("data:")}
                  />
                </div>
                <div className="flex gap-3">
                  <a
                    href={generatedUrl}
                    download={`criativo-${generatedId}.png`}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl font-semibold text-sm transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Baixar
                  </a>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: "Criativo imobiliário", url: generatedUrl });
                      }
                    }}
                    className="flex items-center gap-2 bg-white/8 hover:bg-white/15 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    Compartilhar
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/8 rounded-xl p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-brand-500/15 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-400" />
                </div>
                <p className="text-white font-semibold mb-1">Criativo salvo</p>
                <p className="text-white/40 text-sm mb-4">
                  A configuração de IA não está definida ainda. O criativo foi registrado.
                </p>
                <a
                  href="/dashboard/criativos"
                  className="text-brand-400 hover:text-brand-300 text-sm underline"
                >
                  Ver todos os criativos →
                </a>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedProperty(null);
                  setSelectedTemplate(null);
                  setSelectedFormat("1080x1080");
                  setSelectedType("post");
                  setHeadline("");
                  setCopyText("");
                  setCtaText("Saiba mais");
                  setGeneratedUrl(null);
                  setGeneratedId(null);
                }}
                className="flex-1 py-2.5 text-sm text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              >
                Criar outro
              </button>
              <a
                href="/dashboard/criativos"
                className="flex-1 py-2.5 text-sm text-center font-semibold text-white bg-white/8 hover:bg-white/15 rounded-xl transition-all"
              >
                Ver criativos
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {step < 4 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => step > 1 && setStep((s) => s - 1)}
            disabled={step === 1}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white disabled:opacity-0 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!canNext || generating}
              className="flex items-center gap-2 bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-brand-500/20"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              {generating ? "Gerando..." : "Gerar com IA"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function CriarPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
      </div>
    }>
      <CriarPageContent />
    </Suspense>
  );
}
