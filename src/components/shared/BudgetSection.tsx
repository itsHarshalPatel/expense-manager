"use client";

import { useState } from "react";
import { formatAmount } from "@/lib/utils";
import { getCategoryMeta } from "@/constants/data";
import BudgetModal from "@/components/shared/BudgetModal";

import { getBudgets } from "@/actions/budget.actions";
type Budget = Awaited<ReturnType<typeof getBudgets>>[number];

interface CategorySpend {
  category: string;
  total: number;
}

interface Props {
  budgets: Budget[];
  categoryData: CategorySpend[];
}

export default function BudgetSection({ budgets, categoryData }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  if (budgets.length === 0) {
    return (
      <>
        <div className="bg-brand-white rounded-app p-5 border border-brand-border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold">Monthly Budgets</h2>
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs text-gray-400 hover:text-brand-black transition-colors font-medium"
            >
              + Set budgets
            </button>
          </div>
          <p className="text-sm text-gray-400">
            No budgets set yet. Set limits per category to track your spending.
          </p>
        </div>

        {modalOpen && (
          <BudgetModal
            existingBudgets={budgets}
            onClose={() => setModalOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="bg-brand-white rounded-app p-5 border border-brand-border">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold">Monthly Budgets</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="text-xs text-gray-400 hover:text-brand-black transition-colors font-medium"
          >
            Edit budgets →
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {budgets.map((budget) => {
            const limit = Number(budget.amount);
            const spent =
              categoryData.find((c) => c.category === budget.category)?.total ??
              0;
            const percent = Math.min((spent / limit) * 100, 100);
            const isOver = spent > limit;
            const isClose = !isOver && percent >= 80;
            const meta = getCategoryMeta(budget.category);

            return (
              <div key={budget.category}>
                {/* Label row */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{meta.icon}</span>
                    <span className="text-sm font-medium">
                      {budget.category}
                    </span>
                    {isOver && (
                      <span className="text-xs font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                        Over budget
                      </span>
                    )}
                    {isClose && (
                      <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-full">
                        Almost full
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold ${
                        isOver
                          ? "text-red-500"
                          : isClose
                            ? "text-yellow-600"
                            : "text-brand-black"
                      }`}
                    >
                      {formatAmount(spent)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {" "}
                      / {formatAmount(limit)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-brand-light rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver
                        ? "bg-red-500"
                        : isClose
                          ? "bg-yellow-400"
                          : "bg-brand-black"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Remaining */}
                <p className="text-xs text-gray-400 mt-1">
                  {isOver
                    ? `${formatAmount(spent - limit)} over limit`
                    : `${formatAmount(limit - spent)} remaining`}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {modalOpen && (
        <BudgetModal
          existingBudgets={budgets}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
