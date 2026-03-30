"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Building2,
  Search,
  Filter,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Car,
  Pencil,
  Trash2,
  Loader2,
  ChevronRight,
  X,
  ImagePlus,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

type Property = Tables<"properties">;

const PROPERTY_TYPES = [
  { value: "casa", label: "Casa" },
  { value: "apartamento", label: "Apartamento" },
  { value: "lote", label: "Lote" },
  { value: "comercial", label: "Comercial" },
  { value: "cobertura", label: "Cobertura" },
  { value: "chacara", label: "Chácara" },
];

const HIGHLIGHTS_OPTIONS = [
  "Piscina", "Varanda gourmet", "Academia", "Churrasqueira",
  "Quintal", "Garagem coberta", "Portaria 24h", "Área de lazer",
  "Vista panorâmica", "Próximo ao metrô", "Pronto para morar",
  "Alto padrão", "Documentação ok",
];

const TARGET_AUDIENCE = [
  { value: "luxo", label: "Luxo" },
  { value: "popular", label: "Popular" },
  { value: "investimento", label: "Investimento" },
  { value: "familia", label: "Família" },
];

const STATES_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const emptyForm = {
  title: "",
  type: "apartamento",
  price_cents: "",
  location: "",
  city: "",
  state: "SP",
  bedrooms: "",
  bathrooms: "",
  area_sqm: "",
  parking_spots: "",
  highlights: [] as string[],
  target_audience: "familia",
};

