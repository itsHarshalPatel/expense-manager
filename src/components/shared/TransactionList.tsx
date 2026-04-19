"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCategoryMeta, CATEGORIES, PAYMENT_METHODS } from "@/constants/data";
import { formatDate, formatAmount, trimDescription } from "@/lib/utils";
import { getTransactions } from "@/actions/transaction.actions";
import { GrTransaction } from "react-icons/gr";
import { HiSearch, HiX } from "react-icons/hi";
import Select from "@/components/ui/select";

type Transaction = Awaited<ReturnType<typeof getTransactions>>[number];

interface Props {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [method, setMethod] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const categoryOptions = [
    { value: "", label: "All categories" },
    ...CATEGORIES.map((c) => ({
      value: c.value,
      label: `${c.icon} ${c.value}`,
    })),
  ];

  const methodOptions = [
    { value: "", label: "All methods" },
    ...PAYMENT_METHODS.map((m) => ({
      value: m.value,
      label: `${m.icon} ${m.value}`,
    })),
  ];

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.group?.name.toLowerCase().includes(q);

      const matchesCategory = !category || t.category === category;
      const matchesMethod = !method || t.paymentMethod === method;

      const txDate = new Date(t.paymentDate);
      const matchesFrom = !dateFrom || txDate >= new Date(dateFrom);
      const matchesTo = !dateTo || txDate <= new Date(dateTo + "T23:59:59");

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMethod &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [transactions, search, category, method, dateFrom, dateTo]);

  const hasFilters = search || category || method || dateFrom || dateTo;

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setMethod("");
    setDateFrom("");
    setDateTo("");
  };

  const inputClass =
    "px-3 py-2.5 border border-brand-border rounded-app text-sm bg-brand-white focus:outline-none focus:border-brand-black transition-colors";

  return (
    <div className="flex flex-col gap-3">
      {/* Search bar */}
      <div className="relative">
        <HiSearch
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-brand-border rounded-app text-sm bg-brand-white focus:outline-none focus:border-brand-black transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-black"
          >
            <HiX size={14} />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-2 items-center">
        <Select
          value={category}
          onChange={setCategory}
          options={categoryOptions}
          placeholder="All categories"
          className="w-44"
        />
        <Select
          value={method}
          onChange={setMethod}
          options={methodOptions}
          placeholder="All methods"
          className="w-36"
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className={inputClass}
          title="From date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className={inputClass}
          title="To date"
        />
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-brand-black px-3 py-2.5 rounded-app border border-brand-border bg-brand-white transition-all"
          >
            <HiX size={12} />
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-gray-400">
          {filtered.length} of {transactions.length} transactions
        </p>
        {hasFilters && filtered.length === 0 && (
          <p className="text-xs text-gray-400">
            No results — try different filters
          </p>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 && !hasFilters ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col">
          {filtered.map((transaction) => {
            const meta = getCategoryMeta(transaction.category);
            const isCredit = transaction.paymentMethod === "Credit";
            return (
              <Link
                key={transaction.id}
                href={`/transaction/${transaction.id}`}
                className="list-card"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <Image
                    src={meta.image}
                    alt={meta.value}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-contain flex-shrink-0"
                  />
                  <div className="flex flex-col items-start min-w-0">
                    <h3 className="text-sm font-bold truncate">
                      {transaction.title}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">
                      {transaction.group
                        ? transaction.group.name
                        : trimDescription(transaction.description, 30)}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-400 hidden md:block flex-shrink-0 mx-4">
                  {formatDate(transaction.paymentDate)}
                </span>
                <span
                  className={`text-sm font-bold flex-shrink-0 ${isCredit ? "text-green-600" : "text-red-500"}`}
                >
                  {isCredit ? "+" : "-"}
                  {formatAmount(Number(transaction.amount))}
                </span>
              </Link>
            );
          })}
        </div>
      )}
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
