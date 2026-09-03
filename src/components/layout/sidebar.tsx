"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Building2,
  FileText,
  Calendar,
  CalendarDays,
  Wrench,
  ClipboardCheck,
  FileCheck2,
  Navigation,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  User,
  Layers,
  KeyRound,
  Radio,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockActionRequired } from "@/lib/data";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: string;
  isLive?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const criticalCount = mockActionRequired.filter(
    (a) => a.priority === "CRITICAL",
  ).length;

  const navSections: NavSection[] = [
    {
      title: "OVERVIEW",
      items: [
        {
          name: "Dashboard",
          href: "/",
          icon: LayoutDashboard,
          badge: criticalCount > 0 ? `${criticalCount} alert` : undefined,
          badgeVariant: "critical",
        },
      ],
    },
    {
      title: "CUSTOMER",
      items: [
        {
          name: "Customers",
          href: "/corporate/customers",
          icon: User,
        },
      ],
    },
    {
      title: "RENTAL",
      items: [
        {
          name: "Reservations",
          href: "/operations/reservations",
          icon: Calendar,
          badge: "New",
          badgeVariant: "default",
        },
        {
          name: "Contracts",
          href: "/operations/contracts",
          icon: FileText,
          badge: "1 Shortage",
          badgeVariant: "critical",
        },
        {
          name: "Rentals",
          href: "/operations/rentals",
          icon: KeyRound,
        },
      ],
    },
    {
      title: "SCHEDULE",
      items: [
        {
          name: "Schedule (Jadwal)",
          href: "/schedule",
          icon: CalendarDays,
          badge: "6 Events",
        },
      ],
    },
    {
      title: "FLEET",
      items: [
        {
          name: "Command Center",
          href: "/operations/command-center",
          icon: Radio,
          badge: "Live",
          badgeVariant: "critical",
          isLive: true,
        },
        {
          name: "Vehicles",
          href: "/fleet",
          icon: Car,
        },
        {
          name: "Inspection",
          href: "/operations/inspections",
          icon: ClipboardCheck,
          badge: "4 Due",
        },
        {
          name: "Maintenance",
          href: "/operations/maintenance",
          icon: Wrench,
          badge: "3 Due",
        },
        {
          name: "Documents",
          href: "/operations/documents",
          icon: FileCheck2,
          badge: "2 Exp",
          badgeVariant: "critical",
        },
        {
          name: "GPS Monitoring",
          href: "/operations/gps",
          icon: Navigation,
          isLive: true,
        },
      ],
    },
    {
      title: "VENDOR",
      items: [
        {
          name: "Vendors",
          href: "/vendors",
          icon: Building2,
        },
      ],
    },
    {
      title: "REPORTS",
      items: [
        {
          name: "Analytics & Fleet Reports",
          href: "/reports",
          icon: BarChart3,
        },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-neutral-200/80 bg-white transition-all duration-300 z-30 select-none",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between px-3.5 border-b border-neutral-200/80">
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 text-white font-bold text-sm tracking-tight shadow-xs">
              JR
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs tracking-tight text-neutral-900 flex items-center gap-1.5">
                Jaja-Rent
                <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                  OPS
                </span>
              </span>
              <span className="text-[10px] text-neutral-400 font-medium leading-none">
                Fleet Operations Platform
              </span>
            </div>
          </Link>
        ) : (
          <Link
            href="/"
            className="flex h-8 w-8 mx-auto items-center justify-center rounded-md bg-neutral-900 text-white font-bold text-xs"
          >
            JR
          </Link>
        )}

        <button
          onClick={onToggle}
          className="hidden md:flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <h4 className="px-2.5 text-[10px] font-semibold text-neutral-400 tracking-wider uppercase">
                {section.title}
              </h4>
            )}
            <div className="space-y-0.5">
              {section.items.map((item, itemIdx) => {
                let isActive = false;
                if (item.href === "/") {
                  isActive = pathname === "/";
                } else if (item.href === "/fleet") {
                  isActive =
                    (pathname === "/fleet" || pathname.startsWith("/fleet/")) &&
                    !pathname.startsWith("/fleet/schedule");
                } else if (
                  item.href === "/schedule" ||
                  item.href === "/fleet/schedule"
                ) {
                  isActive =
                    pathname.startsWith("/schedule") ||
                    pathname.startsWith("/fleet/schedule");
                } else {
                  isActive = pathname.startsWith(item.href.split("?")[0]);
                }

                const Icon = item.icon;

                return (
                  <Link
                    key={`${section.title}-${item.name}-${itemIdx}`}
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all group",
                      isActive
                        ? "bg-neutral-900 text-white shadow-xs"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-white"
                          : "text-neutral-500 group-hover:text-neutral-900",
                      )}
                    />

                    {!collapsed && (
                      <span className="flex-1 truncate">{item.name}</span>
                    )}

                    {!collapsed && item.isLive && (
                      <span className="flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        LIVE
                      </span>
                    )}

                    {!collapsed && item.badge && !item.isLive && (
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-1.5 py-0.2 rounded shrink-0",
                          item.badgeVariant === "critical"
                            ? isActive
                              ? "bg-rose-500 text-white"
                              : "bg-rose-100 text-rose-700"
                            : item.badgeVariant === "warning"
                              ? isActive
                                ? "bg-amber-400 text-neutral-900"
                                : "bg-amber-100 text-amber-800"
                              : isActive
                                ? "bg-neutral-700 text-white"
                                : "bg-neutral-100 text-neutral-700",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Operational Mode Tag / Footer */}
      {!collapsed ? (
        <div className="p-3 border-t border-neutral-200/80 bg-neutral-50/70">
          <div className="flex items-center justify-between text-[11px] text-neutral-600">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Jakarta Dispatch Hub
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              v2.4.0
            </span>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-neutral-200/80 flex justify-center">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
      )}
    </aside>
  );
}
