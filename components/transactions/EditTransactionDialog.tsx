"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MEMBER_NAMES, type MemberName } from "@/constants/members";
import { getAllProgramMonths } from "@/constants/savings";
import { monthNameID } from "@/lib/utils";
import { editPayment } from "@/services/paymentsService";
import type { Payment } from "@/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const programMonths = getAllProgramMonths();

interface EditTransactionDialogProps {
  payment: Payment | null;
  pin: string | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function EditTransactionDialog({ payment, pin, onOpenChange, onSaved }: EditTransactionDialogProps) {
  const [memberName, setMemberName] = React.useState<MemberName>("Fafa");
  const [monthKey, setMonthKey] = React.useState("");
  const [paymentDate, setPaymentDate] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (payment) {
      setMemberName(payment.member_name);
      setMonthKey(`${payment.payment_year}-${payment.payment_month}`);
      setPaymentDate(payment.payment_date);
      setAmount(String(payment.amount));
      setNote(payment.note ?? "");
    }
  }, [payment]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!payment || !pin) return;
    const [yearStr, monthStr] = monthKey.split("-");
    const numericAmount = Number(amount.replace(/[^0-9]/g, ""));
    if (!numericAmount || numericAmount <= 0) {
      toast.error("Nominal harus lebih dari 0.");
      return;
    }

    setSaving(true);
    try {
      await editPayment(payment.id, pin, {
        member_name: memberName,
        payment_month: Number(monthStr),
        payment_year: Number(yearStr),
        payment_date: paymentDate,
        amount: numericAmount,
        note: note || null,
      });
      toast.success("Transaksi berhasil diubah.");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah transaksi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!payment} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ubah Transaksi</DialogTitle>
          <DialogDescription>Perbarui detail pembayaran ini.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
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
              <Label>Bulan</Label>
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
              <Label>Tanggal Transfer</Label>
              <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label>Nominal (Rp)</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Catatan</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
