import { getDashboardData } from "@/actions/transaction.actions";
import { formatAmount, formatDate } from "@/lib/utils";
import { getCategoryMeta } from "@/constants/data";
import Link from "next/link";
import DashboardCharts from "@/components/shared/DashboardCharts";
import { GrTransaction } from "react-icons/gr";
import { auth } from "@/auth";
import { getPendingSettlements } from "@/actions/friend.actions";
import { getBudgets } from "@/actions/budget.actions";
import BudgetSection from "@/components/shared/BudgetSection";
import Image from "next/image";
import { getDueRecurringTransactions } from "@/actions/recurring.actions";
import { MdRepeat } from "react-icons/md";

type RecentTransaction = NonNullable<
  Awaited<ReturnType<typeof getDashboardData>>
>["recentTransactions"][number];
export default async function DashboardPage() {
  const [data, session, settlements, budgets, due] = await Promise.all([
    getDashboardData(),
    auth(),
    getPendingSettlements(),
    getBudgets(),
    getDueRecurringTransactions(),
  ]);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  if (!data) {
    return (
      <div className="p-4">
        <p className="text-gray-400">Could not load dashboard data.</p>
      </div>
    );
  }

  const {
    totalThisMonth,
    totalLastMonth,
    changePercent,
    categoryData,
    monthlyData,
    recentTransactions,
  } = data;

  type RecentTransaction = {
    id: string;
    title: string;
    category: string;
    paymentMethod: string;
    amount: number | string;
    paymentDate: Date;
  };
  const isUp = changePercent > 0;
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  return (
    <div className="max-w-5xl mx-auto px-2 py-4">
      {/* Greeting */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-brand-black"
          style={{ fontFamily: "DM Serif Display, serif" }}
        >
          Hello, {firstName} 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Here's your spending summary for {currentMonth}.
        </p>
      </div>
      {/* Due recurring banner */}
      {due.length > 0 && (
        <Link
          href="/recurring"
          className="flex items-center justify-between bg-yellow-50 border border-yellow-300 rounded-app px-4 py-3 mb-6 hover:bg-yellow-100 transition-all"
        >
          <div className="flex items-center gap-3">
            <MdRepeat size={18} className="text-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">
                {due.length} recurring{" "}
                {due.length === 1 ? "transaction" : "transactions"} due
              </p>
              <p className="text-xs text-yellow-600">
                Tap to review and confirm
              </p>
            </div>
          </div>
          <span className="text-yellow-600 text-sm font-medium">→</span>
        </Link>
      )}

      {/* Stats row */}
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-brand-black text-white rounded-app p-5 flex flex-col gap-1">
          <p className="text-xs text-white/60 uppercase tracking-wider">
            Spent in {currentMonth}
          </p>
          <p className="text-3xl font-bold mt-1">
            {formatAmount(totalThisMonth)}
          </p>
          <p
            className={`text-xs mt-2 ${isUp ? "text-red-300" : "text-green-300"}`}
          >
            {totalLastMonth > 0
              ? `${isUp ? "▲" : "▼"} ${Math.abs(changePercent)}% vs last month`
              : "No data last month"}
          </p>
        </div>

        <div className="bg-brand-white rounded-app p-5 flex flex-col gap-1 border border-brand-border">
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            Last Month
          </p>
          <p className="text-3xl font-bold mt-1 text-brand-black">
            {formatAmount(totalLastMonth)}
          </p>
          <p className="text-xs text-gray-400 mt-2">Previous month total</p>
        </div>

        <Link
          href="/friend?filter=owed"
          className="bg-green-50 rounded-app p-5 flex flex-col gap-1 border border-green-200 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <p className="text-xs text-green-600 uppercase tracking-wider">
            To Collect
          </p>
          <p className="text-3xl font-bold mt-1 text-green-600">
            {formatAmount(settlements.totalOwed)}
          </p>
          <p className="text-xs text-green-500 mt-2">Friends owe you →</p>
        </Link>

        <Link
          href="/friend?filter=owe"
          className="bg-red-50 rounded-app p-5 flex flex-col gap-1 border border-red-200 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <p className="text-xs text-red-400 uppercase tracking-wider">
            To Pay
          </p>
          <p className="text-3xl font-bold mt-1 text-red-500">
            {formatAmount(settlements.totalOwe)}
          </p>
          <p className="text-xs text-red-400 mt-2">You owe friends →</p>
        </Link>
      </div>

      {/* Charts */}
      <DashboardCharts monthlyData={monthlyData} categoryData={categoryData} />

      {/* Budget section */}
      <div className="mt-6">
        <BudgetSection budgets={budgets} categoryData={categoryData} />
      </div>

      {/* Recent transactions */}
      <div className="bg-brand-white rounded-app p-5 border border-brand-border mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">Recent Transactions</h2>
          <Link
            href="/transaction"
            className="text-xs text-gray-400 hover:text-brand-black transition-colors"
          >
            View all →
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-3">
            <GrTransaction size={32} className="text-gray-300" />
            <p className="text-sm text-gray-400">No transactions yet</p>
            <Link href="/transaction/new" className="common-btn mt-1">
              + Add your first transaction
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-brand-border">
            {recentTransactions.map((t) => {
              const meta = getCategoryMeta(t.category);
              const isCredit = t.paymentMethod === "Credit";
              return (
                <Link
                  key={t.id}
                  href={`/transaction/${t.id}`}
                  className="flex items-center justify-between py-3 hover:opacity-70 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-brand-light rounded-app flex items-center justify-center flex-shrink-0">
                      <Image
                        src={meta.image}
                        alt={meta.value}
                        width={20}
                        height={20}
                        className="w-5 h-5 object-contain"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{t.title}</span>
                      <span className="text-xs text-gray-400">
                        {meta.icon} {t.category} · {formatDate(t.paymentDate)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      isCredit ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {isCredit ? "+" : "-"}
                    {formatAmount(Number(t.amount))}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
