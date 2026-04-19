import Link from "next/link";
import { getTransactions } from "@/actions/transaction.actions";
import TransactionList from "@/components/shared/TransactionList";
import ExportButton from "@/components/shared/ExportButton";

export default async function TransactionPage() {
  const transactions = await getTransactions();

  return (
    <div className="max-w-4xl mx-auto px-2 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-3xl font-bold text-brand-black"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Transactions
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {transactions.length}{" "}
            {transactions.length === 1 ? "transaction" : "transactions"} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton />
          <Link href="/transaction/new" className="common-btn">
            + Add
          </Link>
        </div>
      </div>

      <TransactionList transactions={transactions} />
    </div>
  );
}
