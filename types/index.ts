import type { MemberName } from "@/constants/members";

export interface Payment {
  id: string;
  member_name: MemberName;
  payment_month: number;
  payment_year: number;
  payment_date: string; // ISO date (yyyy-mm-dd)
  amount: number;
  note: string | null;
  proof_image_url: string | null;
  created_at: string;
}

export type NewPayment = Omit<Payment, "id" | "created_at">;

export type ActivityType =
  | "payment_added"
  | "proof_uploaded"
  | "milestone_reached"
  | "month_completed"
  | "target_completed";

export interface ActivityLog {
  id: string;
  activity: string;
  activity_type: ActivityType;
  member_name: MemberName | null;
  created_at: string;
}

export type NewActivityLog = Omit<ActivityLog, "id" | "created_at">;

export type MonthlyPaymentStatus = "complete" | "in_progress" | "empty";

export interface MemberMonthSummary {
  member_name: MemberName;
  month: number;
  year: number;
  totalPaid: number;
  transactionCount: number;
  status: MonthlyPaymentStatus;
  remaining: number;
}

export type IndividualStatus = "on_track" | "almost_there" | "behind_target";

export interface MemberSummary {
  member_name: MemberName;
  totalSaved: number;
  target: number;
  percentage: number;
  status: IndividualStatus;
}

export interface AchievementEarned {
  id: string;
  badge: string;
  label: string;
  member_name: MemberName;
}

export interface PaginationFilter {
  memberName?: MemberName | "all";
  month?: number | "all";
  year?: number | "all";
  query?: string;
}
