"use client";

import { useState } from "react";
import { Download, Trash2, ImageIcon } from "lucide-react";
import { downloadImage } from "@/lib/download-image";
import { useRouter } from "next/navigation";

interface Creative {
  id: string;
  title: string | null;
  type: string;
  status: string;
  created_at: string;
  image_url: string | null;
}

export default function CreativeCard({ creative }: { creative: Creative }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Excluir este criativo?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/creatives/${creative.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  async function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    if (creative.image_url) {
      await downloadImage(creative.image_url, `criativo-${creative.id}.png`);
    }
  }

  return (
    <div className="group relative bg-white/[0.04] border border-white/8 rounded-xl overflow-hidden hover:border-white/20 transition-all">
      <div className="aspect-square bg-gradient-to-br from-brand-900/50 to-blue-900/30 flex items-center justify-center">
        {creative.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={creative.image_url}
            alt={creative.title ?? "Criativo"}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon className="w-8 h-8 text-white/20" />
        )}

        {/* Overlay with actions */}
        {creative.image_url && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 bg-red-500/80 hover:bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleting ? "..." : "Excluir"}
            </button>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-white text-sm font-medium truncate">
          {creative.title ?? "Criativo sem título"}
        </p>
        <p className="text-white/60 text-xs mt-0.5">{creative.type?.replace("_", " ")}</p>
      </div>
    </div>
  );
}
