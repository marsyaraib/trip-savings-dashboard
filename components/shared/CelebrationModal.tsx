"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWindowSize } from "@/hooks/useWindowSize";
import type { AchievementEarned } from "@/types";

const ReactConfetti = dynamic(() => import("react-confetti"), { ssr: false });

interface CelebrationModalProps {
  open: boolean;
  achievements: AchievementEarned[];
  monthCompletedLabel: string | null;
  onClose: () => void;
}

export function CelebrationModal({ open, achievements, monthCompletedLabel, onClose }: CelebrationModalProps) {
  const { width, height } = useWindowSize();

  const title = monthCompletedLabel
    ? `🎉 Target bulan ${monthCompletedLabel} berhasil diselesaikan!`
    : "🎉 Selamat!";

  return (
    <>
      {open && width > 0 && (
        <ReactConfetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={350}
          gravity={0.25}
          tweenDuration={6000}
          colors={["#8e2323", "#a62c2c", "#d9ae55", "#f0cc7a", "#ffffff"]}
          style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "none" }}
        />
      )}
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="text-xl">{title}</DialogTitle>
            <DialogDescription>Kerja bagus! Terus semangat menabung ya 🚀</DialogDescription>
          </DialogHeader>

          {achievements.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 py-2">
              {achievements.map((a) => (
                <span
                  key={a.id}
                  className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                >
                  <span className="text-lg">{a.badge}</span>
                  {a.label}
                </span>
              ))}
            </div>
          )}

          <Button onClick={onClose} className="mx-auto mt-2 w-full sm:w-auto">
            Oke, lanjutkan!
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
