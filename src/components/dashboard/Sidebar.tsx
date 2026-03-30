"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ImageIcon,
  Building2,
  User,
  CreditCard,
  Plus,
  LogOut,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Início", icon: Home, exact: true },
  { href: "/dashboard/criativos", label: "Criativos", icon: ImageIcon },
  { href: "/dashboard/imoveis", label: "Imóveis", icon: Building2 },
  { href: "/dashboard/perfil", label: "Perfil & Marca", icon: User },
  { href: "/dashboard/plano", label: "Plano", icon: CreditCard },
];

interface SidebarProps {
  profile: {
    full_name?: string | null;
    company_name?: string | null;
    avatar_url?: string | null;
    plans?: { name?: string } | null;
  } | null;
  userRole?: string | null;
}

export default function DashboardSidebar({ profile, userRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex w-60 flex-shrink-0 flex-col bg-white/[0.02] border-r border-white/5 min-h-screen">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">CriativImob</span>
        </Link>
      </div>

      {/* CTA criar */}
      <div className="p-4">
        <Link
          href="/dashboard/criar"
          className="flex items-center justify-center gap-2 w-full bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo criativo
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-brand-500/15 text-brand-400"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}

        {/* Admin Link */}
        {userRole === "admin" && (
          <Link
            href="/dashboard/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mt-2 border-t border-white/5 pt-3 ${
              pathname.startsWith("/dashboard/admin")
                ? "bg-amber-500/15 text-amber-400"
                : "text-amber-500/50 hover:text-amber-400 hover:bg-amber-500/10"
            }`}
          >
            <Shield className="w-4 h-4 flex-shrink-0" />
            Admin Master
          </Link>
        )}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-brand-400 text-xs font-bold">
              {profile?.full_name?.charAt(0)?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">
              {profile?.full_name ?? "Usuário"}
            </p>
            <p className="text-white/60 text-xs truncate capitalize">
              Plano {(profile?.plans as { name?: string } | null)?.name ?? "free"}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full text-white/60 hover:text-white/70 text-xs px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair
        </button>
      </div>
    </aside>
  );
}
