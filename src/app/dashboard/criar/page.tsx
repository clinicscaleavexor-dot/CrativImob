"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Wand2,
  Loader2,
  CheckCircle2,
  LayoutGrid,
  Pencil,
  Eye,
  Download,
  Share2,
  Sparkles,
  Copy,
  Check,
  Upload,
  ImageIcon,
  X,
} from "lucide-react";
import { downloadImage } from "@/lib/download-image";

interface UploadedImage {
  base64: string;
  mimeType: string;
  preview: string;
}

interface StyleOption {
  id: string;
  slug: string;
  label: string;
  description: string | null;
}

interface GenerateCreativeResponse {
  success?: boolean;
  creative_ids?: string[];
  image_urls?: (string | null)[];
  generated_copy?: string | null;
  status?: string;
  error?: string;
  dbError?: { message?: string; code?: string; details?: string } | null;
}

const FORMATS = [
  { id: "1080x1080", label: "Post", sublabel: "1080 × 1080" },
  { id: "1080x1920", label: "Stories", sublabel: "1080 × 1920" },
  { id: "1200x628", label: "Tráfego", sublabel: "1200 × 628" },
];

const STEPS = [
  { id: 1, label: "Imagens", icon: ImageIcon },
  { id: 2, label: "Estilo", icon: Sparkles },
  { id: 3, label: "Informações", icon: Pencil },
  { id: 4, label: "Resultado", icon: Eye },
];

const PRIMARY_SLOTS = 3;
const SECONDARY_SLOTS = 4;

function ImageSlot({
  image,
  label,
  onUpload,
  onRemove,
}: {
  image: UploadedImage | null;
  label: string;
  onUpload: (img: UploadedImage) => void;
  onRemove: () => void;
}) {
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Imagem muito grande. Máximo 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      onUpload({ base64, mimeType: file.type, preview: result });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  if (image) {
    return (
      <div className="relative group">
        <img
          src={image.preview}
          alt={label}
          className="w-full aspect-square rounded-xl border border-white/10 object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-xl transition-all flex items-center justify-center">
          <button
            onClick={onRemove}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium">
          {label}
        </span>
      </div>
    );
  }

  return (
    <label className="relative group cursor-pointer">
      <div className="w-full aspect-square rounded-xl border-2 border-dashed border-white/15 hover:border-brand-500/40 hover:bg-white/[0.03] transition-all flex flex-col items-center justify-center gap-1.5">
        <Upload className="w-5 h-5 text-white/25 group-hover:text-brand-400 transition-colors" />
        <span className="text-white/30 text-[10px] font-medium text-center px-1">{label}</span>
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </label>
  );
}

