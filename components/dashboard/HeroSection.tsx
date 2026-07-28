"use client";

import { motion } from "framer-motion";
import { TRIP_DEADLINE } from "@/constants/savings";
import { daysUntil } from "@/lib/utils";
import type { Member } from "@/constants/members";

function joinNames(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}

export function HeroSection({ members }: { members: Member[] }) {
  const days = daysUntil(TRIP_DEADLINE);
  const names = joinNames(members.map((m) => m.displayName));

  return (
    <motion.section
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="hero-glow glass relative overflow-hidden rounded-3xl border border-slate-200/70 p-6 dark:border-slate-800/70 md:p-10"
    >
      {/* Hanging paper lanterns — dark mode only */}
      <div className="pointer-events-none absolute inset-x-0 top-0 hidden justify-evenly px-10 pt-1 dark:flex">
        <div className="lantern-deco">
          <div className="cap" />
          <div className="body" />
          <div className="tassel" />
        </div>
        <div className="lantern-deco">
          <div className="cap" />
          <div className="body" />
          <div className="tassel" />
        </div>
        <div className="lantern-deco">
          <div className="cap" />
          <div className="body" />
          <div className="tassel" />
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="seal h-7 w-7 rounded-md text-sm font-bold">財</span>
            <p className="text-xs font-semibold uppercase tracking-widest text-lacquer-600 dark:text-lacquer-400">
              Tabungan Bersama
            </p>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
            ✈️ Overseas Trip Savings
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {names} menabung bersama untuk perjalanan ke luar negeri.
          </p>
          <div className="fret-divider mt-4 max-w-[220px]" />
        </div>

        <div className="flex flex-col items-center rounded-2xl border border-lacquer-200/70 bg-white/70 px-6 py-4 text-center shadow-sm dark:border-lacquer-500/20 dark:bg-slate-900/70">
          <motion.span
            key={days}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-4xl font-bold tabular-nums text-lacquer-600 dark:text-lacquer-400"
          >
            {days}
          </motion.span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">hari lagi</span>
          <span className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
            Target selesai Desember 2027
          </span>
        </div>
      </div>
    </motion.section>
  );
}
