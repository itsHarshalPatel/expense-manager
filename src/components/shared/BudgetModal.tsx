"use client";

import { useState } from "react";
import { BUDGETABLE_CATEGORIES } from "@/constants/data";
import { upsertBudgets } from "@/actions/budget.actions";
import { HiX } from "react-icons/hi";

import { getBudgets } from "@/actions/budget.actions";
type Budget = Awaited<ReturnType<typeof getBudgets>>[number];

interface Props {
  existingBudgets: Budget[];
  onClose: () => void;
}

export default function BudgetModal({ existingBudgets, onClose }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    existingBudgets.forEach((b) => {
      map[b.category] = Number(b.amount).toFixed(2);
    });
    return map;
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (category: string, value: string) => {
    setValues((prev) => ({ ...prev, [category]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    const budgets = BUDGETABLE_CATEGORIES.map((c) => ({
      category: c.value,
      amount: parseFloat(values[c.value] ?? "0") || 0,
    }));

    const result = await upsertBudgets(budgets);

    if (result.success) {
      onClose();
    } else {
      setError(result.error ?? "Something went wrong");
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Monthly Budgets
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Leave blank or set 0 to remove a budget
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-app hover:bg-brand-light transition-all"
          >
            <HiX size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Category list */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
          {BUDGETABLE_CATEGORIES.map((cat) => (
            <div
              key={cat.value}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2 w-40 flex-shrink-0">
                <span className="text-base">{cat.icon}</span>
                <span className="text-sm font-medium">{cat.value}</span>
              </div>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  €
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="No budget"
                  value={values[cat.value] ?? ""}
                  onChange={(e) => handleChange(cat.value, e.target.value)}
                  className="w-full pl-7 pr-3 py-2 border border-brand-border rounded-app text-sm bg-white focus:outline-none focus:border-brand-black transition-colors"
                />
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-brand-border">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline flex-1 justify-center"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex-1 justify-center"
          >
            {saving ? "Saving..." : "Save Budgets"}
          </button>
        </div>
      </div>
    </div>
  );
}
