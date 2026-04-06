"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Images,
  Download,
  Filter,
  Wand2,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  Trash2,
} from "lucide-react";
import type { Tables } from "@/types/database";
import { downloadImage } from "@/lib/download-image";
import { useRouter } from "next/navigation";

type Creative = Tables<"creatives"> & {
  properties: Pick<Tables<"properties">, "title" | "type"> | null;
  templates: Pick<Tables<"templates">, "name"> | null;
};

const FORMAT_LABELS: Record<string, string> = {
  "1080x1080": "Post",
  "1080x1920": "Stories",
  "1200x628": "Tráfego",
};

const TYPE_LABELS: Record<string, string> = {
  post: "Feed",
  story: "Story",
  trafego_pago: "Tráfego Pago",
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.FC<{ className?: string }>; color: string }> = {
  completed: {
    label: "Concluído",
    icon: CheckCircle2,
    color: "text-emerald-400 bg-emerald-400/10",
  },
  processing: {
    label: "Processando",
    icon: Loader2,
    color: "text-amber-400 bg-amber-400/10",
  },
  failed: {
    label: "Falhou",
    icon: XCircle,
    color: "text-red-400 bg-red-400/10",
  },
  pending: {
    label: "Pendente",
    icon: Clock,
    color: "text-white/60 bg-white/5",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface CriativosClientProps {
  initialCreatives: Creative[];
}

export default function CriativosClient({ initialCreatives }: CriativosClientProps) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFormat, setFilterFormat] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Excluir este criativo?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/creatives/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = initialCreatives.filter((c) => {
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    const matchFormat = filterFormat === "all" || c.format === filterFormat;
    return matchStatus && matchFormat;
  });

  const stats = {
    total: initialCreatives.length,
    completed: initialCreatives.filter((c) => c.status === "completed").length,
    processing: initialCreatives.filter((c) => c.status === "processing").length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Criativos</h1>
          <p className="text-white/60 text-sm">{stats.total} criativo{stats.total !== 1 ? "s" : ""} gerado{stats.total !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/dashboard/criar"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
        >
          <Wand2 className="w-4 h-4" />
          Novo criativo
        </Link>
      </div>

      {/* Stats */}
      {stats.total > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-white" },
            { label: "Concluídos", value: stats.completed, color: "text-emerald-400" },
            { label: "Processando", value: stats.processing, color: "text-amber-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      {initialCreatives.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/50" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500/50 transition-all"
            >
              <option value="all">Todos os status</option>
              <option value="completed">Concluídos</option>
              <option value="processing">Processando</option>
              <option value="failed">Falhou</option>
            </select>
          </div>
          <select
            value={filterFormat}
            onChange={(e) => setFilterFormat(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500/50 transition-all"
          >
            <option value="all">Todos os formatos</option>
            <option value="1080x1080">Post (1080×1080)</option>
            <option value="1080x1920">Stories (1080×1920)</option>
            <option value="1200x628">Tráfego (1200×628)</option>
          </select>
        </div>
      )}

      {/* Grid */}
      {initialCreatives.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/8 border-dashed rounded-2xl p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Images className="w-6 h-6 text-white/50" />
          </div>
          <p className="text-white/70 font-medium mb-1">Nenhum criativo gerado ainda</p>
          <p className="text-white/50 text-sm mb-6">
            Crie seu primeiro criativo imobiliário com inteligência artificial
          </p>
          <Link
            href="/dashboard/criar"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all"
          >
            <Wand2 className="w-4 h-4" />
            Criar agora
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-12 text-center">
          <p className="text-white/70">Nenhum criativo com estes filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const statusCfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.pending;
            const StatusIcon = statusCfg.icon;
            const formatLabel = FORMAT_LABELS[c.format] ?? c.format;
            const typeLabel = TYPE_LABELS[c.type] ?? c.type;

            return (
              <div
                key={c.id}
                className="group bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all"
              >
                {/* Image */}
                <div className="relative aspect-square bg-white/5">
                  {c.image_url ? (
                    <Image
                      src={c.image_url}
                      alt={c.headline ?? "Criativo"}
                      fill
                      className="object-cover"
                      unoptimized={c.image_url.startsWith("data:")}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      {c.status === "processing" ? (
                        <>
                          <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
                          <p className="text-white/50 text-xs">Processando...</p>
                        </>
                      ) : (
                        <>
                          <Images className="w-8 h-8 text-white/15" />
                          <p className="text-white/25 text-xs">
                            {c.status === "failed" ? "Falhou" : "Sem imagem"}
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Overlay on hover */}
                  {c.image_url && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(c.image_url!, `criativo-${c.id}.png`);
                        }}
                        className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Baixar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(c.id);
                        }}
                        disabled={deletingId === c.id}
                        className="flex items-center gap-1.5 bg-red-500/80 hover:bg-red-500 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deletingId === c.id ? "..." : "Excluir"}
                      </button>
                    </div>
                  )}

                  {/* Format badge */}
                  <div className="absolute top-2 left-2">
                    <span className="text-xs bg-black/60 backdrop-blur-sm text-white/70 px-2 py-0.5 rounded-full">
                      {formatLabel}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white font-semibold text-sm leading-tight line-clamp-2">
                      {c.headline || c.properties?.title || "Sem título"}
                    </p>
                    <span
                      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${statusCfg.color}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/50">
                    <div className="flex items-center gap-1.5">
                      {c.templates?.name && (
                        <span>{c.templates.name}</span>
                      )}
                      {c.templates?.name && <span>·</span>}
                      <span>{typeLabel}</span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(c.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
