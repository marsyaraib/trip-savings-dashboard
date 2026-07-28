import type { Payment, MemberMonthSummary, MemberSummary, IndividualStatus } from "@/types";
import {
  TARGET_PER_PERSON,
  MIN_MONTHLY_PAYMENT,
  getAllProgramMonths,
  getCurrentMonthYear,
  START_MONTH,
  START_YEAR,
} from "@/constants/savings";

export function sumPayments(payments: Payment[]): number {
  return payments.reduce((sum, p) => sum + Number(p.amount), 0);
}

export function totalByMember(payments: Payment[], member: string): number {
  return sumPayments(payments.filter((p) => p.member_name === member));
}

export function getMemberMonthSummary(
  payments: Payment[],
  member: string,
  month: number,
  year: number
): MemberMonthSummary {
  const monthPayments = payments.filter(
    (p) => p.member_name === member && p.payment_month === month && p.payment_year === year
  );
  const totalPaid = sumPayments(monthPayments);
  const status: MemberMonthSummary["status"] =
    totalPaid >= MIN_MONTHLY_PAYMENT ? "complete" : totalPaid > 0 ? "in_progress" : "empty";

  return {
    member_name: member,
    month,
    year,
    totalPaid,
    transactionCount: monthPayments.length,
    status,
    remaining: Math.max(0, MIN_MONTHLY_PAYMENT - totalPaid),
  };
}

export function getAllMemberSummariesForMonth(
  payments: Payment[],
  memberKeys: string[],
  month: number,
  year: number
): MemberMonthSummary[] {
  return memberKeys.map((member) => getMemberMonthSummary(payments, member, month, year));
}

export function isMonthFullyComplete(
  payments: Payment[],
  memberKeys: string[],
  month: number,
  year: number
): boolean {
  return getAllMemberSummariesForMonth(payments, memberKeys, month, year).every((s) => s.status === "complete");
}

/** Number of months elapsed in the program up to and including "now", clamped to the program window. */
function monthsElapsedToDate(): number {
  const { month: curM, year: curY } = getCurrentMonthYear();
  const monthsSinceStart =
    (curY - START_YEAR) * 12 + (curM - START_MONTH) + 1;
  const allMonths = getAllProgramMonths();
  return Math.min(Math.max(monthsSinceStart, 1), allMonths.length);
}

/**
 * Individual status heuristic (not specified numerically in the PRD):
 * compares actual savings against the minimum-pace expectation
 * (elapsed months * Rp500.000), with a tolerance band.
 */
export function getIndividualStatus(totalSaved: number): IndividualStatus {
  const elapsed = monthsElapsedToDate();
  const expected = Math.min(elapsed * MIN_MONTHLY_PAYMENT, TARGET_PER_PERSON);
  if (totalSaved >= TARGET_PER_PERSON) return "on_track";
  if (totalSaved >= expected * 0.9) return "on_track";
  if (totalSaved >= expected * 0.6) return "almost_there";
  return "behind_target";
}

export function getMemberSummary(payments: Payment[], member: string): MemberSummary {
  const totalSaved = totalByMember(payments, member);
  return {
    member_name: member,
    totalSaved,
    target: TARGET_PER_PERSON,
    percentage: Math.min(100, (totalSaved / TARGET_PER_PERSON) * 100),
    status: getIndividualStatus(totalSaved),
  };
}

export function getAllMemberSummaries(payments: Payment[], memberKeys: string[]): MemberSummary[] {
  return memberKeys.map((m) => getMemberSummary(payments, m));
}

export const STATUS_LABEL: Record<IndividualStatus, string> = {
  on_track: "On Track",
  almost_there: "Almost There",
  behind_target: "Behind Target",
};

export const STATUS_EMOJI: Record<IndividualStatus, string> = {
  on_track: "🟢",
  almost_there: "🟡",
  behind_target: "🔴",
};
