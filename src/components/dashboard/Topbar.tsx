import { Zap } from "lucide-react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

interface TopbarProps {
  user: User;
  credits: number;
  profile: {
    full_name?: string | null;
    company_name?: string | null;
  } | null;
}

export default function DashboardTopbar({ credits }: TopbarProps) {
  return (
    <header className="h-14 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-6 flex-shrink-0">
      <div />
      <div className="flex items-center gap-4">
        {/* Créditos */}
        <Link
          href="/dashboard/plano"
          className="flex items-center gap-1.5 bg-yellow-400/8 hover:bg-yellow-400/15 border border-yellow-400/15 px-3 py-1.5 rounded-lg transition-all"
        >
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-yellow-400 text-xs font-bold">{credits}</span>
          <span className="text-yellow-400/60 text-xs">créditos</span>
        </Link>
      </div>
    </header>
  );
}