export default function ImoveisPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [tempPropertyId, setTempPropertyId] = useState<string>(crypto.randomUUID());

  const supabase = createClient();

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    setProperties(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  function openNew() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setPropertyImages([]);
    setTempPropertyId(crypto.randomUUID());
    setShowModal(true);
  }

  function openEdit(p: Property) {
    setForm({
      title: p.title,
      type: p.type,
      price_cents: p.price_cents ? String(p.price_cents / 100) : "",
      location: p.location ?? "",
      city: p.city ?? "",
      state: p.state ?? "SP",
      bedrooms: p.bedrooms ? String(p.bedrooms) : "",
      bathrooms: p.bathrooms ? String(p.bathrooms) : "",
      area_sqm: p.area_sqm ? String(p.area_sqm) : "",
      parking_spots: p.parking_spots ? String(p.parking_spots) : "",
      highlights: p.highlights ?? [],
      target_audience: p.target_audience ?? "familia",
    });
    setEditingId(p.id);
    setPropertyImages(p.images ?? []);
    setShowModal(true);
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const remaining = 5 - propertyImages.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (toUpload.length === 0) return;

    setImageUploading(true);
    const propId = editingId ?? tempPropertyId;
    const newUrls: string[] = [];

    for (const file of toUpload) {
      if (file.size > 5 * 1024 * 1024) continue;
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${propId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("property-images")
        .upload(path, file, { contentType: file.type, upsert: false });

      if (!error) {
        const { data: urlData } = supabase.storage.from("property-images").getPublicUrl(path);
        if (urlData?.publicUrl) newUrls.push(urlData.publicUrl);
      }
    }

    setPropertyImages((prev) => [...prev, ...newUrls]);
    setImageUploading(false);
  }

  function removeImage(url: string) {
    setPropertyImages((prev) => prev.filter((u) => u !== url));
  }

  function toggleHighlight(h: string) {
    setForm((prev) => ({
      ...prev,
      highlights: prev.highlights.includes(h)
        ? prev.highlights.filter((x) => x !== h)
        : [...prev.highlights, h],
    }));
  }

  async function handleSave() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      title: form.title,
      type: form.type,
      price_cents: form.price_cents ? Math.round(parseFloat(form.price_cents) * 100) : 0,
      location: form.location || null,
      city: form.city || null,
      state: form.state || null,
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
      bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
      area_sqm: form.area_sqm ? parseFloat(form.area_sqm) : null,
      parking_spots: form.parking_spots ? parseInt(form.parking_spots) : null,
      highlights: form.highlights,
      target_audience: form.target_audience || null,
      images: propertyImages.length > 0 ? propertyImages : null,
      user_id: user.id,
    };

    if (editingId) {
      // @ts-expect-error - Supabase types version mismatch
      await supabase.from("properties").update(payload as TablesUpdate<"properties">).eq("id", editingId);
    } else {
      // @ts-expect-error - Supabase types version mismatch
      await supabase.from("properties").insert(payload as TablesInsert<"properties">);
    }

    setSaving(false);
    setShowModal(false);
    fetchProperties();
  }

  async function handleDelete(id: string) {
    // @ts-expect-error - Supabase types version mismatch
    await supabase.from("properties").update({ is_active: false } as TablesUpdate<"properties">).eq("id", id);
    setDeleteId(null);
    fetchProperties();
  }

  const filtered = properties.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.city ?? "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || p.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Imóveis</h1>
          <p className="text-white/60 text-sm">{properties.length} imóvel(is) cadastrado(s)</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Novo imóvel
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título ou cidade..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/50 flex-shrink-0" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500/50 transition-all"
          >
            <option value="all">Todos os tipos</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/8 border-dashed rounded-2xl p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-6 h-6 text-white/50" />
          </div>
          <p className="text-white/70 font-medium mb-1">
            {search || filterType !== "all" ? "Nenhum imóvel encontrado" : "Nenhum imóvel cadastrado"}
          </p>
          <p className="text-white/50 text-sm mb-6">
            {search || filterType !== "all"
              ? "Tente outros filtros"
              : "Cadastre seu primeiro imóvel para começar a criar criativos"}
          </p>
          {!search && filterType === "all" && (
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Cadastrar imóvel
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="group bg-white/[0.04] border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Thumbnail */}
                {p.images && p.images.length > 0 ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                    <Image src={p.images[0]} alt={p.title} fill className="object-cover" unoptimized />
                    {p.images.length > 1 && (
                      <span className="absolute bottom-0.5 right-0.5 text-[9px] bg-black/70 text-white/80 px-1 rounded">
                        +{p.images.length - 1}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-white/5 flex-shrink-0 flex items-center justify-center border border-white/8">
                    <Building2 className="w-6 h-6 text-white/20" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-brand-500/15 text-brand-400 px-2 py-0.5 rounded-full capitalize">
                      {p.type}
                    </span>
                    {p.target_audience && (
                      <span className="text-xs bg-white/8 text-white/70 px-2 py-0.5 rounded-full capitalize">
                        {p.target_audience}
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-bold truncate mb-2">{p.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/60 text-xs">
                    {(p.city || p.state) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {[p.city, p.state].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {p.bedrooms != null && p.bedrooms > 0 && (
                      <span className="flex items-center gap-1">
                        <BedDouble className="w-3 h-3" /> {p.bedrooms} quarto{p.bedrooms !== 1 ? "s" : ""}
                      </span>
                    )}
                    {p.bathrooms != null && p.bathrooms > 0 && (
                      <span className="flex items-center gap-1">
                        <Bath className="w-3 h-3" /> {p.bathrooms} banheiro{p.bathrooms !== 1 ? "s" : ""}
                      </span>
                    )}
                    {p.area_sqm && (
                      <span className="flex items-center gap-1">
                        <Maximize2 className="w-3 h-3" /> {p.area_sqm} m²
                      </span>
                    )}
                    {p.parking_spots != null && p.parking_spots > 0 && (
                      <span className="flex items-center gap-1">
                        <Car className="w-3 h-3" /> {p.parking_spots} vaga{p.parking_spots !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  {p.highlights && p.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.highlights.slice(0, 4).map((h) => (
                        <span key={h} className="text-xs bg-white/5 text-white/60 px-2 py-0.5 rounded-full">
                          {h}
                        </span>
                      ))}
                      {p.highlights.length > 4 && (
                        <span className="text-xs text-white/50">+{p.highlights.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-3">
                  <p className="text-white font-bold text-lg whitespace-nowrap">
                    {formatCurrency(p.price_cents)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/criar?property=${p.id}`}
                      className="flex items-center gap-1.5 text-xs bg-brand-500/15 hover:bg-brand-500/25 text-brand-400 px-3 py-1.5 rounded-lg transition-all"
                    >
                      Criar criativo <ChevronRight className="w-3 h-3" />
                    </Link>
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 text-white/50 hover:text-white/70 hover:bg-white/8 rounded-lg transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(p.id)}
                      className="p-1.5 text-white/50 hover:text-red-400 hover:bg-red-400/8 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Cadastrar/Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4">
          <div className="w-full max-w-2xl bg-[#0d1520] border border-white/10 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/8">
              <h2 className="text-lg font-bold text-white">
                {editingId ? "Editar imóvel" : "Novo imóvel"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Título do anúncio <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Ex: Apartamento 3 quartos no Centro"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all"
                />
              </div>

              {/* Tipo + Público */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Tipo</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500/60 transition-all"
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Público-alvo</label>
                  <select
                    value={form.target_audience}
                    onChange={(e) => setForm((p) => ({ ...p, target_audience: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500/60 transition-all"
                  >
                    {TARGET_AUDIENCE.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preço */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Preço (R$) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.price_cents}
                  onChange={(e) => setForm((p) => ({ ...p, price_cents: e.target.value }))}
                  placeholder="350000"
                  min="0"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all"
                />
              </div>

              {/* Localização */}
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-white/70 mb-2">Cidade</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    placeholder="São Paulo"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-white/70 mb-2">Estado</label>
                  <select
                    value={form.state}
                    onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500/60 transition-all"
                  >
                    {STATES_BR.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Bairro */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Bairro / Endereço</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  placeholder="Jardim Paulista"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all"
                />
              </div>

              {/* Detalhes */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { key: "bedrooms", label: "Quartos", placeholder: "3" },
                  { key: "bathrooms", label: "Banheiros", placeholder: "2" },
                  { key: "area_sqm", label: "Área (m²)", placeholder: "80" },
                  { key: "parking_spots", label: "Vagas", placeholder: "1" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-white/70 mb-2">{field.label}</label>
                    <input
                      type="number"
                      value={form[field.key as keyof typeof form] as string}
                      onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      min="0"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all"
                    />
                  </div>
                ))}
              </div>

              {/* Fotos do Imóvel */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-3">
                  Fotos do imóvel{" "}
                  <span className="text-white/50 font-normal">({propertyImages.length}/5)</span>
                </label>

                {propertyImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {propertyImages.map((url, idx) => (
                      <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                        <Image
                          src={url}
                          alt={`Foto ${idx + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full p-0.5"
                        >
                          <XCircle className="w-4 h-4 text-red-400" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 text-[9px] text-center bg-brand-500/80 text-white py-0.5">
                            Principal
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {propertyImages.length < 5 && (
                  <label className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-white/15 rounded-xl cursor-pointer hover:border-brand-500/40 hover:bg-brand-500/5 transition-all">
                    {imageUploading ? (
                      <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
                    ) : (
                      <ImagePlus className="w-4 h-4 text-white/50" />
                    )}
                    <span className="text-sm text-white/60">
                      {imageUploading ? "Enviando..." : "Adicionar fotos"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      disabled={imageUploading}
                    />
                  </label>
                )}
                <p className="text-white/50 text-xs mt-1.5">JPG, PNG ou WebP · máx. 5MB cada · A primeira foto será usada pela IA</p>
              </div>

              {/* Destaques */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-3">
                  Destaques{" "}
                  <span className="text-white/50 font-normal">(opcional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {HIGHLIGHTS_OPTIONS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => toggleHighlight(h)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        form.highlights.includes(h)
                          ? "bg-brand-500/20 border-brand-500/50 text-brand-400"
                          : "bg-white/5 border-white/10 text-white/70 hover:border-white/25"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/8">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/8 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title || !form.price_cents}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Cadastrar imóvel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Delete */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm bg-[#0d1520] border border-white/10 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-white font-bold mb-2">Remover imóvel?</h3>
            <p className="text-white/70 text-sm mb-6">
              Essa ação não pode ser desfeita. Os criativos gerados continuarão disponíveis.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
