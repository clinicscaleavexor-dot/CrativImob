"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Search, Users } from "lucide-react";

interface UserRow {
  id: string;
  full_name: string | null;
  company_name: string | null;
  email: string | null;
  created_at: string;
  credits: number;
}

export default function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addCreditsModal, setAddCreditsModal] = useState<UserRow | null>(null);
  const [creditsAmount, setCreditsAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) setUsers(data.users ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.full_name?.toLowerCase().includes(q) ||
      u.company_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  async function handleAddCredits() {
    if (!addCreditsModal || !creditsAmount) return;
    const amount = parseInt(creditsAmount, 10);
    if (isNaN(amount) || amount <= 0) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: addCreditsModal.id, add_credits: amount }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "ok", msg: `${amount} crédito(s) adicionados para ${addCreditsModal.full_name ?? addCreditsModal.email}` });
        setUsers((prev) =>
          prev.map((u) =>
            u.id === addCreditsModal.id ? { ...u, credits: data.new_balance } : u
          )
        );
        setAddCreditsModal(null);
        setCreditsAmount("");
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({ type: "err", msg: data.error ?? "Erro ao adicionar créditos" });
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch {
      setFeedback({ type: "err", msg: "Erro de conexão" });
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setSaving(false);
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
    <div className="space-y-4">
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, empresa ou email..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-brand-500/50"
        />
      </div>

      {/* Stats */}
      <p className="text-white/50 text-xs">{users.length} usuário(s) cadastrado(s)</p>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-4 py-3 text-white/60 font-medium">Usuário</th>
                <th className="text-left px-4 py-3 text-white/60 font-medium">Email</th>
                <th className="text-center px-4 py-3 text-white/60 font-medium">Créditos</th>
                <th className="text-left px-4 py-3 text-white/60 font-medium">Cadastro</th>
                <th className="text-center px-4 py-3 text-white/60 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium truncate max-w-[180px]">
                      {u.full_name ?? "—"}
                    </p>
                    {u.company_name && (
                      <p className="text-white/50 text-xs truncate">{u.company_name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/70 truncate max-w-[200px]">
                    {u.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-yellow-400 font-bold">{u.credits}</span>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">
                    {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => {
                        setAddCreditsModal(u);
                        setCreditsAmount("");
                      }}
                      className="inline-flex items-center gap-1 text-xs bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 px-3 py-1.5 rounded-lg font-medium transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      Créditos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-8 h-8 text-white/15 mx-auto mb-2" />
            <p className="text-white/50 text-sm">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>

      {/* Add Credits Modal */}
      {addCreditsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#1a2236] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-white font-bold">Adicionar Créditos</h3>
            <p className="text-white/60 text-sm">
              Para: <span className="text-white font-medium">{addCreditsModal.full_name ?? addCreditsModal.email}</span>
            </p>
            <p className="text-white/50 text-xs">
              Saldo atual: <span className="text-yellow-400 font-bold">{addCreditsModal.credits}</span>
            </p>
            <input
              type="number"
              min="1"
              max="10000"
              value={creditsAmount}
              onChange={(e) => setCreditsAmount(e.target.value)}
              placeholder="Quantidade de créditos"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-brand-500/50"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setAddCreditsModal(null)}
                className="px-4 py-2 text-white/60 hover:text-white text-sm rounded-lg hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCredits}
                disabled={saving || !creditsAmount || parseInt(creditsAmount) <= 0}
                className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-black px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
