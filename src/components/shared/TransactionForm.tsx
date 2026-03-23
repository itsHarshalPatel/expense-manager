"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionSchema, type TransactionInput } from "@/lib/validations";
import {
  createTransaction,
  updateTransaction,
} from "@/actions/transaction.actions";
import { CATEGORIES, PAYMENT_METHODS, PAYMENT_TYPES } from "@/constants/data";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  transaction?: {
    id: string;
    title: string;
    description: string;
    category: string;
    paymentMethod: string;
    paymentType: string;
    amount: unknown;
    remark: string;
    paymentDate: Date;
    groupId?: string | null;
  };
}

export default function TransactionForm({ transaction }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const isEditing = !!transaction;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TransactionInput>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: transaction
      ? {
          title: transaction.title,
          description: transaction.description,
          category: transaction.category,
          paymentMethod: transaction.paymentMethod,
          paymentType: transaction.paymentType,
          amount: Number(transaction.amount),
          remark: transaction.remark,
          paymentDate: new Date(transaction.paymentDate)
            .toISOString()
            .split("T")[0],
          groupId: transaction.groupId ?? "",
        }
      : {
          paymentDate: new Date().toISOString().split("T")[0],
        },
  });

  const onSubmit = async (data: TransactionInput) => {
    setError("");
    const result = isEditing
      ? await updateTransaction(transaction.id, data)
      : await createTransaction(data);

    if (result.success) {
      router.push(
        isEditing ? `/transaction/${transaction.id}` : "/transaction",
      );
    } else {
      setError(result.error ?? "Something went wrong");
    }
  };
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>
  {isEditing ? "Edit Transaction" : "Add Transaction"}
</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Title */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Title</label>
          <input
            {...register("title")}
            placeholder="e.g. Lunch at McDonald's"
            className="w-full px-3 py-2 border border-brand-border rounded-app text-sm focus:outline-none focus:border-brand-black"
          />
          {errors.title && (
            <p className="text-red-500 text-xs">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Description</label>
          <textarea
            {...register("description")}
            placeholder="Add details about this transaction"
            rows={3}
            className="w-full px-3 py-2 border border-brand-border rounded-app text-sm focus:outline-none focus:border-brand-black resize-none"
          />
          {errors.description && (
            <p className="text-red-500 text-xs">{errors.description.message}</p>
          )}
        </div>

        {/* Amount + Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Amount (₹)</label>
            <input
              {...register("amount")}
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-brand-border rounded-app text-sm focus:outline-none focus:border-brand-black"
            />
            {errors.amount && (
              <p className="text-red-500 text-xs">{errors.amount.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Date</label>
            <input
              {...register("paymentDate")}
              type="date"
              className="w-full px-3 py-2 border border-brand-border rounded-app text-sm focus:outline-none focus:border-brand-black"
            />
            {errors.paymentDate && (
              <p className="text-red-500 text-xs">
                {errors.paymentDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Category + Payment Method */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Category</label>
            <select
              {...register("category")}
              className="w-full px-3 py-2 border border-brand-border rounded-app text-sm focus:outline-none focus:border-brand-black bg-white"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.icon} {c.value}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs">{errors.category.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Payment Method</label>
            <select
              {...register("paymentMethod")}
              className="w-full px-3 py-2 border border-brand-border rounded-app text-sm focus:outline-none focus:border-brand-black bg-white"
            >
              <option value="">Select method</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.icon} {m.value}
                </option>
              ))}
            </select>
            {errors.paymentMethod && (
              <p className="text-red-500 text-xs">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>
        </div>

        {/* Payment Type + Remark */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Payment Type</label>
            <select
              {...register("paymentType")}
              className="w-full px-3 py-2 border border-brand-border rounded-app text-sm focus:outline-none focus:border-brand-black bg-white"
            >
              <option value="">Select type</option>
              {PAYMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.icon} {t.value}
                </option>
              ))}
            </select>
            {errors.paymentType && (
              <p className="text-red-500 text-xs">
                {errors.paymentType.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Remark</label>
            <input
              {...register("remark")}
              placeholder="Optional note"
              className="w-full px-3 py-2 border border-brand-border rounded-app text-sm focus:outline-none focus:border-brand-black"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-app">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-app border-2 border-brand-border text-sm font-medium hover:bg-brand-border transition-all"
          >
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="common-btn">
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Add Transaction"}
          </button>
        </div>
      </form>
    </div>
  );
}
