"use client";

import * as React from "react";
import { SearchFilterBar } from "@/components/transactions/SearchFilterBar";
import { TransactionHistoryTable } from "@/components/transactions/TransactionHistoryTable";
import { DashboardSkeleton } from "@/components/shared/DashboardSkeleton";
import { ExportExcelButton } from "@/components/shared/ExportExcelButton";
import { useSavingsData } from "@/hooks/useSavingsData";
import type { PaginationFilter } from "@/types";

export default function HistoryPage() {
  const { payments, isLoading } = useSavingsData();
  const [filter, setFilter] = React.useState<PaginationFilter>({
    memberName: "all",
    month: "all",
    year: "all",
    query: "",
  });

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Riwayat Transaksi</h1>
        <ExportExcelButton />
      </div>
      <SearchFilterBar filter={filter} onChange={setFilter} />
      <TransactionHistoryTable payments={payments} filter={filter} />
    </div>
  );
}
