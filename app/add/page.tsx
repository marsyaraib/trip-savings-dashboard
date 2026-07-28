import { AddTransactionForm } from "@/components/transactions/AddTransactionForm";

export const metadata = { title: "Tambah Transaksi · Overseas Trip Savings" };

export default function AddTransactionPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <AddTransactionForm />
    </div>
  );
}
