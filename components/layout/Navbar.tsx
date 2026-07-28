"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, History, BarChart3, Users, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/add", label: "Tambah", icon: PlusCircle },
  { href: "/history", label: "Riwayat", icon: History },
  { href: "/statistics", label: "Statistik", icon: BarChart3 },
  { href: "/members", label: "Anggota", icon: Users },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop top navbar */}
      <header className="sticky top-0 z-40 hidden border-b border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-950/80 md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-50">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
              <Plane className="h-4 w-4" />
            </span>
            Overseas Trip Savings
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile top bar (title + theme toggle) */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-950/80 md:hidden">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-50">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
            <Plane className="h-3.5 w-3.5" />
          </span>
          Trip Savings
        </Link>
        <ThemeToggle />
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200/70 bg-white/90 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-950/90 md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
