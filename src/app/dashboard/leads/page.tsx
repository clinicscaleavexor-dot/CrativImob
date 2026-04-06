"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Plus,
  Search,
  Users,
  Phone,
  Mail,
  X,
  MessageSquare,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string;
  notes: string | null;
  status: string;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: "Novo", color: "text-blue-400 bg-blue-400/10" },
  contacted: { label: "Contactado", color: "text-amber-400 bg-amber-400/10" },
  converted: { label: "Convertido", color: "text-emerald-400 bg-emerald-400/10" },
  lost: { label: "Perdido", color: "text-red-400 bg-red-400/10" },
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", source: "manual", notes: "" });

  const loadLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (res.ok) setLeads(data.leads ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    return (
      !q ||
      l.name.toLowerCase().includes(q) ||
      l.phone?.includes(q) ||
      l.email?.toLowerCase().includes(q)
    );
  });

  async function handleCreate() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setFeedback({ type: "ok", msg: "Lead adicionado com sucesso" });
        setShowForm(false);
        setForm({ name: "", phone: "", email: "", source: "manual", notes: "" });
        loadLeads();
      } else {
        const data = await res.json();
        setFeedback({ type: "err", msg: data.error ?? "Erro ao criar lead" });
      }
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback({ type: "err", msg: "Erro de conexão" });
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setSaving(false);
    }
  }

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    converted: leads.filter((l) => l.status === "converted").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Leads</h1>
          <p className="text-white/60 text-sm">
            Gerencie seus contatos e oportunidades
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancelar" : "Novo Lead"}
        </button>
      </div>

      {/* Feedback */}
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

      {/* Stats */}
      {leads.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-white" },
            { label: "Novos", value: stats.new, color: "text-blue-400" },
            { label: "Contactados", value: stats.contacted, color: "text-amber-400" },
            { label: "Convertidos", value: stats.converted, color: "text-emerald-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Lead Form */}
      {showForm && (
        <div className="bg-white/[0.03] border border-brand-500/30 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Novo Lead</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Nome *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nome completo"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-brand-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Telefone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-brand-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="email@exemplo.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-brand-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Origem</label>
              <select
                value={form.source}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500/50"
              >
                <option value="manual">Manual</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="site">Site</option>
                <option value="indicacao">Indicação</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Observações</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Anotações sobre o lead..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-brand-500/50 resize-none"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={saving || !form.name.trim()}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Adicionar Lead
          </button>
        </div>
      )}

      {/* Search */}
      {leads.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, telefone ou email..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-brand-500/50"
          />
        </div>
      )}

      {/* Leads List */}
      {leads.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/8 border-dashed rounded-2xl p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-white/50" />
          </div>
          <p className="text-white/70 font-medium mb-1">Nenhum lead cadastrado</p>
          <p className="text-white/50 text-sm mb-6">
            Adicione seus primeiros contatos e oportunidades
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Adicionar lead
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => {
            const statusCfg = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG.new;
            return (
              <div
                key={lead.id}
                className="bg-white/[0.03] border border-white/8 rounded-xl p-4 hover:border-white/15 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-semibold text-sm truncate">{lead.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-white/50 text-xs">
                      {lead.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </span>
                      )}
                      {lead.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </span>
                      )}
                      {lead.notes && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {lead.notes.length > 50 ? lead.notes.slice(0, 50) + "..." : lead.notes}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-white/40 text-xs flex-shrink-0">
                    {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white/50 text-sm">Nenhum lead encontrado com essa busca</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
