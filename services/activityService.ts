import { supabase } from "@/lib/supabase/client";
import type { ActivityLog, NewActivityLog } from "@/types";

export async function fetchActivityLogs(limit = 50): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Gagal memuat activity feed: ${error.message}`);
  return (data ?? []) as ActivityLog[];
}

export async function logActivity(entry: NewActivityLog): Promise<void> {
  const { error } = await supabase.from("activity_logs").insert([entry]);
  if (error) {
    // Activity logging is best-effort and should never block the main flow.
    console.error("Gagal mencatat aktivitas:", error.message);
  }
}

export async function logActivities(entries: NewActivityLog[]): Promise<void> {
  if (entries.length === 0) return;
  const { error } = await supabase.from("activity_logs").insert([...entries]);
  if (error) {
    console.error("Gagal mencatat aktivitas:", error.message);
  }
}
