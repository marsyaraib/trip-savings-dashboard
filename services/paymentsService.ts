import { supabase } from "@/lib/supabase/client";
import type { Payment, NewPayment, NewActivityLog, AchievementEarned } from "@/types";
import type { MemberName } from "@/constants/members";
import { formatCurrency, monthNameID } from "@/lib/utils";
import { totalByMember, isMonthFullyComplete } from "@/utils/calculations";
import { detectNewMilestones } from "@/utils/achievements";
import { logActivities } from "@/services/activityService";
import { uploadProofFile } from "@/services/storageService";

export async function fetchAllPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("payment_date", { ascending: false });

  if (error) throw new Error(`Gagal memuat data pembayaran: ${error.message}`);
  return (data ?? []) as Payment[];
}

export interface AddTransactionInput {
  memberName: MemberName;
  paymentMonth: number;
  paymentYear: number;
  paymentDate: string;
  amount: number;
  note: string;
  proofFile: File | null;
}

export interface AddTransactionResult {
  payment: Payment;
  achievements: AchievementEarned[];
  monthJustCompleted: boolean;
}

/**
 * Full "add transaction" flow:
 * 1. Upload proof (if provided)
 * 2. Insert the payment row
 * 3. Diff totals before/after to detect milestones crossed
 * 4. Check whether this completes the month for the whole group
 * 5. Write all resulting activity_log entries
 *
 * `existingPayments` is the caller's current in-memory list (used purely to
 * compute deltas quickly); it is not required to be perfectly fresh.
 */
export async function addTransaction(
  input: AddTransactionInput,
  existingPayments: Payment[]
): Promise<AddTransactionResult> {
  let proofUrl: string | null = null;
  if (input.proofFile) {
    proofUrl = await uploadProofFile(input.proofFile, input.memberName);
  }

  const newRow: NewPayment = {
    member_name: input.memberName,
    payment_month: input.paymentMonth,
    payment_year: input.paymentYear,
    payment_date: input.paymentDate,
    amount: input.amount,
    note: input.note || null,
    proof_image_url: proofUrl,
  };

  const { data, error } = await supabase.from("payments").insert([newRow]).select().single();
  if (error) throw new Error(`Gagal menyimpan transaksi: ${error.message}`);
  const payment = data as Payment;

  const previousTotal = totalByMember(existingPayments, input.memberName);
  const newTotal = previousTotal + input.amount;
  const achievements = detectNewMilestones(previousTotal, newTotal, input.memberName);

  const wasMonthCompleteBefore = isMonthFullyComplete(
    existingPayments,
    input.paymentMonth,
    input.paymentYear
  );
  const isMonthCompleteAfter = isMonthFullyComplete(
    [...existingPayments, payment],
    input.paymentMonth,
    input.paymentYear
  );
  const monthJustCompleted = !wasMonthCompleteBefore && isMonthCompleteAfter;

  const logs: NewActivityLog[] = [
    {
      activity: `${input.memberName} menambahkan ${formatCurrency(input.amount)} untuk bulan ${monthNameID(
        input.paymentMonth
      )} ${input.paymentYear}`,
      activity_type: "payment_added",
      member_name: input.memberName,
    },
  ];

  if (proofUrl) {
    logs.push({
      activity: `${input.memberName} mengunggah bukti transfer`,
      activity_type: "proof_uploaded",
      member_name: input.memberName,
    });
  }

  for (const a of achievements) {
    logs.push({
      activity: a.label,
      activity_type: a.badge === "🏆" ? "target_completed" : "milestone_reached",
      member_name: input.memberName,
    });
  }

  if (monthJustCompleted) {
    logs.push({
      activity: `Semua anggota menyelesaikan target bulan ${monthNameID(input.paymentMonth)} ${
        input.paymentYear
      } 🎉`,
      activity_type: "month_completed",
      member_name: null,
    });
  }

  await logActivities(logs);

  return { payment, achievements, monthJustCompleted };
}

