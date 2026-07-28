/**
 * Core savings rules, sourced directly from the PRD (section 3).
 */

export const TARGET_PER_PERSON = 10_000_000;
export const TARGET_GROUP = 40_000_000;
export const MIN_MONTHLY_PAYMENT = 500_000;

// Saving window: May 2026 - December 2027 (inclusive)
export const START_MONTH = 5; // May
export const START_YEAR = 2026;
export const END_MONTH = 12; // December
export const END_YEAR = 2027;

export const TRIP_DEADLINE = new Date(END_YEAR, END_MONTH - 1, 31, 23, 59, 59);

export const MONTH_NAMES_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export const MONTH_NAMES_SHORT_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export interface MonthYear {
  month: number; // 1-12
  year: number;
}

/** Full ordered list of months in the savings program, May 2026 - Dec 2027. */
export function getAllProgramMonths(): MonthYear[] {
  const months: MonthYear[] = [];
  let m = START_MONTH;
  let y = START_YEAR;
  while (y < END_YEAR || (y === END_YEAR && m <= END_MONTH)) {
    months.push({ month: m, year: y });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return months;
}

export function monthKey({ month, year }: MonthYear): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function isSameMonth(a: MonthYear, b: MonthYear): boolean {
  return a.month === b.month && a.year === b.year;
}

export function getCurrentMonthYear(): MonthYear {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

/** Achievement milestone thresholds relative to TARGET_PER_PERSON. */
export const MILESTONES = [
  { fraction: 0.25, badge: "🥉", label: "25%" },
  { fraction: 0.5, badge: "🥈", label: "50%" },
  { fraction: 0.75, badge: "🥇", label: "75%" },
  { fraction: 1, badge: "👑", label: "100%" },
] as const;

export const FIXED_AMOUNT_ACHIEVEMENT = {
  amount: 5_000_000,
  badge: "💰",
  label: "Rp5.000.000 tercapai",
};

export const STREAK_ACHIEVEMENT = {
  months: 3,
  badge: "🔥",
  label: "Tepat waktu 3 bulan berturut-turut",
};

export const COMPLETION_ACHIEVEMENT = {
  badge: "🏆",
  label: "Target pribadi selesai",
};
