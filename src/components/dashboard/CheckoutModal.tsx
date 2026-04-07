"use client";

import { useState } from "react";
import { X, CreditCard, Loader2, QrCode, FileText } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  slug: string | null;
  price_cents: number;
  credits_per_month: number;
  max_properties: number;
  features: string[];
}

interface CheckoutModalProps {
  plan: Plan;
  onClose: () => void;
  onSuccess: () => void;
}

const BILLING_TYPES = [
  { value: "PIX", label: "PIX", icon: QrCode, desc: "Aprovação instantânea" },
  { value: "CREDIT_CARD", label: "Cartão de Crédito", icon: CreditCard, desc: "Aprovação imediata" },
  { value: "BOLETO", label: "Boleto", icon: FileText, desc: "Até 3 dias úteis" },
] as const;

export default function CheckoutModal({ plan, onClose, onSuccess }: CheckoutModalProps) {
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [billingType, setBillingType] = useState<string>("PIX");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function formatCpfCnpj(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 11) {
      return digits
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return digits
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const digits = cpfCnpj.replace(/\D/g, "");
    if (digits.length !== 11 && digits.length !== 14) {
      setError("CPF ou CNPJ inválido");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          cpfCnpj: digits,
          billingType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar assinatura");
        return;
      }

      onSuccess();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0e1117] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <div>
            <h2 className="text-lg font-bold text-white">Assinar {plan.name}</h2>
            <p className="text-white/50 text-sm mt-0.5">
              R$ {(plan.price_cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/8 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* CPF/CNPJ */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              CPF ou CNPJ
            </label>
            <input
              type="text"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
              maxLength={18}
              placeholder="000.000.000-00"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all"
              required
            />
          </div>

          {/* Billing type */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Forma de pagamento
            </label>
            <div className="grid grid-cols-3 gap-2">
              {BILLING_TYPES.map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setBillingType(value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center ${
                    billingType === value
                      ? "border-brand-500/50 bg-brand-500/10 text-brand-400"
                      : "border-white/8 bg-white/[0.02] text-white/50 hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                  <span className="text-[10px] text-white/40">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Plano</span>
              <span className="text-white font-medium">{plan.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Créditos/mês</span>
              <span className="text-white font-medium">{plan.credits_per_month}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Imóveis</span>
              <span className="text-white font-medium">
                {plan.max_properties === -1 ? "Ilimitados" : `Até ${plan.max_properties}`}
              </span>
            </div>
            <div className="border-t border-white/8 pt-2 mt-2 flex justify-between">
              <span className="text-white/80 font-medium">Total mensal</span>
              <span className="text-white font-bold">
                R$ {(plan.price_cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Confirmar assinatura"
            )}
          </button>

          <p className="text-[11px] text-white/30 text-center">
            Ao confirmar, você concorda com os termos de uso. A cobrança será processada via Asaas.
          </p>
        </form>
      </div>
    </div>
  );
}