export interface AddMultiMonthTransactionInput {
  memberName: MemberName;
  months: { month: number; year: number }[];
  amountPerMonth: number;
  paymentDate: string;
  note: string;
  proofFile: File | null;
}

export interface AddMultiMonthTransactionResult {
  payments: Payment[];
  achievements: AchievementEarned[];
  monthsJustCompleted: { month: number; year: number }[];
}

/**
 * Same as addTransaction, but settles several consecutive months in one go —
 * one payment row per month, all sharing the same date/note/proof. Achievement
 * and month-completion checks run cumulatively so milestones crossed partway
 * through the batch are still detected correctly.
 */
export async function addMultiMonthTransaction(
  input: AddMultiMonthTransactionInput,
  existingPayments: Payment[]
): Promise<AddMultiMonthTransactionResult> {
  let proofUrl: string | null = null;
  if (input.proofFile) {
    proofUrl = await uploadProofFile(input.proofFile, input.memberName);
  }

  let runningPayments = [...existingPayments];
  const insertedPayments: Payment[] = [];
  const achievements: AchievementEarned[] = [];
  const monthsJustCompleted: { month: number; year: number }[] = [];
  const logs: NewActivityLog[] = [];

  for (const { month, year } of input.months) {
    const newRow: NewPayment = {
      member_name: input.memberName,
      payment_month: month,
      payment_year: year,
      payment_date: input.paymentDate,
      amount: input.amountPerMonth,
      note: input.note || null,
      proof_image_url: proofUrl,
    };

    const { data, error } = await supabase.from("payments").insert([newRow]).select().single();
    if (error) {
      throw new Error(`Gagal menyimpan transaksi untuk ${monthNameID(month)} ${year}: ${error.message}`);
    }
    const payment = data as Payment;
    insertedPayments.push(payment);

    const previousTotal = totalByMember(runningPayments, input.memberName);
    const newTotal = previousTotal + input.amountPerMonth;
    const newAchievements = detectNewMilestones(previousTotal, newTotal, input.memberName);
    achievements.push(...newAchievements);

    const wasMonthCompleteBefore = isMonthFullyComplete(runningPayments, month, year);
    const isMonthCompleteAfter = isMonthFullyComplete([...runningPayments, payment], month, year);
    const monthJustCompleted = !wasMonthCompleteBefore && isMonthCompleteAfter;
    if (monthJustCompleted) monthsJustCompleted.push({ month, year });

    logs.push({
      activity: `${input.memberName} menambahkan ${formatCurrency(input.amountPerMonth)} untuk bulan ${monthNameID(
        month
      )} ${year}`,
      activity_type: "payment_added",
      member_name: input.memberName,
    });

    for (const a of newAchievements) {
      logs.push({
        activity: a.label,
        activity_type: a.badge === "🏆" ? "target_completed" : "milestone_reached",
        member_name: input.memberName,
      });
    }

    if (monthJustCompleted) {
      logs.push({
        activity: `Semua anggota menyelesaikan target bulan ${monthNameID(month)} ${year} 🎉`,
        activity_type: "month_completed",
        member_name: null,
      });
    }

    runningPayments = [...runningPayments, payment];
  }

  if (proofUrl) {
    logs.push({
      activity: `${input.memberName} mengunggah bukti transfer untuk ${input.months.length} bulan sekaligus`,
      activity_type: "proof_uploaded",
      member_name: input.memberName,
    });
  }

  await logActivities(logs);

  return { payments: insertedPayments, achievements, monthsJustCompleted };
}

export async function editPayment(
  id: string,
  pin: string,
  updates: Partial<NewPayment>
): Promise<Payment> {
  const res = await fetch(`/api/admin/payments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin, updates }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Gagal mengubah transaksi.");
  return json.payment as Payment;
}

export async function deletePayment(id: string, pin: string): Promise<void> {
  const res = await fetch(`/api/admin/payments/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? "Gagal menghapus transaksi.");
  }
}
