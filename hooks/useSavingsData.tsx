"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase/client";
import { fetchAllPayments } from "@/services/paymentsService";
import { fetchActivityLogs } from "@/services/activityService";
import { fetchAllMembers } from "@/services/membersService";
import type { Payment, ActivityLog } from "@/types";
import type { Member } from "@/constants/members";

interface SavingsDataContextValue {
  payments: Payment[];
  activityLogs: ActivityLog[];
  members: Member[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  applyOptimisticDelete: (id: string) => void;
  applyOptimisticRestore: (payment: Payment) => void;
}

const SavingsDataContext = React.createContext<SavingsDataContextValue | null>(null);

export function SavingsDataProvider({ children }: { children: React.ReactNode }) {
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [activityLogs, setActivityLogs] = React.useState<ActivityLog[]>([]);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refetch = React.useCallback(async () => {
    try {
      setError(null);
      const [p, a, m] = await Promise.all([fetchAllPayments(), fetchActivityLogs(), fetchAllMembers()]);
      setPayments(p);
      setActivityLogs(a);
      setMembers(m);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refetch();

    // Realtime: keep every open tab in sync automatically.
    const channel = supabase
      .channel("savings-dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => {
        refetch();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_logs" }, () => {
        refetch();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "members" }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const applyOptimisticDelete = React.useCallback((id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const applyOptimisticRestore = React.useCallback((payment: Payment) => {
    setPayments((prev) => (prev.some((p) => p.id === payment.id) ? prev : [payment, ...prev]));
  }, []);

  const value: SavingsDataContextValue = {
    payments,
    activityLogs,
    members,
    isLoading,
    error,
    refetch,
    applyOptimisticDelete,
    applyOptimisticRestore,
  };

  return <SavingsDataContext.Provider value={value}>{children}</SavingsDataContext.Provider>;
}

export function useSavingsData() {
  const ctx = React.useContext(SavingsDataContext);
  if (!ctx) throw new Error("useSavingsData must be used within SavingsDataProvider");
  return ctx;
}
