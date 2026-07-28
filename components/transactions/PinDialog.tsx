"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

interface PinDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (pin: string) => void;
}

export function PinDialog({
  open,
  title = "Masukkan PIN Admin",
  description = "PIN diperlukan untuk mengubah atau menghapus transaksi.",
  loading = false,
  onOpenChange,
  onSubmit,
}: PinDialogProps) {
  const [pin, setPin] = React.useState("");

  React.useEffect(() => {
    if (!open) setPin("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pin.length > 0) onSubmit(pin);
          }}
          className="space-y-4"
        >
          <Input
            type="password"
            inputMode="numeric"
            autoFocus
            placeholder="PIN Admin"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={10}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading || pin.length === 0}>
              {loading ? "Memeriksa..." : "Konfirmasi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
