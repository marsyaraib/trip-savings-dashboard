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
import { monthNameID } from "@/lib/utils";
import { addTransaction } from "@/services/paymentsService";
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = Number(amount.replace(/[^0-9]/g, ""));
    if (!numericAmount || numericAmount <= 0) {
      toast.error("Nominal pembayaran harus lebih dari 0.");
      return;
    }
    const [yearStr, monthStr] = monthKey.split("-");

    setSubmitting(true);
    try {
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
                <Label htmlFor="amount">Nominal (Rp)</Label>
                <Input
                  id="amount"
                  type="text"
                  inputMode="numeric"
                  placeholder="500000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                  required
                />
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
