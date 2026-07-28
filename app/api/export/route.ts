import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getMember } from "@/constants/members";
import { getTargetGroup, getAllProgramMonths } from "@/constants/savings";
import {
  getAllMemberSummaries,
  getMemberMonthSummary,
  sumPayments,
} from "@/utils/calculations";
import { monthNameID } from "@/lib/utils";
import type { Payment } from "@/types";

const GREEN_HEADER = "FF10B981"; // emerald-500 (ARGB)
const CURRENCY_FORMAT = '"Rp"#,##0';
const DATE_FORMAT_ID = "dd/mm/yyyy";

function styleHeaderRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN_HEADER } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
}

function autoWidth(sheet: ExcelJS.Worksheet) {
  sheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const len = cell.value ? String(cell.value).length : 0;
      if (len > maxLength) maxLength = len;
    });
    column.width = Math.min(maxLength + 3, 45);
  });
}

export async function GET() {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("payments")
    .select("*")
    .order("payment_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const payments = (data ?? []) as Payment[];

  const { data: memberRows, error: membersError } = await admin
    .from("members")
    .select("*")
    .order("sort_order", { ascending: true });
  if (membersError) {
    return NextResponse.json({ error: membersError.message }, { status: 500 });
  }
  const members = (memberRows ?? []).map((row) => ({
    key: row.key,
    displayName: row.display_name,
    photoUrl: row.photo_url,
    initials: row.initials,
    colorClass: row.color_class,
    ringClass: row.ring_class,
    hex: row.hex,
  }));
  const memberKeys = members.map((m) => m.key);
  const targetGroup = getTargetGroup(members.length);
  const displayName = (key: string) => getMember(members, key)?.displayName ?? key;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Overseas Trip Savings Dashboard";
  workbook.created = new Date();

  // ---------------------------------------------------------------------
  // Sheet 1: Dashboard Summary
  // ---------------------------------------------------------------------
  const summarySheet = workbook.addWorksheet("Dashboard Summary");
  const totalCollected = sumPayments(payments);
  summarySheet.addRow(["Overseas Trip Savings — Ringkasan"]);
  summarySheet.getRow(1).font = { bold: true, size: 14 };
  summarySheet.addRow([]);
  const summaryHeaderRow = summarySheet.addRow(["Keterangan", "Nilai"]);
  styleHeaderRow(summaryHeaderRow);
  summarySheet.addRow(["Target Kelompok", targetGroup]).getCell(2).numFmt = CURRENCY_FORMAT;
  summarySheet.addRow(["Total Terkumpul", totalCollected]).getCell(2).numFmt = CURRENCY_FORMAT;
  summarySheet.addRow(["Sisa", Math.max(0, targetGroup - totalCollected)]).getCell(2).numFmt =
    CURRENCY_FORMAT;
  summarySheet.addRow(["Persentase", `${targetGroup > 0 ? ((totalCollected / targetGroup) * 100).toFixed(1) : "0.0"}%`]);
  summarySheet.addRow(["Jumlah Transaksi", payments.length]);
  summarySheet.views = [{ state: "frozen", ySplit: 3 }];
  summarySheet.autoFilter = { from: "A3", to: "B3" };
  autoWidth(summarySheet);

  // ---------------------------------------------------------------------
  // Sheet 2: Individual Progress
  // ---------------------------------------------------------------------
  const progressSheet = workbook.addWorksheet("Individual Progress");
  const progressHeader = progressSheet.addRow([
    "Nama", "Total Tabungan", "Target", "Sisa", "Persentase", "Status",
  ]);
  styleHeaderRow(progressHeader);
  for (const summary of getAllMemberSummaries(payments, memberKeys)) {
    const row = progressSheet.addRow([
      displayName(summary.member_name),
      summary.totalSaved,
      summary.target,
      Math.max(0, summary.target - summary.totalSaved),
      `${summary.percentage.toFixed(1)}%`,
      summary.status === "on_track"
        ? "On Track"
        : summary.status === "almost_there"
        ? "Almost There"
        : "Behind Target",
    ]);
    row.getCell(2).numFmt = CURRENCY_FORMAT;
    row.getCell(3).numFmt = CURRENCY_FORMAT;
    row.getCell(4).numFmt = CURRENCY_FORMAT;
  }
  progressSheet.views = [{ state: "frozen", ySplit: 1 }];
  progressSheet.autoFilter = { from: "A1", to: "F1" };
  autoWidth(progressSheet);

  // ---------------------------------------------------------------------
  // Sheet 3: Transaction History
  // ---------------------------------------------------------------------
  const historySheet = workbook.addWorksheet("Transaction History");
  const historyHeader = historySheet.addRow([
    "Tanggal", "Nama", "Bulan", "Tahun", "Nominal", "Catatan", "Bukti Transfer",
  ]);
  styleHeaderRow(historyHeader);
  for (const p of payments) {
    const row = historySheet.addRow([
      new Date(p.payment_date),
      displayName(p.member_name),
      monthNameID(p.payment_month),
      p.payment_year,
      Number(p.amount),
      p.note ?? "",
      p.proof_image_url ?? "",
    ]);
    row.getCell(1).numFmt = DATE_FORMAT_ID;
    row.getCell(5).numFmt = CURRENCY_FORMAT;
  }
  historySheet.views = [{ state: "frozen", ySplit: 1 }];
  historySheet.autoFilter = { from: "A1", to: "G1" };
  autoWidth(historySheet);

  // ---------------------------------------------------------------------
  // Sheet 4: Monthly Status
  // ---------------------------------------------------------------------
  const monthlySheet = workbook.addWorksheet("Monthly Status");
  const monthlyHeader = monthlySheet.addRow(["Bulan", ...members.map((m) => m.displayName)]);
  styleHeaderRow(monthlyHeader);
  for (const { month, year } of getAllProgramMonths()) {
    const cells = memberKeys.map((member) => {
      const s = getMemberMonthSummary(payments, member, month, year);
      if (s.status === "complete") return "Lunas";
      if (s.status === "in_progress") return `Kurang ${s.remaining.toLocaleString("id-ID")}`;
      return "Belum Bayar";
    });
    monthlySheet.addRow([`${monthNameID(month)} ${year}`, ...cells]);
  }
  monthlySheet.views = [{ state: "frozen", ySplit: 1 }];
  const monthlyLastCol = String.fromCharCode(65 + members.length); // "A" + 1 col per member
  monthlySheet.autoFilter = { from: "A1", to: `${monthlyLastCol}1` };
  autoWidth(monthlySheet);

  // ---------------------------------------------------------------------
  // Sheet 5: Statistics
  // ---------------------------------------------------------------------
  const statsSheet = workbook.addWorksheet("Statistics");
  const statsHeader = statsSheet.addRow(["Bulan", "Total Tabungan Bulan Ini", "Kumulatif"]);
  styleHeaderRow(statsHeader);
  let cumulative = 0;
  for (const { month, year } of getAllProgramMonths()) {
    const monthTotal = sumPayments(
      payments.filter((p) => p.payment_month === month && p.payment_year === year)
    );
    cumulative += monthTotal;
    if (monthTotal === 0 && cumulative === 0) continue;
    const row = statsSheet.addRow([`${monthNameID(month)} ${year}`, monthTotal, cumulative]);
    row.getCell(2).numFmt = CURRENCY_FORMAT;
    row.getCell(3).numFmt = CURRENCY_FORMAT;
  }
  statsSheet.addRow([]);
  const contribHeader = statsSheet.addRow(["Kontribusi per Anggota", "Total", "Persentase"]);
  styleHeaderRow(contribHeader);
  const total = sumPayments(payments) || 1;
  for (const member of members) {
    const memberTotal = sumPayments(payments.filter((p) => p.member_name === member.key));
    const row = statsSheet.addRow([
      member.displayName,
      memberTotal,
      `${((memberTotal / total) * 100).toFixed(1)}%`,
    ]);
    row.getCell(2).numFmt = CURRENCY_FORMAT;
  }
  statsSheet.views = [{ state: "frozen", ySplit: 1 }];
  autoWidth(statsSheet);

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="Trip_Savings_Dashboard.xlsx"',
    },
  });
}
