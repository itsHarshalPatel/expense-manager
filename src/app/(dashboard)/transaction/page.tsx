import Link from "next/link";
import { getTransactions } from "@/actions/transaction.actions";
import { getCategoryMeta } from "@/constants/data";
import { formatDate, formatAmount, trimDescription } from "@/lib/utils";
import { GrTransaction } from "react-icons/gr";
type Transaction = Awaited<ReturnType<typeof getTransactions>>[number];

export default async function TransactionPage() {
  const transactions = await getTransactions();

  return (
    <div className="transaction-page">
      {/* Hero banner */}
      <div
        className="big-box-container"
        style={{ backgroundImage: "url('/images/BgTransaction.webp')" }}
      >
        <Link href="/transaction/new" className="common-btn">
          + Add Transaction
        </Link>
      </div>

      {/* List */}
      <div className="mt-4">
        {transactions.length === 0 ? (
          <EmptyState />
        ) : (
          transactions.map((transaction: Transaction) => {
            const meta = getCategoryMeta(transaction.category);
            const isCredit = transaction.paymentMethod === "Credit";
            return (
              <Link
                key={transaction.id}
                href={`/transaction/${transaction.id}`}
                className="list-card"
              >
                {/* Left — icon + title */}
                <div className="flex items-center gap-4 w-56">
                  <img
                    src={meta.image}
                    alt={meta.value}
                    className="w-14 h-14 object-contain flex-shrink-0"
                  />
                  <div className="flex flex-col items-start">
                    <h3 className="text-base font-extrabold">
                      {transaction.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {trimDescription(transaction.description, 20)}
                    </p>
                  </div>
                </div>

                {/* Middle — date */}
                <span className="text-sm text-gray-400 hidden md:block">
                  {formatDate(transaction.paymentDate)}
                </span>

                {/* Right — amount */}
                <span
                  className={`text-base font-bold ${
                    isCredit ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {isCredit ? "+" : "-"}{" "}
                  {formatAmount(Number(transaction.amount))}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <GrTransaction size={48} className="text-gray-300" />
      <p className="text-lg font-semibold text-gray-400">No transactions yet</p>
      <p className="text-sm text-gray-400">
        Start tracking your expenses by adding your first transaction
      </p>
      <Link href="/transaction/new" className="common-btn mt-2">
        + Add your first transaction
      </Link>
    </div>
  );
}
