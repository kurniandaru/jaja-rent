"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Plus,
  ChevronRight,
  ShieldAlert,
  CalendarCheck,
  Wrench,
  Car,
  ClipboardList,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockActionRequired } from "@/lib/data";

interface TopbarProps {
  onMobileMenuToggle?: () => void;
}

export function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");

  // Build breadcrumb segments
  const segments = pathname.split("/").filter(Boolean);

  const criticalCount = mockActionRequired.filter(
    (a) => a.priority === "CRITICAL",
  ).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/fleet?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-neutral-200/80 bg-white/95 px-4 backdrop-blur-xs">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100"
        >
          <Menu className="h-4 w-4" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center text-xs">
          <Link
            href="/"
            className="font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Operations
          </Link>

          {segments.map((seg, index) => {
            const path = `/${segments.slice(0, index + 1).join("/")}`;
            const isLast = index === segments.length - 1;
            const formatted = seg.replace(/-/g, " ");

            return (
              <React.Fragment key={path}>
                <ChevronRight className="mx-1.5 h-3.5 w-3.5 text-neutral-400" />
                {isLast ? (
                  <span className="font-semibold text-neutral-900 capitalize">
                    {formatted}
                  </span>
                ) : (
                  <Link
                    href={path}
                    className="font-medium text-neutral-500 hover:text-neutral-900 capitalize transition-colors"
                  >
                    {formatted}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Search, Alerts, Quick Actions & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Global Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative hidden sm:block"
        >
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <Input
            type="search"
            placeholder="Search plate, customer, contract..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-60 md:w-72 pl-8 pr-3 text-xs bg-neutral-50/80 border-neutral-200 focus:bg-white focus:w-80 transition-all rounded-md"
          />
        </form>

        {/* Action Required Alerts Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative h-8 w-8 rounded-md text-neutral-600"
            >
              <Bell className="h-4 w-4" />
              {criticalCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                  {criticalCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2">
            <DropdownMenuLabel className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold text-neutral-900">
                Action Required ({mockActionRequired.length})
              </span>
              <span className="text-[10px] text-rose-600 font-semibold uppercase">
                {criticalCount} Critical
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-72 overflow-y-auto space-y-1 py-1">
              {mockActionRequired.slice(0, 4).map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => router.push(action.actionUrl)}
                  className="flex flex-col items-start gap-1 p-2 cursor-pointer rounded-md hover:bg-neutral-50"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-xs text-neutral-900 line-clamp-1">
                      {action.title}
                    </span>
                    <span className="text-[10px] text-neutral-400 shrink-0">
                      {action.dueText}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 line-clamp-2">
                    {action.description}
                  </p>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <div className="p-1">
              <Button
                variant="subtle"
                size="xs"
                className="w-full text-center text-neutral-700"
                onClick={() => router.push("/#action-required")}
              >
                View all in Dashboard
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Action Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1.5 h-8 font-medium">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Action</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1">
            <DropdownMenuLabel className="text-[11px] text-neutral-400">
              Quick Operations
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => router.push("/operations/inspection")}
              className="gap-2 text-xs"
            >
              <ClipboardList className="h-3.5 w-3.5 text-neutral-500" />
              Log Vehicle Inspection
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/operations/maintenance")}
              className="gap-2 text-xs"
            >
              <Wrench className="h-3.5 w-3.5 text-neutral-500" />
              Book Workshop Service
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(
                  "/corporate/contracts/CTR-2026-001?action=replacement",
                )
              }
              className="gap-2 text-xs text-rose-600 font-medium"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
              Assign Replacement Unit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/#fleet-availability")}
              className="gap-2 text-xs"
            >
              <CalendarCheck className="h-3.5 w-3.5 text-neutral-500" />
              Check Fleet Availability
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-semibold text-white">
            DO
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold leading-tight text-neutral-900">
              Dimas Ops
            </span>
            <span className="text-[10px] text-neutral-400 leading-none">
              Fleet Lead
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
