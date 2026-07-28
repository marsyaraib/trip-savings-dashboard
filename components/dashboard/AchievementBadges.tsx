"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMember } from "@/constants/members";
import { getEarnedBadges } from "@/utils/achievements";
import type { MemberSummary } from "@/types";
import { motion } from "framer-motion";

export function AchievementBadges({ summaries }: { summaries: MemberSummary[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pencapaian</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {summaries.map((summary) => {
          const member = getMember(summary.member_name);
          const badges = getEarnedBadges(summary.totalSaved);
          return (
            <div key={summary.member_name} className="flex items-center gap-3">
              <span
                className={`w-16 shrink-0 truncate text-xs font-semibold bg-gradient-to-br ${member?.colorClass} bg-clip-text text-transparent`}
              >
                {summary.member_name}
              </span>
              <div className="flex flex-1 flex-wrap gap-1.5">
                {badges.length === 0 ? (
                  <span className="text-xs text-slate-400">Belum ada badge</span>
                ) : (
                  badges.map((b, i) => (
                    <motion.span
                      key={`${summary.member_name}-${b.label}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.05, type: "spring" }}
                      title={b.label}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-base dark:bg-slate-800"
                    >
                      {b.badge}
                    </motion.span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
