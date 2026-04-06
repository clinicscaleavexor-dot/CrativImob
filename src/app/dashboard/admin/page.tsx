"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Loader2,
  Save,
  Plus,
  ToggleLeft,
  ToggleRight,
  Trash2,
  FileText,
  Sparkles,
  X,
  Users,
} from "lucide-react";
import UsersTab from "@/components/admin/UsersTab";

interface PromptCategory {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  prompt_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_PROMPT_SLUG = "prompt-padrao";

const CATEGORY_ICONS: Record<string, string> = {
  luxo: "💎",
  lancamento: "🏗️",
  praia: "🏖️",
  centro: "🏙️",
  campo: "🌿",
  comercial: "🏢",
};

export default function AdminPage() {
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editedPrompts, setEditedPrompts] = useState<Record<string, string>>({});
  const [defaultPromptDraft, setDefaultPromptDraft] = useState("");
  const [savingDefaultPrompt, setSavingDefaultPrompt] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    slug: "",
    label: "",
    description: "",
    prompt_template: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"prompts" | "users">("prompts");

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/prompts");
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const defaultPromptCategory =
    categories.find((cat) => cat.slug === DEFAULT_PROMPT_SLUG) ?? null;
  const visibleCategories = categories.filter(
    (cat) => cat.slug !== DEFAULT_PROMPT_SLUG
  );

  useEffect(() => {
    setDefaultPromptDraft(defaultPromptCategory?.prompt_template ?? "");
  }, [defaultPromptCategory?.id, defaultPromptCategory?.prompt_template]);

  function showFeedback(type: "ok" | "err", msg: string) {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  }

