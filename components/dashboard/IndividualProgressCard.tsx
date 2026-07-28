"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, clampPercentage } from "@/lib/utils";
import { getMember, type Member } from "@/constants/members";
import { STATUS_EMOJI, STATUS_LABEL } from "@/utils/calculations";
import type { MemberSummary } from "@/types";

export function IndividualProgressCard({ summary, members }: { summary: MemberSummary; members: Member[] }) {
  const member = getMember(members, summary.member_name);
  const percentage = clampPercentage(summary.percentage);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11">
            <AvatarFallback className={member?.colorClass}>{member?.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900 dark:text-slate-50">
              {member?.displayName ?? summary.member_name}
            </p>
            <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              {STATUS_EMOJI[summary.status]} {STATUS_LABEL[summary.status]}
            </p>
          </div>
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {percentage.toFixed(0)}%
          </span>
        </div>

        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="mt-4 origin-left">
          <Progress value={percentage} />
        </motion.div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {formatCurrency(summary.totalSaved)}
          </span>
          <span className="text-slate-400">dari {formatCurrency(summary.target)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
