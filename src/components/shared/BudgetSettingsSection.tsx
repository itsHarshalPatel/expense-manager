"use client";

import { useState } from "react";
import BudgetModal from "@/components/shared/BudgetModal";
import { getCategoryMeta } from "@/constants/data";
import { formatAmount } from "@/lib/utils";
import { getBudgets } from "@/actions/budget.actions";

type Budget = Awaited<ReturnType<typeof getBudgets>>[number];

interface Props {
  budgets: Budget[];
}

export default function BudgetSettingsSection({ budgets }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="bg-brand-white rounded-app p-5 border border-brand-border mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            Monthly Budgets
          </h3>
          <button
            onClick={() => setModalOpen(true)}
            className="text-xs font-medium text-brand-black border border-brand-border px-3 py-1.5 rounded-app hover:bg-brand-light transition-all"
          >
            {budgets.length > 0 ? "Edit budgets" : "Set budgets"}
          </button>
        </div>

        {budgets.length === 0 ? (
          <p className="text-sm text-gray-400">
            No budgets configured. Set monthly limits per category to track your
            spending.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-brand-border">
            {budgets.map((b) => {
              const meta = getCategoryMeta(b.category);
              return (
                <div
                  key={b.category}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-2">
                    <span>{meta.icon}</span>
                    <span className="text-sm font-medium">{b.category}</span>
                  </div>
                  <span className="text-sm font-bold">
                    {formatAmount(Number(b.amount))}
                  </span>
                </div>
              );
            })}
          </div>
        )}
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
