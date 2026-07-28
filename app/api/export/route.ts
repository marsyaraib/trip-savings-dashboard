import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { MEMBER_NAMES } from "@/constants/members";
import { TARGET_GROUP, getAllProgramMonths } from "@/constants/savings";
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
  summarySheet.addRow(["Target Kelompok", TARGET_GROUP]).getCell(2).numFmt = CURRENCY_FORMAT;
  summarySheet.addRow(["Total Terkumpul", totalCollected]).getCell(2).numFmt = CURRENCY_FORMAT;
  summarySheet.addRow(["Sisa", Math.max(0, TARGET_GROUP - totalCollected)]).getCell(2).numFmt =
    CURRENCY_FORMAT;
  summarySheet.addRow(["Persentase", `${((totalCollected / TARGET_GROUP) * 100).toFixed(1)}%`]);
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
  for (const summary of getAllMemberSummaries(payments)) {
    const row = progressSheet.addRow([
      summary.member_name,
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
      p.member_name,
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
  const monthlyHeader = monthlySheet.addRow(["Bulan", ...MEMBER_NAMES]);
  styleHeaderRow(monthlyHeader);
  for (const { month, year } of getAllProgramMonths()) {
    const cells = MEMBER_NAMES.map((member) => {
      const s = getMemberMonthSummary(payments, member, month, year);
      if (s.status === "complete") return "Lunas";
      if (s.status === "in_progress") return `Kurang ${s.remaining.toLocaleString("id-ID")}`;
      return "Belum Bayar";
    });
    monthlySheet.addRow([`${monthNameID(month)} ${year}`, ...cells]);
  }
  monthlySheet.views = [{ state: "frozen", ySplit: 1 }];
  monthlySheet.autoFilter = { from: "A1", to: "E1" };
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
  for (const member of MEMBER_NAMES) {
    const memberTotal = sumPayments(payments.filter((p) => p.member_name === member));
    const row = statsSheet.addRow([member, memberTotal, `${((memberTotal / total) * 100).toFixed(1)}%`]);
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
