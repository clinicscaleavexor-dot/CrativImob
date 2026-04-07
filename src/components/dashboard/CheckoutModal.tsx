"use client";

import { useState } from "react";
import {
  X,
  Loader2,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ExternalLink,
} from "lucide-react";

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

export default function CheckoutModal({ plan, onClose, onSuccess }: CheckoutModalProps) {
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const price = (plan.price_cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });

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
      setError("CPF ou CNPJ inválido. Verifique e tente novamente.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, cpfCnpj: digits }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar assinatura. Tente novamente.");
        return;
      }

      // Redirect to Asaas payment page
      if (data.invoiceUrl) {
        setRedirecting(true);
        window.open(data.invoiceUrl, "_blank");
        // Show success after redirect
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        // No invoiceUrl — still created, show success
        onSuccess();
      }
    } catch {
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  /* ─── Redirecting state ─── */
  if (redirecting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mb-4">
            <ExternalLink className="w-8 h-8 text-brand-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Redirecionando para pagamento</h2>
          <p className="text-gray-500 text-sm">
            Uma nova aba foi aberta com a página de pagamento do Asaas.
            Após concluir o pagamento, seus créditos serão liberados automaticamente.
          </p>
          <button
            onClick={onSuccess}
            className="mt-4 text-sm text-brand-500 hover:text-brand-600 font-medium"
          >
            Fechar e voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Top accent band */}
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-400 via-brand-500 to-blue-500" />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4">
          <div>
            <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-1">
              Finalizar assinatura
            </p>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              Plano {plan.name}
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">
              R$ {price}
              <span className="text-gray-400">/mês</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan highlights */}
        <div className="mx-6 mb-4 bg-brand-50 border border-brand-100 rounded-2xl px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-brand-700">
            <Zap className="w-4 h-4 text-brand-500" />
            <span><strong>{plan.credits_per_month}</strong> créditos/mês</span>
          </div>
          <div className="w-px h-4 bg-brand-200" />
          <div className="flex items-center gap-2 text-sm text-brand-700">
            <ShieldCheck className="w-4 h-4 text-brand-500" />
            <span>Cancele quando quiser</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">

          {/* CPF/CNPJ */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              CPF ou CNPJ
            </label>
            <input
              type="text"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
              maxLength={18}
              placeholder="000.000.000-00"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all text-sm"
              required
            />
          </div>

          {/* Info about payment */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-xs text-blue-700">
              Você será redirecionado para a página de pagamento segura do Asaas, 
              onde poderá escolher entre PIX, Boleto ou Cartão de Crédito.
            </p>
          </div>

          {/* Order summary */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Resumo do pedido
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Plano</span>
              <span className="font-semibold text-gray-800">{plan.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Créditos por mês</span>
              <span className="font-semibold text-gray-800">{plan.credits_per_month} créditos</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Imóveis</span>
              <span className="font-semibold text-gray-800">
                {plan.max_properties === -1 ? "Ilimitados" : `Até ${plan.max_properties}`}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-2.5 flex justify-between items-baseline">
              <span className="text-gray-700 font-semibold">Total mensal</span>
              <div className="text-right">
                <span className="text-xl font-black text-gray-900">R$ {price}</span>
                <span className="text-xs text-gray-400 ml-1">/mês</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <span className="mt-0.5 text-red-500 shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all disabled:opacity-60 bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white flex items-center justify-center gap-2 shadow-md shadow-brand-500/25"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Criando assinatura...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Ir para pagamento · R$ {price}
              </>
            )}
          </button>

          <p className="text-[11px] text-gray-400 text-center leading-relaxed">
            Pagamento processado com segurança via{" "}
            <span className="font-semibold text-gray-500">Asaas</span>. Cancele a qualquer momento.
          </p>
        </form>
      </div>
    </div>
  );
}
