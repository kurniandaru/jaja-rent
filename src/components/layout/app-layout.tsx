"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGpsPage = pathname?.startsWith("/operations/gps");

  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Auto-collapse sidebar when on Live GPS page to maximize map canvas
  React.useEffect(() => {
    if (isGpsPage) {
      setCollapsed(true);
    }
  }, [isGpsPage]);

  return (
    <div className="flex min-h-screen w-full bg-neutral-50/60 font-sans text-neutral-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex w-64 flex-col bg-white shadow-xl">
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main
          className={cn(
            "flex-1 overflow-y-auto w-full mx-auto",
            isGpsPage ? "p-0 max-w-none flex flex-col" : "p-4 sm:p-6 lg:p-8 max-w-7xl space-y-6"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