  async function handleSavePrompt(cat: PromptCategory) {
    const newTemplate = editedPrompts[cat.id];
    if (newTemplate === undefined || newTemplate === cat.prompt_template) return;

    setSavingId(cat.id);
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat.id, prompt_template: newTemplate }),
      });

      if (res.ok) {
        showFeedback("ok", `"${cat.label}" salvo com sucesso`);
        setCategories((prev) =>
          prev.map((c) =>
            c.id === cat.id ? { ...c, prompt_template: newTemplate } : c
          )
        );
        setEditedPrompts((prev) => {
          const next = { ...prev };
          delete next[cat.id];
          return next;
        });
      } else {
        showFeedback("err", "Erro ao salvar");
      }
    } catch {
      showFeedback("err", "Erro de conexão");
    } finally {
      setSavingId(null);
    }
  }

  async function handleToggleActive(cat: PromptCategory) {
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat.id, is_active: !cat.is_active }),
      });

      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === cat.id ? { ...c, is_active: !c.is_active } : c
          )
        );
        showFeedback("ok", `"${cat.label}" ${!cat.is_active ? "ativado" : "desativado"}`);
      }
    } catch {
      showFeedback("err", "Erro ao alterar status");
    }
  }

  async function handleDelete(cat: PromptCategory) {
    if (!confirm(`Deseja desativar a categoria "${cat.label}"?`)) return;
    await handleToggleActive(cat);
  }

  async function handleAddCategory() {
    if (!newCategory.slug || !newCategory.label || !newCategory.prompt_template) {
      showFeedback("err", "Preencha slug, label e prompt template");
      return;
    }

    if (newCategory.slug === DEFAULT_PROMPT_SLUG) {
      showFeedback("err", "Esse slug é reservado para o Prompt Padrão");
      return;
    }

    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });

      if (res.ok) {
        showFeedback("ok", "Categoria criada com sucesso");
        setShowAddForm(false);
        setNewCategory({ slug: "", label: "", description: "", prompt_template: "" });
        loadCategories();
      } else {
        const data = await res.json();
        showFeedback("err", data.error ?? "Erro ao criar");
      }
    } catch {
      showFeedback("err", "Erro de conexão");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleSaveDefaultPrompt() {
    if (!defaultPromptDraft.trim()) {
      showFeedback("err", "Preencha o Prompt Padrão antes de salvar");
      return;
    }

    setSavingDefaultPrompt(true);
    try {
      const endpoint = "/api/admin/prompts";
      const method = defaultPromptCategory ? "PATCH" : "POST";
      const body = defaultPromptCategory
        ? {
            id: defaultPromptCategory.id,
            prompt_template: defaultPromptDraft,
            label: "Prompt Padrão",
            description: "Instruções globais aplicadas a todos os criativos",
            is_active: true,
          }
        : {
            slug: DEFAULT_PROMPT_SLUG,
            label: "Prompt Padrão",
            description: "Instruções globais aplicadas a todos os criativos",
            prompt_template: defaultPromptDraft,
          };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        showFeedback("err", data?.error ?? "Erro ao salvar Prompt Padrão");
        return;
      }

      showFeedback("ok", "Prompt Padrão salvo com sucesso");
      await loadCategories();
    } catch {
      showFeedback("err", "Erro de conexão ao salvar Prompt Padrão");
    } finally {
      setSavingDefaultPrompt(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Admin Master</h1>
            <p className="text-white/60 text-sm">
              Controle o Prompt Padrão e os prompts de cada categoria de criativo
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? "Cancelar" : "Nova Categoria"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.03] border border-white/8 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("prompts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "prompts"
              ? "bg-brand-500/15 text-brand-400"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Prompts
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "users"
              ? "bg-brand-500/15 text-brand-400"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Users className="w-4 h-4" />
          Usuários
        </button>
      </div>

      {activeTab === "users" ? (
        <UsersTab />
      ) : (
      <>
      {feedback && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium border ${
            feedback.type === "ok"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      <div className="bg-white/[0.03] border border-brand-500/20 rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              Prompt Padrão
            </h2>
            <p className="text-white/60 text-sm mt-1">
              Essa instrução global acompanha todos os prompts de categoria, junto com marca, logo, imóvel e formato selecionado.
            </p>
          </div>
          <span className="text-[11px] uppercase tracking-[0.18em] text-brand-300/70 border border-brand-400/20 px-3 py-1 rounded-full">
            Global
          </span>
        </div>

        <div>
          <p className="text-white/50 text-xs mb-2">
            Placeholders aceitos: {"{property_details}"}, {"{briefing}"}, {"{format}"}, {"{selected_size}"}, {"{aspect_ratio}"}, {"{headline}"}, {"{copy_text}"}, {"{cta_text}"}
          </p>
          <textarea
            rows={7}
            value={defaultPromptDraft}
            onChange={(e) => setDefaultPromptDraft(e.target.value)}
            placeholder="Defina aqui as instruções globais que devem sempre acompanhar a geração dos criativos."
            className="w-full bg-black/30 border border-white/8 rounded-xl px-4 py-3 text-white/80 text-sm font-mono leading-relaxed focus:outline-none focus:border-brand-500/40 resize-none transition-all"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-white/45 text-xs">
            Use este campo para orientar composição, linguagem visual, posicionamento de logo, regras gerais de branding e exigências que valem para qualquer categoria.
          </p>
          <button
            onClick={handleSaveDefaultPrompt}
            disabled={savingDefaultPrompt || defaultPromptDraft === (defaultPromptCategory?.prompt_template ?? "")}
            className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          >
            {savingDefaultPrompt ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar Prompt Padrão
          </button>
        </div>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="bg-white/[0.03] border border-brand-500/30 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            Nova Categoria
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">
                Slug (identificador único)
              </label>
              <input
                type="text"
                value={newCategory.slug}
                onChange={(e) =>
                  setNewCategory((prev) => ({
                    ...prev,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                  }))
                }
                placeholder="ex: cobertura"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-brand-500/60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">
                Nome da Categoria
              </label>
              <input
                type="text"
                value={newCategory.label}
                onChange={(e) =>
                  setNewCategory((prev) => ({ ...prev, label: e.target.value }))
                }
                placeholder="ex: Cobertura de Luxo"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-brand-500/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">
              Descrição
            </label>
            <input
              type="text"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="ex: Coberturas e penthouses exclusivos"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-brand-500/60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">
              Prompt Template
            </label>
            <p className="text-white/50 text-xs mb-2">
              Use {"{property_details}"}, {"{briefing}"} e {"{format}"} como
              placeholders. O Prompt Padrão será adicionado automaticamente junto com este conteúdo.
            </p>
            <textarea
              rows={5}
              value={newCategory.prompt_template}
              onChange={(e) =>
                setNewCategory((prev) => ({
                  ...prev,
                  prompt_template: e.target.value,
                }))
              }
              placeholder="Create a real estate advertisement image..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-brand-500/60 resize-none font-mono"
            />
          </div>

          <button
            onClick={handleAddCategory}
            disabled={addLoading}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            {addLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Criar Categoria
          </button>
        </div>
      )}

      {/* Category Cards */}
      <div className="space-y-4">
        {visibleCategories.map((cat) => {
          const isEdited =
            editedPrompts[cat.id] !== undefined &&
            editedPrompts[cat.id] !== cat.prompt_template;
          const icon = CATEGORY_ICONS[cat.slug] ?? "📌";

          return (
            <div
              key={cat.id}
              className={`bg-white/[0.03] border rounded-2xl overflow-hidden transition-all ${
                cat.is_active
                  ? "border-white/8"
                  : "border-red-500/20 opacity-60"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <h3 className="text-white font-bold">{cat.label}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-white/50 text-xs font-mono">
                        {cat.slug}
                      </span>
                      {cat.description && (
                        <>
                          <span className="text-white/15">·</span>
                          <span className="text-white/60 text-xs">
                            {cat.description}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Active toggle */}
                  <button
                    onClick={() => handleToggleActive(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      cat.is_active
                        ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                        : "text-red-400 bg-red-500/10 hover:bg-red-500/20"
                    }`}
                  >
                    {cat.is_active ? (
                      <ToggleRight className="w-4 h-4" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                    {cat.is_active ? "Ativo" : "Inativo"}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Desativar categoria"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Prompt Editor */}
              <div className="px-6 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-3.5 h-3.5 text-white/50" />
                  <span className="text-xs text-white/60 font-medium uppercase tracking-wide">
                    Prompt Template
                  </span>
                  <span className="text-white/20 text-xs">
                    — placeholders: {"{property_details}"} {"{briefing}"}{" "}
                    {"{format}"}
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={editedPrompts[cat.id] ?? cat.prompt_template}
                  onChange={(e) =>
                    setEditedPrompts((prev) => ({
                      ...prev,
                      [cat.id]: e.target.value,
                    }))
                  }
                  className="w-full bg-black/30 border border-white/8 rounded-xl px-4 py-3 text-white/80 text-sm font-mono leading-relaxed focus:outline-none focus:border-brand-500/40 resize-none transition-all"
                />
                {isEdited && (
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-amber-400/60 text-xs">
                      ⚠ Alterações não salvas
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setEditedPrompts((prev) => {
                            const next = { ...prev };
                            delete next[cat.id];
                            return next;
                          })
                        }
                        className="text-white/60 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
                      >
                        Descartar
                      </button>
                      <button
                        onClick={() => handleSavePrompt(cat)}
                        disabled={savingId === cat.id}
                        className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      >
                        {savingId === cat.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        Salvar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {visibleCategories.length === 0 && (
        <div className="text-center py-16">
          <Shield className="w-10 h-10 text-white/15 mx-auto mb-3" />
          <p className="text-white/60">Nenhuma categoria de prompt encontrada</p>
          <p className="text-white/25 text-sm mt-1">
            Clique em &quot;Nova Categoria&quot; para começar
          </p>
        </div>
      )}
      </>
      )}
    </div>
  );
}
