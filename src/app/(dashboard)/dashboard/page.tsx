import { getDashboardData } from "@/actions/transaction.actions";
import { formatAmount, formatDate } from "@/lib/utils";
import { getCategoryMeta } from "@/constants/data";
import Link from "next/link";
import DashboardCharts from "@/components/shared/DashboardCharts";
import { GrTransaction } from "react-icons/gr";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const [data, session] = await Promise.all([getDashboardData(), auth()]);
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
    totalTransactions,
  } = data;

  const isUp = changePercent > 0;
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  return (
    <div className="max-w-5xl mx-auto px-2 py-4">
      {/* Greeting */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-brand-black"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Hello, {firstName} 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Here's your spending summary for {currentMonth}.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Main stat — larger */}
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

        <div className="bg-brand-white rounded-app p-5 flex flex-col gap-1 border border-brand-border">
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            All Transactions
          </p>
          <p className="text-3xl font-bold mt-1 text-brand-black">
            {totalTransactions}
          </p>
          <Link
            href="/transaction"
            className="text-xs text-gray-400 mt-2 hover:text-brand-black transition-colors"
          >
            View all →
          </Link>
        </div>
      </div>

      {/* Charts */}
      <DashboardCharts monthlyData={monthlyData} categoryData={categoryData} />

      {/* Recent transactions */}
      <div className="bg-brand-white rounded-app p-5 border border-brand-border">
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
                      <img
                        src={meta.image}
                        alt={meta.value}
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
