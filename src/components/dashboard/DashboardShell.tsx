"use client";

import { useState, useCallback } from "react";
import DashboardSidebar from "./Sidebar";
import DashboardTopbar from "./Topbar";
import type { User } from "@supabase/supabase-js";

interface DashboardShellProps {
  user: User;
  credits: number;
  profile: {
    full_name?: string | null;
    company_name?: string | null;
    avatar_url?: string | null;
    plans?: { name?: string } | null;
  } | null;
  userRole?: string | null;
  children: React.ReactNode;
}

export default function DashboardShell({
  user,
  credits,
  profile,
  userRole,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  return (
    <div className="min-h-screen bg-[#0f1729] flex">
      {/* Desktop sidebar */}
      <DashboardSidebar profile={profile} userRole={userRole} />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeSidebar}
          />
          <div className="relative z-10 h-full w-60 animate-in slide-in-from-left duration-200">
            <DashboardSidebar
              profile={profile}
              userRole={userRole}
              mobile
              onClose={closeSidebar}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar
          user={user}
          credits={credits}
          profile={profile}
          onMenuToggle={toggleSidebar}
        />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
