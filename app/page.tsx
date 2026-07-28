"use client";

import { HeroSection } from "@/components/dashboard/HeroSection";
import { OverallProgress } from "@/components/dashboard/OverallProgress";
import { IndividualProgressCard } from "@/components/dashboard/IndividualProgressCard";
import { MonthlyStatusCard } from "@/components/dashboard/MonthlyStatusCard";
import { MonthlyTimeline } from "@/components/dashboard/MonthlyTimeline";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AchievementBadges } from "@/components/dashboard/AchievementBadges";
import { ExportExcelButton } from "@/components/shared/ExportExcelButton";
import { DashboardSkeleton } from "@/components/shared/DashboardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useSavingsData } from "@/hooks/useSavingsData";
import { getAllMemberSummaries } from "@/utils/calculations";
import { AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const { payments, activityLogs, isLoading, error } = useSavingsData();

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Gagal memuat dashboard"
        description={error}
      />
    );
  }

  const summaries = getAllMemberSummaries(payments);

  return (
    <div className="space-y-6">
      <HeroSection />

      <div className="flex justify-end">
        <ExportExcelButton />
      </div>

      <OverallProgress payments={payments} />

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">Progress Individu</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaries.map((s) => (
            <IndividualProgressCard key={s.member_name} summary={s} />
          ))}
        </div>
      </div>

      <MonthlyStatusCard payments={payments} />

      <MonthlyTimeline payments={payments} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityFeed logs={activityLogs} />
        <AchievementBadges summaries={summaries} />
      </div>
    </div>
  );
}
