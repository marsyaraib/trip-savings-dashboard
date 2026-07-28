"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { relativeTimeID } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import type { ActivityLog } from "@/types";

const TYPE_ICON: Record<ActivityLog["activity_type"], string> = {
  payment_added: "🟢",
  proof_uploaded: "🟢",
  milestone_reached: "🎖️",
  month_completed: "🎉",
  target_completed: "🏆",
};

export function ActivityFeed({ logs }: { logs: ActivityLog[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Belum ada aktivitas"
            description="Aktivitas akan muncul di sini setiap kali ada transaksi baru."
          />
        ) : (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {logs.slice(0, 12).map((log) => (
                <motion.li
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-3 text-sm"
                >
                  <span className="mt-0.5">{TYPE_ICON[log.activity_type]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-700 dark:text-slate-300">{log.activity}</p>
                    <p className="text-xs text-slate-400">{relativeTimeID(log.created_at)}</p>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
