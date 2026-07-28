/** Visual identity cycled through when a new member is added via the admin UI. */
export interface PaletteEntry {
  colorClass: string;
  ringClass: string;
  hex: string;
}

export const MEMBER_PALETTE: PaletteEntry[] = [
  { colorClass: "from-emerald-400 to-emerald-600", ringClass: "stroke-emerald-500", hex: "#10b981" },
  { colorClass: "from-amber-400 to-amber-600", ringClass: "stroke-amber-500", hex: "#f59e0b" },
  { colorClass: "from-sky-400 to-sky-600", ringClass: "stroke-sky-500", hex: "#0ea5e9" },
  { colorClass: "from-violet-400 to-violet-600", ringClass: "stroke-violet-500", hex: "#8b5cf6" },
  { colorClass: "from-rose-400 to-rose-600", ringClass: "stroke-rose-500", hex: "#f43f5e" },
  { colorClass: "from-cyan-400 to-cyan-600", ringClass: "stroke-cyan-500", hex: "#06b6d4" },
  { colorClass: "from-lime-400 to-lime-600", ringClass: "stroke-lime-500", hex: "#84cc16" },
  { colorClass: "from-fuchsia-400 to-fuchsia-600", ringClass: "stroke-fuchsia-500", hex: "#d946ef" },
];

export function paletteForIndex(index: number): PaletteEntry {
  return MEMBER_PALETTE[index % MEMBER_PALETTE.length];
}
