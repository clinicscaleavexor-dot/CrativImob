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
  Sparkles,
  Copy,
  Check,
  Upload,
  ImageIcon,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import type { Tables } from "@/types/database";

type Property = Tables<"properties">;

interface GenerateCreativeResponse {
  success?: boolean;
  creative_ids?: string[];
  image_urls?: (string | null)[];
  generated_copy?: string | null;
  status?: string;
  error?: string;
}

const FORMATS = [
  {
    id: "1080x1080",
    label: "Post",
    sublabel: "1080 x 1080",
    icon: "squares",
    ratio: "aspect-square",
  },
  {
    id: "1080x1920",
    label: "Stories",
    sublabel: "1080 x 1920",
    icon: "mobile",
    ratio: "aspect-[9/16]",
  },
  {
    id: "1200x628",
    label: "Trafego",
    sublabel: "1200 x 628",
    icon: "desktop",
    ratio: "aspect-[1200/628]",
  },
];

const CREATIVE_TYPES = [
  { id: "post", label: "Feed" },
  { id: "story", label: "Story" },
  { id: "trafego_pago", label: "Trafego Pago" },
];

const STEPS = [
  { id: 1, label: "Imagem", icon: ImageIcon },
  { id: 2, label: "Formato", icon: LayoutGrid },
  { id: 3, label: "Prompt", icon: Sparkles },
  { id: 4, label: "Resultado", icon: Eye },
];

function CriarPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedPropertyId = searchParams.get("property");

  const [step, setStep] = useState(1);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Selections
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedFormat, setSelectedFormat] = useState("1080x1080");
  const [selectedType, setSelectedType] = useState("post");
  const [selectedModel, setSelectedModel] = useState<"flash" | "pro">("flash");
  const [uploadedImage, setUploadedImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);

  // Prompt and copy
  const [userPrompt, setUserPrompt] = useState("");
  const [headline, setHeadline] = useState("");
  const [copyText, setCopyText] = useState("");
  const [ctaText, setCtaText] = useState("Saiba mais");

  // Generation
  const [generating, setGenerating] = useState(false);
  const [generatedUrls, setGeneratedUrls] = useState<(string | null)[]>([]);
  const [generatedCopy, setGeneratedCopy] = useState<string | null>(null);
  const [generatedIds, setGeneratedIds] = useState<string[]>([]);
  const [genError, setGenError] = useState<string | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Load properties
    const propRes = await supabase
      .from("properties")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    const props = (propRes.data ?? []) as Property[];
    setProperties(props);

    if (preselectedPropertyId) {
      const found = props.find((p) => p.id === preselectedPropertyId);
      if (found) {
        setSelectedProperty(found);
        setStep(2);
      }
    }

    setLoadingData(false);
  }, [supabase, preselectedPropertyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-fill copy when property is selected
  useEffect(() => {
    if (selectedProperty && !headline) {
      const typeLabel: Record<string, string> = {
        casa: "Casa",
        apartamento: "Apartamento",
        lote: "Lote",
        comercial: "Comercial",
        cobertura: "Cobertura",
        chacara: "Chacara",
      };
      const label = typeLabel[selectedProperty.type] ?? "Imovel";
      const price = formatCurrency(selectedProperty.price_cents);
      setHeadline(`${label} a venda - ${price}`);
      const extras = [
        selectedProperty.bedrooms
          ? `${selectedProperty.bedrooms} quartos`
          : "",
        selectedProperty.area_sqm ? `${selectedProperty.area_sqm}m2` : "",
        selectedProperty.city ?? "",
      ]
        .filter(Boolean)
        .join(" - ");
      if (extras) setCopyText(extras);
    }
  }, [selectedProperty, headline]);

  async function handleGenerate() {
    if (!userPrompt.trim()) return;
    if (!selectedProperty && !uploadedImage) return;
    setGenerating(true);
    setGenError(null);
    setGeneratedUrls([]);
    setGeneratedIds([]);
    setGeneratedCopy(null);
    setStep(4);

    try {
      const payload: Record<string, unknown> = {
        prompt: userPrompt,
        format: selectedFormat,
        creative_type: selectedType,
        headline,
        copy_text: copyText,
        cta_text: ctaText,
        model: selectedModel,
      };
      if (selectedProperty) {
        payload.property_id = selectedProperty.id;
      }
      if (uploadedImage) {
        payload.image_base64 = uploadedImage.base64;
        payload.image_mime_type = uploadedImage.mimeType;
      }

      const res = await fetch("/api/generate-creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const rawResponse = await res.text();
      let data: GenerateCreativeResponse | null = null;

      try {
        data = rawResponse ? (JSON.parse(rawResponse) as GenerateCreativeResponse) : null;
      } catch {
        data = null;
      }

      const fallbackError = !data
        ? extractPlainErrorMessage(rawResponse, res.status)
        : null;

      if (data?.creative_ids?.length) setGeneratedIds(data.creative_ids);
      if (data?.image_urls?.length) setGeneratedUrls(data.image_urls);
      if (data?.generated_copy) setGeneratedCopy(data.generated_copy);

      if (!res.ok) {
        setGenError(data?.error ?? fallbackError ?? "Erro ao gerar criativo");
        return;
      }

      if (!data) {
        setGenError(fallbackError ?? "Resposta invalida do servidor");
        return;
      }

      setGeneratedIds(data.creative_ids ?? []);
      setGeneratedUrls(data.image_urls ?? []);
      setGeneratedCopy(data.generated_copy ?? null);
    } catch (err) {
      setGenError(
        err instanceof Error && err.message
          ? `Falha na conexao com o servidor: ${err.message}`
          : "Falha na conexao com o servidor. Tente novamente."
      );
    } finally {
      setGenerating(false);
    }
  }

  function extractPlainErrorMessage(rawResponse: string, status: number) {
    const plainText = rawResponse
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!plainText) {
      return `Erro HTTP ${status} ao gerar criativo.`;
    }

    const shortened = plainText.slice(0, 220);
    return `Erro HTTP ${status}: ${shortened}`;
  }

  async function handleCopyToClipboard() {
    if (!generatedCopy) return;
    try {
      await navigator.clipboard.writeText(generatedCopy);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch {
      // fallback
    }
  }

  const canNext =
    (step === 1 && (selectedProperty !== null || uploadedImage !== null)) ||
    (step === 2 && true) ||
    (step === 3 && userPrompt.trim().length > 0);

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
          className="p-2 text-white/60 hover:text-white hover:bg-white/8 rounded-xl transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">Criar Criativo</h1>
          <p className="text-white/60 text-sm">
            Gere imagens profissionais com IA
          </p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-0 overflow-x-auto">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => isDone && setStep(s.id)}
                disabled={!isDone}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
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
                <ChevronRight className="w-4 h-4 text-white/20 mx-0.5" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">

        {/* Step 1: Image Source */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white mb-2">
              Escolha a imagem
            </h2>
            <p className="text-white/50 text-sm">
              Envie uma foto do imovel ou selecione um imovel cadastrado.
            </p>

            {/* Direct Upload */}
            <div>
              <p className="text-sm text-white/60 font-medium mb-3">Upload direto</p>
              {uploadedImage ? (
                <div className="relative inline-block">
                  <img
                    src={uploadedImage.preview}
                    alt="Upload"
                    className="h-40 rounded-xl border border-white/10 object-cover"
                  />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/15 hover:border-brand-500/40 rounded-xl p-8 cursor-pointer transition-all hover:bg-white/3">
                  <Upload className="w-8 h-8 text-white/30" />
                  <span className="text-white/50 text-sm">Clique ou arraste uma imagem</span>
                  <span className="text-white/30 text-xs">JPG, PNG ou WebP ate 10MB</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 10 * 1024 * 1024) {
                        alert("Imagem muito grande. Maximo 10MB.");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        const result = reader.result as string;
                        const base64 = result.split(",")[1];
                        setUploadedImage({
                          base64,
                          mimeType: file.type,
                          preview: result,
                        });
                        setSelectedProperty(null);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-xs font-medium">OU</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Select from properties */}
            <div>
              <p className="text-sm text-white/60 font-medium mb-3">Selecionar imovel cadastrado</p>
              {properties.length === 0 ? (
                <div className="text-center py-6">
                  <Building2 className="w-8 h-8 text-white/15 mx-auto mb-2" />
                  <p className="text-white/50 text-sm">Nenhum imovel cadastrado</p>
                </div>
              ) : (
                <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {properties.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedProperty(p);
                        setUploadedImage(null);
                      }}
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
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-white/60 text-xs">
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
                                <Maximize2 className="w-3 h-3" /> {p.area_sqm}m2
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
          </div>
        )}

        {/* Step 2: Format + Model + Type */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Formato e Tipo</h2>

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
                    <LayoutGrid className="w-6 h-6 text-white/60" />
                    <div className="text-center">
                      <p className="text-white font-semibold text-sm">
                        {f.label}
                      </p>
                      <p className="text-white/60 text-xs">{f.sublabel}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Modelo IA */}
            <div>
              <p className="text-sm text-white/60 font-medium mb-3">Modelo de IA</p>
              <div className="flex gap-2">
                {[
                  { id: "flash" as const, label: "Flash", desc: "Rapido e economico" },
                  { id: "pro" as const, label: "Pro", desc: "Maior qualidade" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`flex-1 flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition-all ${
                      selectedModel === m.id
                        ? "border-brand-500/60 bg-brand-500/10 ring-1 ring-brand-500/30"
                        : "border-white/8 bg-white/3 hover:border-white/20"
                    }`}
                  >
                    <span className="text-white font-semibold text-sm">{m.label}</span>
                    <span className="text-white/50 text-xs">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo */}
            <div>
              <p className="text-sm text-white/60 font-medium mb-3">
                Tipo de criativo
              </p>
              <div className="flex gap-2">
                {CREATIVE_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                      selectedType === t.id
                        ? "border-brand-500/60 bg-brand-500/10 text-brand-400"
                        : "border-white/8 text-white/70 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Prompt + Copy */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">
                Escreva o prompt da imagem
              </h2>
              <p className="text-white/50 text-sm">
                Descreva o que voce quer que a IA gere. Seja especifico sobre estilo, cores, composicao e texto a exibir.
              </p>
            </div>

            {/* Prompt textarea */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Prompt <span className="text-red-400">*</span>
              </label>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows={6}
                maxLength={2000}
                placeholder="Ex: Crie um post para Instagram de um apartamento de luxo em Sao Paulo. Estilo moderno e sofisticado, tons escuros com dourado. Inclua headline 'Apartamento Exclusivo' em destaque, preco R$ 1.2M abaixo. A foto do imovel deve ser o hero. Logo da imobiliaria no canto inferior direito."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-brand-500/60 transition-all resize-none"
              />
              <p className="text-white/40 text-xs mt-1 text-right">
                {userPrompt.length}/2000
              </p>
            </div>

            {/* Headline / Copy / CTA */}
            <div className="border-t border-white/8 pt-5 space-y-4">
              <p className="text-xs text-white/40 uppercase tracking-wide font-medium">
                Metadados do criativo (opcional)
              </p>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  maxLength={80}
                  placeholder="Ex: Apartamento 2 quartos em Sao Paulo - R$ 350.000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all"
                />
                <p className="text-white/40 text-xs mt-1 text-right">
                  {headline.length}/80
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Descricao
                </label>
                <textarea
                  value={copyText}
                  onChange={(e) => setCopyText(e.target.value)}
                  maxLength={200}
                  rows={2}
                  placeholder="Ex: 3 quartos - 80m2 - Jardim Paulista - Documentacao ok"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Chamada para acao (CTA)
                </label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {[
                    "Saiba mais",
                    "Entre em contato",
                    "Agende uma visita",
                    "Investir agora",
                  ].map((cta) => (
                    <button
                      key={cta}
                      onClick={() => setCtaText(cta)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        ctaText === cta
                          ? "bg-brand-500/20 border-brand-500/50 text-brand-400"
                          : "bg-white/5 border-white/10 text-white/70 hover:border-white/25"
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all"
                />
              </div>
            </div>

            {/* Summary */}
            {(selectedProperty || uploadedImage) && (
              <div className="bg-white/5 border border-white/8 rounded-xl p-4 text-sm">
                <p className="text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">
                  Resumo
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-white/70">Imagem</span>
                    <span className="text-white truncate max-w-[60%] text-right">
                      {selectedProperty ? selectedProperty.title : "Upload direto"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Formato</span>
                    <span className="text-white">
                      {FORMATS.find((f) => f.id === selectedFormat)?.label} -{" "}
                      {selectedFormat}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Modelo</span>
                    <span className="text-white capitalize">{selectedModel}</span>
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
              {generating
                ? "Gerando criativos..."
                : generatedUrls.some((u) => u)
                ? "Criativos gerados!"
                : "Resultado"}
            </h2>

            {generating ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-brand-500/20" />
                  <div className="absolute inset-0 rounded-full border-t-2 border-brand-500 animate-spin" />
                  <Wand2 className="absolute inset-0 m-auto w-6 h-6 text-brand-400" />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold">
                    Processando com IA...
                  </p>
                  <p className="text-white/60 text-sm mt-1">
                    Gerando imagem IA + mockups - pode levar ate 60 segundos
                  </p>
                </div>
              </div>
            ) : genError ? (
              <div className="space-y-6">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-center">
                  <p className="text-red-400 font-medium mb-1">
                    Erro na geracao da imagem IA
                  </p>
                  <p className="text-red-400/70 text-sm">{genError}</p>
                  <button
                    onClick={() => {
                      setStep(3);
                      setGenError(null);
                    }}
                    className="mt-4 text-sm text-white/70 hover:text-white underline"
                  >
                    Tentar novamente
                  </button>
                </div>

                {/* Still show mockups even when AI failed */}
                {generatedUrls.some((u) => u) && (
                  <div>
                    <p className="text-white/70 text-sm mb-3 font-medium">
                      {generatedUrls.filter((u) => u).length} Mockup{generatedUrls.filter((u) => u).length !== 1 ? "s" : ""} Gerado{generatedUrls.filter((u) => u).length !== 1 ? "s" : ""}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {generatedUrls.map((url, idx) =>
                        url ? (
                          <div key={idx} className="space-y-3">
                            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/30">
                              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg font-medium z-10">
                                Mockup {idx + 1}
                              </div>
                              <Image
                                src={url}
                                alt={`Mockup ${idx + 1}`}
                                width={540}
                                height={540}
                                className="w-full object-contain max-h-[400px]"
                                unoptimized={url.startsWith("data:")}
                              />
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={url}
                                download={`mockup-${idx + 1}.png`}
                                className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-xl font-semibold text-xs transition-all"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Baixar
                              </a>
                            </div>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                )}

                {/* Generated Copy */}
                {generatedCopy && (
                  <div className="bg-white/[0.04] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white/70 text-sm font-medium flex items-center gap-2">
                        <Pencil className="w-3.5 h-3.5" />
                        Copy para Postagem
                      </p>
                      <button
                        onClick={handleCopyToClipboard}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          copiedToClipboard
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-white/8 hover:bg-white/15 text-white/60 hover:text-white"
                        }`}
                      >
                        {copiedToClipboard ? (
                          <>
                            <Check className="w-3 h-3" /> Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copiar
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-white/80 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                      {generatedCopy}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Image Variations */}
                {generatedUrls.some((u) => u) && (
                  <div>
                    <p className="text-white/70 text-sm mb-3 font-medium">
                      {generatedUrls.filter((u) => u).length} Criativo{generatedUrls.filter((u) => u).length !== 1 ? "s" : ""} Gerado{generatedUrls.filter((u) => u).length !== 1 ? "s" : ""}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {generatedUrls.map((url, idx) =>
                        url ? (
                          <div
                            key={idx}
                            className="space-y-3"
                          >
                            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/30">
                              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg font-medium z-10">
                                Variacao {idx + 1}
                              </div>
                              <Image
                                src={url}
                                alt={`Criativo variacao ${idx + 1}`}
                                width={540}
                                height={540}
                                className="w-full object-contain max-h-[400px]"
                                unoptimized={url.startsWith("data:")}
                              />
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={url}
                                download={`criativo-v${idx + 1}-${generatedIds[idx] ?? "img"}.png`}
                                className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-xl font-semibold text-xs transition-all"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Baixar V{idx + 1}
                              </a>
                              <button
                                onClick={() => {
                                  if (navigator.share) {
                                    navigator.share({
                                      title: `Criativo V${idx + 1}`,
                                      url,
                                    });
                                  }
                                }}
                                className="flex items-center gap-2 bg-white/8 hover:bg-white/15 text-white px-4 py-2.5 rounded-xl text-xs transition-all"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            key={idx}
                            className="rounded-xl border border-white/8 bg-white/3 p-8 flex flex-col items-center justify-center text-center"
                          >
                            <p className="text-white/50 text-sm">
                              Variacao {idx + 1} - falhou
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Generated Copy */}
                {generatedCopy && (
                  <div className="bg-white/[0.04] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white/70 text-sm font-medium flex items-center gap-2">
                        <Pencil className="w-3.5 h-3.5" />
                        Copy para Postagem
                      </p>
                      <button
                        onClick={handleCopyToClipboard}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          copiedToClipboard
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-white/8 hover:bg-white/15 text-white/60 hover:text-white"
                        }`}
                      >
                        {copiedToClipboard ? (
                          <>
                            <Check className="w-3 h-3" /> Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copiar
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-white/80 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                      {generatedCopy}
                    </pre>
                  </div>
                )}

                {/* No results at all */}
                {!generatedUrls.some((u) => u) && !generatedCopy && (
                  <div className="bg-white/5 border border-white/8 rounded-xl p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-3">
                      <Wand2 className="w-5 h-5 text-amber-400" />
                    </div>
                    <p className="text-white font-semibold mb-1">
                      Nao foi possivel gerar
                    </p>
                    <p className="text-white/60 text-sm mb-4">
                      A IA nao retornou resultados. Tente novamente.
                    </p>
                    <button
                      onClick={() => {
                        setStep(3);
                      }}
                      className="text-brand-400 hover:text-brand-300 text-sm underline"
                    >
                      Voltar e tentar novamente
                    </button>
                  </div>
                )}
              </>
            )}

            {!generating && (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep(1);
                    setSelectedProperty(null);
                    setUploadedImage(null);
                    setSelectedFormat("1080x1080");
                    setSelectedType("post");
                    setUserPrompt("");
                    setHeadline("");
                    setCopyText("");
                    setCtaText("Saiba mais");
                    setGeneratedUrls([]);
                    setGeneratedCopy(null);
                    setGeneratedIds([]);
                    setGenError(null);
                  }}
                  className="flex-1 py-2.5 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
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
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      {step < 4 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => step > 1 && setStep((s) => s - 1)}
            disabled={step === 1}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white disabled:opacity-0 transition-all"
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
              Proximo
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
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
        </div>
      }
    >
      <CriarPageContent />
    </Suspense>
  );
}