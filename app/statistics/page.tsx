"use client";

import { MonthlySavingsChart } from "@/components/statistics/MonthlySavingsChart";
import { MemberContributionChart } from "@/components/statistics/MemberContributionChart";
import { GroupProgressRadial } from "@/components/statistics/GroupProgressRadial";
import { ContributionPieChart } from "@/components/statistics/ContributionPieChart";
import { DashboardSkeleton } from "@/components/shared/DashboardSkeleton";
import { useSavingsData } from "@/hooks/useSavingsData";

export default function StatisticsPage() {
  const { payments, isLoading } = useSavingsData();

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Statistik</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlySavingsChart payments={payments} />
        <MemberContributionChart payments={payments} />
        <GroupProgressRadial payments={payments} />
        <ContributionPieChart payments={payments} />
      </div>
    </div>
  );
}