export default function CriarPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: Images
  const [primaryImages, setPrimaryImages] = useState<(UploadedImage | null)[]>([null, null, null]);
  const [secondaryImages, setSecondaryImages] = useState<(UploadedImage | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  // Step 2: Style, Format, Model
  const [styles, setStyles] = useState<StyleOption[]>([]);
  const [loadingStyles, setLoadingStyles] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState("1080x1080");
  const [selectedModel, setSelectedModel] = useState<"flash" | "pro">("flash");

  // Step 3: Property info + copy
  const [propertyInfo, setPropertyInfo] = useState("");
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
  const [showCreditConfirm, setShowCreditConfirm] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);

  // Load styles when entering step 2
  useEffect(() => {
    if (step === 2 && styles.length === 0 && !loadingStyles) {
      setLoadingStyles(true);
      fetch("/api/styles")
        .then((r) => r.json())
        .then((d) => setStyles(d.styles ?? []))
        .catch(() => {})
        .finally(() => setLoadingStyles(false));
    }
  }, [step, styles.length, loadingStyles]);

  async function handleRequestGenerate() {
    try {
      const res = await fetch("/api/credits");
      if (res.ok) {
        const data = await res.json();
        setUserCredits(data.balance ?? 0);
      } else {
        setUserCredits(0);
      }
    } catch {
      setUserCredits(0);
    }
    setShowCreditConfirm(true);
  }

  async function handleGenerate() {
    const filledPrimary = primaryImages.filter((img): img is UploadedImage => img !== null);
    if (filledPrimary.length === 0) return;

    setShowCreditConfirm(false);
    setGenerating(true);
    setGenError(null);
    setGeneratedUrls([]);
    setGeneratedIds([]);
    setGeneratedCopy(null);
    setStep(4);

    try {
      const payload = {
        style_category_id: selectedStyle,
        property_info: propertyInfo,
        primary_images: filledPrimary.map((img) => ({
          base64: img.base64,
          mime_type: img.mimeType,
        })),
        secondary_images: secondaryImages
          .filter((img): img is UploadedImage => img !== null)
          .map((img) => ({ base64: img.base64, mime_type: img.mimeType })),
        format: selectedFormat,
        model: selectedModel,
        creative_type: "post_instagram",
        headline,
        copy_text: copyText,
        cta_text: ctaText,
      };

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

      if (data?.creative_ids?.length) setGeneratedIds(data.creative_ids);
      if (data?.image_urls?.length) setGeneratedUrls(data.image_urls);
      if (data?.generated_copy) setGeneratedCopy(data.generated_copy);

      if (!res.ok) {
        const dbErr = data?.dbError?.message ? ` (DB: ${data.dbError.message})` : "";
        setGenError((data?.error ?? `Erro HTTP ${res.status}`) + dbErr);
        return;
      }

      setGeneratedIds(data?.creative_ids ?? []);
      setGeneratedUrls(data?.image_urls ?? []);
      setGeneratedCopy(data?.generated_copy ?? null);
      router.refresh();
    } catch (err) {
      setGenError(
        err instanceof Error
          ? `Falha na conexão: ${err.message}`
          : "Falha na conexão. Tente novamente."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopyToClipboard() {
    if (!generatedCopy) return;
    try {
      await navigator.clipboard.writeText(generatedCopy);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  async function downloadAll() {
    const validUrls = generatedUrls.filter((u): u is string => !!u);
    for (let i = 0; i < validUrls.length; i++) {
      await downloadImage(validUrls[i], `criativo-${i + 1}.png`);
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  function resetWizard() {
    setStep(1);
    setPrimaryImages([null, null, null]);
    setSecondaryImages([null, null, null, null]);
    setSelectedStyle(null);
    setPropertyInfo("");
    setHeadline("");
    setCopyText("");
    setCtaText("Saiba mais");
    setGeneratedUrls([]);
    setGeneratedCopy(null);
    setGeneratedIds([]);
    setGenError(null);
  }

  const hasPrimary = primaryImages.some((img) => img !== null);
  const canNext =
    (step === 1 && hasPrimary) ||
    step === 2 ||
    (step === 3 && propertyInfo.trim().length > 0);

  function renderImageGrid(urls: (string | null)[], ids: string[]) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {urls.map((url, idx) =>
          url ? (
            <div key={idx} className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/30">
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg font-medium z-10">
                  {idx === 0 ? "IA" : `Mockup ${idx}`}
                </div>
                <Image
                  src={url}
                  alt={`Criativo ${idx + 1}`}
                  width={540}
                  height={540}
                  className="w-full object-contain max-h-[400px]"
                  unoptimized={url.startsWith("data:")}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadImage(url, `criativo-${idx + 1}-${ids[idx] ?? "img"}.png`)}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-xl font-semibold text-xs transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: `Criativo ${idx + 1}`, url });
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
              className="rounded-xl border border-white/8 bg-white/3 p-8 flex items-center justify-center"
            >
              <p className="text-white/40 text-sm">Imagem {idx + 1} — falhou</p>
            </div>
          )
        )}
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
          <p className="text-white/60 text-sm">Gere imagens profissionais com IA</p>
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

        {/* ── Step 1: Imagens ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Selecione as fotos</h2>
              <p className="text-white/50 text-sm">
                Fotos primárias são enviadas para a IA. Fotos secundárias viram mockups com sua logo.
              </p>
            </div>

            {/* Primary photos */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-brand-400 bg-brand-500/15 px-2.5 py-1 rounded-full uppercase tracking-wide">
                  Fotos Primárias
                </span>
                <span className="text-white/30 text-xs">Até 3 · mínimo 1 · enviadas para a IA</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: PRIMARY_SLOTS }).map((_, i) => (
                  <ImageSlot
                    key={i}
                    image={primaryImages[i]}
                    label={i === 0 ? "Foto Principal" : `Foto ${i + 1}`}
                    onUpload={(img) => {
                      const next = [...primaryImages];
                      next[i] = img;
                      setPrimaryImages(next);
                    }}
                    onRemove={() => {
                      const next = [...primaryImages];
                      next[i] = null;
                      setPrimaryImages(next);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Secondary photos */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-white/50 bg-white/8 px-2.5 py-1 rounded-full uppercase tracking-wide">
                  Fotos Secundárias
                </span>
                <span className="text-white/30 text-xs">Até 4 · opcionais · mockup com sua logo</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: SECONDARY_SLOTS }).map((_, i) => (
                  <ImageSlot
                    key={i}
                    image={secondaryImages[i]}
                    label={`Foto ${PRIMARY_SLOTS + i + 1}`}
                    onUpload={(img) => {
                      const next = [...secondaryImages];
                      next[i] = img;
                      setSecondaryImages(next);
                    }}
                    onRemove={() => {
                      const next = [...secondaryImages];
                      next[i] = null;
                      setSecondaryImages(next);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Estilo, Formato, Modelo ── */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Estilo e Formato</h2>

            {/* Style cards */}
            <div>
              <p className="text-sm text-white/60 font-medium mb-3">
                Estilo do criativo{" "}
                <span className="text-white/30 font-normal">(opcional)</span>
              </p>
              {loadingStyles ? (
                <div className="flex items-center gap-2 text-white/40 text-sm py-4">
                  <Loader2 className="w-4 h-4 animate-spin" /> Carregando estilos...
                </div>
              ) : styles.length === 0 ? (
                <p className="text-white/30 text-sm py-2">Nenhum estilo configurado ainda.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {styles.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStyle(selectedStyle === s.id ? null : s.id)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        selectedStyle === s.id
                          ? "border-brand-500/60 bg-brand-500/10 ring-1 ring-brand-500/30"
                          : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <p className="text-white font-semibold text-sm">{s.label}</p>
                      {s.description && (
                        <p className="text-white/50 text-xs mt-1 line-clamp-2">{s.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Format */}
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
                      <p className="text-white font-semibold text-sm">{f.label}</p>
                      <p className="text-white/60 text-xs">{f.sublabel}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Model */}
            <div>
              <p className="text-sm text-white/60 font-medium mb-3">Modelo de IA</p>
              <div className="flex gap-2">
                {[
                  { id: "flash" as const, label: "Flash ⚡", desc: "Rápido e econômico" },
                  { id: "pro" as const, label: "Pro 💎", desc: "Maior qualidade" },
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
          </div>
        )}

        {/* ── Step 3: Informações do Imóvel ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Informações do Imóvel</h2>
              <p className="text-white/50 text-sm">
                Descreva o imóvel para personalizar o criativo gerado pela IA.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Informações do Imóvel <span className="text-red-400">*</span>
              </label>
              <textarea
                value={propertyInfo}
                onChange={(e) => setPropertyInfo(e.target.value)}
                rows={5}
                maxLength={1500}
                placeholder="Ex: Apartamento de 3 quartos, 90m², Jardim Paulista, São Paulo. Valor R$ 850.000. Andar alto com vista livre, varanda gourmet, 2 vagas. Acabamento de alto padrão, pronto para morar."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-brand-500/60 transition-all resize-none"
              />
              <p className="text-white/40 text-xs mt-1 text-right">{propertyInfo.length}/1500</p>
            </div>

            {/* Optional copy metadata */}
            <div className="border-t border-white/8 pt-5 space-y-4">
              <p className="text-xs text-white/40 uppercase tracking-wide font-medium">
                Metadados do criativo (opcional)
              </p>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  maxLength={80}
                  placeholder="Ex: Apartamento 3 quartos em São Paulo"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Descrição</label>
                <textarea
                  value={copyText}
                  onChange={(e) => setCopyText(e.target.value)}
                  maxLength={200}
                  rows={2}
                  placeholder="Ex: 3 quartos · 90m² · Jardim Paulista"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Chamada para ação (CTA)
                </label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {["Saiba mais", "Entre em contato", "Agende uma visita", "Investir agora"].map(
                    (cta) => (
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
                    )
                  )}
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
            <div className="bg-white/5 border border-white/8 rounded-xl p-4 text-sm">
              <p className="text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">
                Resumo
              </p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/70">Fotos primárias</span>
                  <span className="text-white">
                    {primaryImages.filter(Boolean).length} foto
                    {primaryImages.filter(Boolean).length !== 1 ? "s" : ""}
                  </span>
                </div>
                {secondaryImages.some(Boolean) && (
                  <div className="flex justify-between">
                    <span className="text-white/70">Fotos secundárias</span>
                    <span className="text-white">
                      {secondaryImages.filter(Boolean).length} mockup
                      {secondaryImages.filter(Boolean).length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-white/70">Estilo</span>
                  <span className="text-white">
                    {styles.find((s) => s.id === selectedStyle)?.label ?? "Sem estilo"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Formato</span>
                  <span className="text-white">
                    {FORMATS.find((f) => f.id === selectedFormat)?.label} · {selectedFormat}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Modelo</span>
                  <span className="text-white capitalize">{selectedModel}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Resultado ── */}
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
                  <p className="text-white font-semibold">Processando com IA...</p>
                  <p className="text-white/60 text-sm mt-1">Pode levar até 60 segundos</p>
                </div>
              </div>
            ) : genError ? (
              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-center">
                  <p className="text-red-400 font-medium mb-1">Erro na geração</p>
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
                {generatedUrls.some((u) => u) && renderImageGrid(generatedUrls, generatedIds)}
              </div>
            ) : (
              <>
                {generatedUrls.some((u) => u) && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-white/70 text-sm font-medium">
                        {generatedUrls.filter((u) => u).length} criativo
                        {generatedUrls.filter((u) => u).length !== 1 ? "s" : ""} gerado
                        {generatedUrls.filter((u) => u).length !== 1 ? "s" : ""}
                      </p>
                      {generatedUrls.filter((u) => u).length > 1 && (
                        <button
                          onClick={downloadAll}
                          className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 border border-brand-500/30 hover:border-brand-400/50 px-3 py-1.5 rounded-lg transition-all"
                        >
                          <Download className="w-3.5 h-3.5" /> Baixar Todas
                        </button>
                      )}
                    </div>
                    {renderImageGrid(generatedUrls, generatedIds)}
                  </div>
                )}

                {generatedCopy && (
                  <div className="bg-white/[0.04] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white/70 text-sm font-medium flex items-center gap-2">
                        <Pencil className="w-3.5 h-3.5" /> Copy para Postagem
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

                {!generatedUrls.some((u) => u) && !generatedCopy && (
                  <div className="bg-white/5 border border-white/8 rounded-xl p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-3">
                      <Wand2 className="w-5 h-5 text-amber-400" />
                    </div>
                    <p className="text-white font-semibold mb-1">Não foi possível gerar</p>
                    <p className="text-white/60 text-sm mb-4">
                      A IA não retornou resultados. Tente novamente.
                    </p>
                    <button
                      onClick={() => setStep(3)}
                      className="text-brand-400 hover:text-brand-300 text-sm underline"
                    >
                      Voltar e tentar novamente
                    </button>
                  </div>
                )}
              </>
            )}

            {!generating && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={resetWizard}
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

      {/* Navigation buttons */}
      {step < 4 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => step > 1 && setStep((s) => s - 1)}
            disabled={step === 1}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white disabled:opacity-0 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all"
            >
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleRequestGenerate}
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

      {/* Credit Confirmation Modal */}
      {showCreditConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#1a2236] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-white font-bold text-lg">Confirmar geração</h3>
            <p className="text-white/70 text-sm">
              Esta geração consumirá <span className="text-yellow-400 font-bold">1 crédito</span>.
            </p>
            <p className="text-white/50 text-sm">
              Seu saldo atual: <span className="text-yellow-400 font-bold">{userCredits ?? "..."}</span> crédito{userCredits !== 1 ? "s" : ""}
            </p>
            {userCredits !== null && userCredits <= 0 && (
              <p className="text-red-400 text-sm font-medium">
                Você não tem créditos suficientes para gerar.
              </p>
            )}
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowCreditConfirm(false)}
                className="px-4 py-2 text-white/60 hover:text-white text-sm rounded-lg hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerate}
                disabled={userCredits !== null && userCredits <= 0}
                className="flex items-center gap-1.5 bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all"
              >
                <Wand2 className="w-4 h-4" />
                Confirmar e Gerar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
