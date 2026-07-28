"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { Member } from "@/constants/members";
import { MONTH_NAMES_ID, START_YEAR, END_YEAR } from "@/constants/savings";
import type { PaginationFilter } from "@/types";

interface SearchFilterBarProps {
  filter: PaginationFilter;
  onChange: (filter: PaginationFilter) => void;
  members: Member[];
}

const YEARS = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);

export function SearchFilterBar({ filter, onChange, members }: SearchFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Cari catatan transaksi..."
          className="pl-9"
          value={filter.query ?? ""}
          onChange={(e) => onChange({ ...filter, query: e.target.value })}
        />
      </div>

      <Select
        value={String(filter.memberName ?? "all")}
        onValueChange={(v) => onChange({ ...filter, memberName: v as PaginationFilter["memberName"] })}
      >
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="Nama" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Nama</SelectItem>
          {members.map((m) => (
            <SelectItem key={m.key} value={m.key}>
              {m.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(filter.month ?? "all")}
        onValueChange={(v) => onChange({ ...filter, month: v === "all" ? "all" : Number(v) })}
      >
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="Bulan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Bulan</SelectItem>
          {MONTH_NAMES_ID.map((name, i) => (
            <SelectItem key={name} value={String(i + 1)}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(filter.year ?? "all")}
        onValueChange={(v) => onChange({ ...filter, year: v === "all" ? "all" : Number(v) })}
      >
        <SelectTrigger className="sm:w-32">
          <SelectValue placeholder="Tahun" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Tahun</SelectItem>
          {YEARS.map((year) => (
            <SelectItem key={year} value={String(year)}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
