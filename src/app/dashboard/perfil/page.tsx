"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  Building2,
  Phone,
  BadgeCheck,
  Palette,
  Upload,
  Loader2,
  CheckCircle2,
  Camera,
  FileText,
  Target,
  Sparkles,
  Eye,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

type Profile = Tables<"profiles">;

interface BrandColors {
  primary: string;
  secondary: string;
}

const DEFAULT_COLORS: BrandColors = { primary: "#2563eb", secondary: "#0f172a" };

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [creci, setCreci] = useState("");
  const [brandColors, setBrandColors] = useState<BrandColors>(DEFAULT_COLORS);

  // Briefing fields
  const [companyDescription, setCompanyDescription] = useState("");
  const [brandPersonality, setBrandPersonality] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [preferredStyle, setPreferredStyle] = useState("");

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: rawData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const data = rawData as Profile | null;

      if (data) {
        setProfile(data);
        setFullName(data.full_name ?? "");
        setCompanyName(data.company_name ?? "");
        setPhone(data.phone ?? "");
        setCreci(data.creci ?? "");
        const colors = data.brand_colors as BrandColors | null;
        if (colors?.primary) {
          setBrandColors({ primary: colors.primary, secondary: colors.secondary ?? DEFAULT_COLORS.secondary });
        }
        setCompanyDescription(data.company_description ?? "");
        setBrandPersonality(data.brand_personality ?? "");
        setTargetAudience(data.target_audience ?? "");
        setPreferredStyle(data.preferred_style ?? "");
      }

      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("profiles")
      .update({
        full_name: fullName || null,
        company_name: companyName || null,
        phone: phone || null,
        creci: creci || null,
        brand_colors: brandColors,
        company_description: companyDescription || null,
        brand_personality: brandPersonality || null,
        target_audience: targetAudience || null,
        preferred_style: preferredStyle || null,
      })
      .eq("id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleAvatarUpload(file: File) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setAvatarUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error } = await supabase.storage
      .from("brand-assets")
      .upload(path, file, { upsert: true });

    if (error) {
      alert(`Erro ao enviar foto: ${error.message}`);
    } else {
      const { data: urlData } = supabase.storage.from("brand-assets").getPublicUrl(path);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", user.id);
      setProfile((prev) => prev ? { ...prev, avatar_url: urlData.publicUrl } : prev);
    }
    setAvatarUploading(false);
  }

  async function handleLogoUpload(file: File) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLogoUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/logo.${ext}`;

    const { error } = await supabase.storage
      .from("brand-assets")
      .upload(path, file, { upsert: true });

    if (error) {
      alert(`Erro ao enviar logo: ${error.message}`);
    } else {
      const { data: urlData } = supabase.storage.from("brand-assets").getPublicUrl(path);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("profiles")
        .update({ company_logo_url: urlData.publicUrl })
        .eq("id", user.id);
      setProfile((prev) => prev ? { ...prev, company_logo_url: urlData.publicUrl } : prev);
    }
    setLogoUploading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Perfil & Marca</h1>
        <p className="text-white/60 text-sm">Suas informações serão usadas nos criativos gerados</p>
      </div>

      {/* Avatar */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">Foto de Perfil</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl object-cover border border-white/10"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-brand-500/20 border border-white/10 flex items-center justify-center">
                <User className="w-8 h-8 text-brand-400" />
              </div>
            )}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-brand-500 hover:bg-brand-600 flex items-center justify-center transition-all"
            >
              {avatarUploading ? (
                <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5 text-white" />
              )}
            </button>
          </div>
          <div>
            <p className="text-white font-semibold">{fullName || "Sem nome"}</p>
            <p className="text-white/60 text-sm">{companyName || "Sem empresa"}</p>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="text-brand-400 text-xs mt-1 hover:text-brand-300 transition-colors"
            >
              Alterar foto
            </button>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
          />
        </div>
      </div>

      {/* Informações pessoais */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide">Informações Pessoais</h2>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Nome completo</div>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="João Silva"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Empresa / Imobiliária</div>
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Imobiliária Silva"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Telefone / WhatsApp</div>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              <div className="flex items-center gap-1.5"><BadgeCheck className="w-3.5 h-3.5" /> CRECI</div>
            </label>
            <input
              type="text"
              value={creci}
              onChange={(e) => setCreci(e.target.value)}
              placeholder="123456-F"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Identidade Visual */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Identidade Visual da Marca
        </h2>

        {/* Logo */}
        <div>
          <p className="text-sm font-medium text-white/70 mb-3">Logo da empresa</p>
          <div
            className="flex items-center gap-4 p-4 bg-white/5 border border-white/8 border-dashed rounded-xl cursor-pointer hover:border-brand-500/40 hover:bg-brand-500/5 transition-all"
            onClick={() => logoInputRef.current?.click()}
          >
            {profile?.company_logo_url ? (
              <img
                src={profile.company_logo_url}
                alt="Logo"
                className="w-16 h-16 object-contain rounded-lg border border-white/10 bg-white/5"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white/20" />
              </div>
            )}
            <div>
              <p className="text-white/70 text-sm font-medium">
                {logoUploading ? "Enviando..." : "Clique para fazer upload"}
              </p>
              <p className="text-white/50 text-xs mt-0.5">PNG, JPG ou SVG · até 2MB</p>
            </div>
            {logoUploading && <Loader2 className="w-4 h-4 text-brand-400 animate-spin ml-auto" />}
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
          />
        </div>

        {/* Brand colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Cor primária</label>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg border border-white/20 cursor-pointer flex-shrink-0"
                style={{ backgroundColor: brandColors.primary }}
                onClick={() => document.getElementById("colorPrimary")?.click()}
              />
              <input
                id="colorPrimary"
                type="color"
                value={brandColors.primary}
                onChange={(e) => setBrandColors((p) => ({ ...p, primary: e.target.value }))}
                className="hidden"
              />
              <input
                type="text"
                value={brandColors.primary}
                onChange={(e) => setBrandColors((p) => ({ ...p, primary: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-brand-500/60 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Cor secundária</label>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg border border-white/20 cursor-pointer flex-shrink-0"
                style={{ backgroundColor: brandColors.secondary }}
                onClick={() => document.getElementById("colorSecondary")?.click()}
              />
              <input
                id="colorSecondary"
                type="color"
                value={brandColors.secondary}
                onChange={(e) => setBrandColors((p) => ({ ...p, secondary: e.target.value }))}
                className="hidden"
              />
              <input
                type="text"
                value={brandColors.secondary}
                onChange={(e) => setBrandColors((p) => ({ ...p, secondary: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-brand-500/60 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Color preview */}
        <div
          className="h-16 rounded-xl overflow-hidden flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}
        >
          <p className="text-white font-bold drop-shadow text-sm">Preview da marca</p>
        </div>
      </div>

      {/* Briefing da Imobiliária */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Briefing da Imobiliária
        </h2>
        <p className="text-white/50 text-xs -mt-2">
          Essas informações serão usadas pela IA para personalizar seus criativos
        </p>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Sobre a imobiliária</div>
          </label>
          <textarea
            value={companyDescription}
            onChange={(e) => setCompanyDescription(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Descreva sua imobiliária: diferenciais, foco de atuação, região, história..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all resize-none"
          />
          <p className="text-white/20 text-xs mt-1 text-right">{companyDescription.length}/500</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            <div className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Personalidade da marca</div>
          </label>
          <input
            type="text"
            value={brandPersonality}
            onChange={(e) => setBrandPersonality(e.target.value)}
            maxLength={200}
            placeholder="ex: Sofisticada, moderna, acessível, acolhedora, premium..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            <div className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Público-alvo</div>
          </label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            maxLength={200}
            placeholder="ex: Investidores, famílias classe A, jovens profissionais, aposentados..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            <div className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Estilo visual preferido</div>
          </label>
          <input
            type="text"
            value={preferredStyle}
            onChange={(e) => setPreferredStyle(e.target.value)}
            maxLength={200}
            placeholder="ex: Minimalista, editorial luxo, vibrante e colorido, clean e moderno..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all"
          />
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center justify-end gap-3 pb-4">
        {saved && (
          <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Salvo com sucesso!
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}
