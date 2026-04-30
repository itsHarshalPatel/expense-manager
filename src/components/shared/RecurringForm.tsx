"use client";

import { useState } from "react";
import {
  createRecurringTransaction,
  updateRecurringTransaction,
} from "@/actions/recurring.actions";
import { CATEGORIES, PAYMENT_METHODS, PAYMENT_TYPES } from "@/constants/data";
import Select from "@/components/ui/select";

interface Props {
  groups: { id: string; name: string }[];
  onSuccess: () => void;
  onCancel: () => void;
  initial?: {
    id: string;
    title: string;
    description: string;
    category: string;
    paymentMethod: string;
    paymentType: string;
    amount: number;
    remark: string;
    frequency: string;
    nextDueDate: Date;
    groupId: string | null;
  };
}

const FREQUENCIES = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export default function RecurringForm({
  groups,
  onSuccess,
  onCancel,
  initial,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "",
    paymentMethod: initial?.paymentMethod ?? "Debit",
    paymentType: initial?.paymentType ?? "Card",
    amount: initial?.amount?.toString() ?? "",
    remark: initial?.remark ?? "",
    frequency: initial?.frequency ?? "monthly",
    nextDueDate: initial?.nextDueDate
      ? new Date(initial.nextDueDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    groupId: initial?.groupId ?? "",
  });

  const inputClass =
    "w-full px-3 py-2.5 border border-brand-border rounded-app text-sm bg-white focus:outline-none focus:border-brand-black transition-colors";
  const labelClass = "text-sm font-medium text-gray-700";

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const payload = { ...form, amount: Number(form.amount) };
    const res = initial
      ? await updateRecurringTransaction(initial.id, payload)
      : await createRecurringTransaction(payload);
    setLoading(false);
    if (res.success) onSuccess();
    else setError(res.error ?? "Something went wrong");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Title</label>
          <input
            className={inputClass}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Rent"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Amount (€)
          </label>
          <input
            className={inputClass}
            type="number"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-sm font-medium text-gray-700">
            Description
          </label>
          <input
            className={inputClass}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Short description"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <Select
            value={form.category}
            onChange={(v) => set("category", v)}
            options={[
              { value: "", label: "Select category" },
              ...CATEGORIES.map((c) => ({
                value: c.value,
                label: `${c.icon} ${c.value}`,
              })),
            ]}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Frequency</label>
          <Select
            value={form.frequency}
            onChange={(v) => set("frequency", v)}
            options={FREQUENCIES.map((f) => ({
              value: f.value,
              label: f.label,
            }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Payment Method
          </label>
          <Select
            value={form.paymentMethod}
            onChange={(v) => set("paymentMethod", v)}
            options={PAYMENT_METHODS.map((m) => ({
              value: m.value,
              label: `${m.icon} ${m.value}`,
            }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Payment Type
          </label>
          <Select
            value={form.paymentType}
            onChange={(v) => set("paymentType", v)}
            options={PAYMENT_TYPES.map((t) => ({
              value: t.value,
              label: `${t.icon} ${t.value}`,
            }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Next Due Date
          </label>
          <input
            className={inputClass}
            type="date"
            value={form.nextDueDate}
            onChange={(e) => set("nextDueDate", e.target.value)}
          />
        </div>
        {groups.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Group (optional)
            </label>
            <Select
              value={form.groupId}
              onChange={(v) => set("groupId", v)}
              options={[
                { value: "", label: "No group" },
                ...groups.map((g) => ({ value: g.id, label: g.name })),
              ]}
            />
          </div>
        )}
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-sm font-medium text-gray-700">
            Remark (optional)
          </label>
          <input
            className={inputClass}
            value={form.remark}
            onChange={(e) => set("remark", e.target.value)}
            placeholder="Any notes"
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="btn-outline" disabled={loading}>
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="common-btn"
          disabled={loading}
        >
          {loading ? "Saving..." : initial ? "Update" : "Create"}
        </button>
      </div>
    </div>
  );
}
