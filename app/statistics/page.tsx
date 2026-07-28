"use client";

import { MonthlySavingsChart } from "@/components/statistics/MonthlySavingsChart";
import { MemberContributionChart } from "@/components/statistics/MemberContributionChart";
import { GroupProgressRadial } from "@/components/statistics/GroupProgressRadial";
import { ContributionPieChart } from "@/components/statistics/ContributionPieChart";
import { DashboardSkeleton } from "@/components/shared/DashboardSkeleton";
import { useSavingsData } from "@/hooks/useSavingsData";
import { getTargetGroup } from "@/constants/savings";

export default function StatisticsPage() {
  const { payments, members, isLoading } = useSavingsData();

  if (isLoading) return <DashboardSkeleton />;

  const targetGroup = getTargetGroup(members.length);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Statistik</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlySavingsChart payments={payments} />
        <MemberContributionChart payments={payments} members={members} />
        <GroupProgressRadial payments={payments} targetGroup={targetGroup} />
        <ContributionPieChart payments={payments} members={members} />
      </div>
    </div>
  );
}
