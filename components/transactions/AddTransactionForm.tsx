"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { UploadProof } from "@/components/transactions/UploadProof";
import { CelebrationModal } from "@/components/shared/CelebrationModal";
import { MEMBER_NAMES, type MemberName } from "@/constants/members";
import { getAllProgramMonths, getCurrentMonthYear } from "@/constants/savings";
import { cn, formatCurrency, monthNameID } from "@/lib/utils";
import { addTransaction, addMultiMonthTransaction } from "@/services/paymentsService";
import { useSavingsData } from "@/hooks/useSavingsData";
import type { AchievementEarned } from "@/types";
import { toast } from "sonner";
import { Loader2, PlusCircle } from "lucide-react";

const programMonths = getAllProgramMonths();
const today = new Date().toISOString().slice(0, 10);
const defaultMonthYear = getCurrentMonthYear();

export function AddTransactionForm() {
  const router = useRouter();
  const { payments, refetch } = useSavingsData();

  const [memberName, setMemberName] = React.useState<MemberName>(MEMBER_NAMES[0]);
  const [monthKey, setMonthKey] = React.useState(`${defaultMonthYear.year}-${defaultMonthYear.month}`);
  const [multiMonth, setMultiMonth] = React.useState(false);
  const [fromMonthKey, setFromMonthKey] = React.useState(`${defaultMonthYear.year}-${defaultMonthYear.month}`);
  const [toMonthKey, setToMonthKey] = React.useState(`${defaultMonthYear.year}-${defaultMonthYear.month}`);
  const [paymentDate, setPaymentDate] = React.useState(today);
  const [amount, setAmount] = React.useState("");
  const [note, setNote] = React.useState("");
  const [proofFile, setProofFile] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const [celebration, setCelebration] = React.useState<{
    open: boolean;
    achievements: AchievementEarned[];
    monthLabel: string | null;
  }>({ open: false, achievements: [], monthLabel: null });

  const fromIdx = programMonths.findIndex((m) => `${m.year}-${m.month}` === fromMonthKey);
  const toIdx = programMonths.findIndex((m) => `${m.year}-${m.month}` === toMonthKey);
  const selectedMonths = fromIdx >= 0 && toIdx >= fromIdx ? programMonths.slice(fromIdx, toIdx + 1) : [];

  const numericAmount = Number(amount.replace(/[^0-9]/g, ""));
  const totalMultiMonthAmount = numericAmount * selectedMonths.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!numericAmount || numericAmount <= 0) {
      toast.error(multiMonth ? "Nominal per bulan harus lebih dari 0." : "Nominal pembayaran harus lebih dari 0.");
      return;
    }

    setSubmitting(true);
    try {
      if (multiMonth) {
        if (selectedMonths.length === 0) {
          toast.error("Rentang bulan tidak valid — pastikan 'Sampai Bulan' tidak lebih awal dari 'Dari Bulan'.");
          setSubmitting(false);
          return;
        }

        const result = await addMultiMonthTransaction(
          {
            memberName,
            months: selectedMonths,
            amountPerMonth: numericAmount,
            paymentDate,
            note,
            proofFile,
          },
          payments
        );

        toast.success(`Pembayaran ${selectedMonths.length} bulan berhasil ditambahkan!`);
        setAmount("");
        setNote("");
        setProofFile(null);
        await refetch();

        if (result.achievements.length > 0 || result.monthsJustCompleted.length > 0) {
          setCelebration({
            open: true,
            achievements: result.achievements,
            monthLabel:
              result.monthsJustCompleted.length > 0
                ? result.monthsJustCompleted.map((m) => `${monthNameID(m.month)} ${m.year}`).join(", ")
                : null,
          });
        } else {
          router.push("/");
        }
        return;
      }

      const [yearStr, monthStr] = monthKey.split("-");
      const result = await addTransaction(
        {
          memberName,
          paymentMonth: Number(monthStr),
          paymentYear: Number(yearStr),
          paymentDate,
          amount: numericAmount,
          note,
          proofFile,
        },
        payments
      );

      toast.success("Pembayaran berhasil ditambahkan!");
      setAmount("");
      setNote("");
      setProofFile(null);
      await refetch();

      if (result.achievements.length > 0 || result.monthJustCompleted) {
        setCelebration({
          open: true,
          achievements: result.achievements,
          monthLabel: result.monthJustCompleted
            ? `${monthNameID(Number(monthStr))} ${yearStr}`
            : null,
        });
      } else {
        router.push("/");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menambahkan transaksi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-emerald-600" />
            Tambah Pembayaran
          </CardTitle>
          <CardDescription>Catat pembayaran tabungan untuk salah satu anggota.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex gap-2 rounded-xl border border-slate-200 p-1 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMultiMonth(false)}
                className={cn(
                  "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  !multiMonth
                    ? "bg-emerald-500 text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                Satu Bulan
              </button>
              <button
                type="button"
                onClick={() => setMultiMonth(true)}
                className={cn(
                  "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  multiMonth
                    ? "bg-emerald-500 text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                Beberapa Bulan
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Nama</Label>
                <Select value={memberName} onValueChange={(v) => setMemberName(v as MemberName)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBER_NAMES.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!multiMonth && (
                <div className="space-y-1.5">
                  <Label>Bulan Pembayaran</Label>
                  <Select value={monthKey} onValueChange={setMonthKey}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {programMonths.map((m) => (
                        <SelectItem key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                          {monthNameID(m.month)} {m.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {multiMonth && (
                <>
                  <div className="space-y-1.5">
                    <Label>Dari Bulan</Label>
                    <Select
                      value={fromMonthKey}
                      onValueChange={(v) => {
                        setFromMonthKey(v);
                        if (programMonths.findIndex((m) => `${m.year}-${m.month}` === v) > toIdx) {
                          setToMonthKey(v);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {programMonths.map((m) => (
                          <SelectItem key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                            {monthNameID(m.month)} {m.year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Sampai Bulan</Label>
                    <Select value={toMonthKey} onValueChange={setToMonthKey}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {programMonths
                          .filter((_, idx) => idx >= (fromIdx >= 0 ? fromIdx : 0))
                          .map((m) => (
                            <SelectItem key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                              {monthNameID(m.month)} {m.year}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="paymentDate">Tanggal Transfer</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="amount">{multiMonth ? "Nominal per Bulan (Rp)" : "Nominal (Rp)"}</Label>
                <Input
                  id="amount"
                  type="text"
                  inputMode="numeric"
                  placeholder="500000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                  required
                />
                {multiMonth && selectedMonths.length > 0 && numericAmount > 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Total: {formatCurrency(totalMultiMonthAmount)} untuk {selectedMonths.length} bulan (
                    {monthNameID(selectedMonths[0].month)} {selectedMonths[0].year} –{" "}
                    {monthNameID(selectedMonths[selectedMonths.length - 1].month)}{" "}
                    {selectedMonths[selectedMonths.length - 1].year})
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note">Catatan (opsional)</Label>
              <Textarea
                id="note"
                placeholder="Contoh: transfer tahap 1"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Bukti Transfer (opsional)</Label>
              <UploadProof file={proofFile} onChange={setProofFile} />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Tambah Pembayaran
            </Button>
          </form>
        </CardContent>
      </Card>

      <CelebrationModal
        open={celebration.open}
        achievements={celebration.achievements}
        monthCompletedLabel={celebration.monthLabel}
        onClose={() => {
          setCelebration((c) => ({ ...c, open: false }));
          router.push("/");
        }}
      />
    </>
  );
}
