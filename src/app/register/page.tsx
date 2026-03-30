"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          company_name: form.companyName || null,
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        setError("Este e-mail já está cadastrado. Tente fazer login.");
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Redireciona direto para o dashboard (Supabase auto-confirm em dev)
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#060b14] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Conta criada!</h2>
          <p className="text-white/50">Redirecionando para o dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060b14] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">CriativImob</span>
          </Link>
          <h1 className="text-2xl font-black text-white mb-2">Criar conta grátis</h1>
          <p className="text-white/50 text-sm">5 criativos gratuitos para começar. Sem cartão.</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Seu nome <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={form.fullName}
                onChange={handleChange}
                placeholder="João Silva"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Imobiliária / Empresa{" "}
                <span className="text-white/30 font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="Imobiliária XYZ"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                E-mail <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Senha <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="mínimo 8 caracteres"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-500/60 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Criando conta..." : "Criar conta grátis"}
            </button>

            <p className="text-center text-white/30 text-xs">
              Ao criar conta, você concorda com nossos{" "}
              <span className="text-white/50">termos de uso</span>.
            </p>
          </form>
        </div>

        <p className="text-center text-white/40 text-sm mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
