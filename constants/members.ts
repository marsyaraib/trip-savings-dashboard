export type MemberName = "Fafa" | "Febi" | "Nadine" | "Marsya";

export interface Member {
  name: MemberName;
  initials: string;
  colorClass: string; // tailwind gradient classes for avatar
  ringClass: string; // tailwind ring/border color for progress
  hex: string; // solid hex color, for chart fills
}

export const MEMBERS: Member[] = [
  {
    name: "Fafa",
    initials: "FA",
    colorClass: "from-emerald-400 to-emerald-600",
    ringClass: "stroke-emerald-500",
    hex: "#10b981",
  },
  {
    name: "Febi",
    initials: "FB",
    colorClass: "from-amber-400 to-amber-600",
    ringClass: "stroke-amber-500",
    hex: "#f59e0b",
  },
  {
    name: "Nadine",
    initials: "ND",
    colorClass: "from-sky-400 to-sky-600",
    ringClass: "stroke-sky-500",
    hex: "#0ea5e9",
  },
  {
    name: "Marsya",
    initials: "MS",
    colorClass: "from-violet-400 to-violet-600",
    ringClass: "stroke-violet-500",
    hex: "#8b5cf6",
  },
];

export const MEMBER_NAMES: MemberName[] = MEMBERS.map((m) => m.name);

export const BENDAHARA: MemberName = "Marsya";

export function getMember(name: string): Member | undefined {
  return MEMBERS.find((m) => m.name === name);
}
