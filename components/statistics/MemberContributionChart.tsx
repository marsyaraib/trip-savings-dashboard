"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LabelList } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MEMBERS } from "@/constants/members";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";
import { totalByMember } from "@/utils/calculations";
import type { Payment } from "@/types";

export function MemberContributionChart({ payments }: { payments: Payment[] }) {
  const data = MEMBERS.map((m) => ({
    name: m.name,
    total: totalByMember(payments, m.name),
    fill: m.hex,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kontribusi Tiap Anggota</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-slate-100 dark:stroke-slate-800" />
              <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrencyCompact(v)} />
              <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} axisLine={false} width={64} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
              />
              <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
                <LabelList dataKey="total" position="right" formatter={(v) => formatCurrencyCompact(Number(v))} fontSize={11} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
