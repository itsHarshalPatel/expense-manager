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

interface Friend {
  id: string;
  name: string;
  prefix: string | null;
}

interface Group {
  id: string;
  name: string;
  category: string;
}

interface Contributor {
  friendId: string;
  friendName: string;
  amount: number;
}

interface Props {
  friends?: Friend[];
  groups?: Group[];
  transaction?: {
    id: string;
    title: string;
    description: string;
    category: string;
    paymentMethod: string;
    paymentType: string;
    amount: number | string;
    remark: string;
    paymentDate: Date;
    groupId?: string | null;
    paidByFriendId?: string | null;
    contributors?: {
      friendId: string;
      friend: { name: string; prefix: string | null };
      amount: number | string;
    }[];
  };
}

export default function TransactionForm({
  transaction,
  friends = [],
  groups = [],
}: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const isEditing = !!transaction;

  const [contributors, setContributors] = useState<Contributor[]>(
    transaction?.contributors?.map((c) => ({
      friendId: c.friendId,
      friendName: `${c.friend.prefix ?? ""} ${c.friend.name}`.trim(),
      amount: Number(c.amount),
    })) ?? [],
  );
  const [selectedFriendId, setSelectedFriendId] = useState("");
  const [contributorAmount, setContributorAmount] = useState("");

  const [paidBy, setPaidBy] = useState<"me" | "friend">(
    transaction?.paidByFriendId ? "friend" : "me",
  );
  const [paidByFriendId, setPaidByFriendId] = useState(
    transaction?.paidByFriendId ?? "",
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TransactionInput>({
    resolver: zodResolver(TransactionSchema) as any,
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

  const handleAddContributor = () => {
    const friend = friends.find((f) => f.id === selectedFriendId);
    if (!friend || !contributorAmount) return;
    if (contributors.find((c) => c.friendId === selectedFriendId)) return;

    setContributors([
      ...contributors,
      {
        friendId: friend.id,
        friendName: `${friend.prefix ?? ""} ${friend.name}`.trim(),
        amount: parseFloat(contributorAmount),
      },
    ]);
    setSelectedFriendId("");
    setContributorAmount("");
  };

  const handleRemoveContributor = (friendId: string) => {
    setContributors(contributors.filter((c) => c.friendId !== friendId));
  };

  const onSubmit = async (data: TransactionInput) => {
    setError("");
    const payload = {
      ...data,
      contributors,
      paidByFriendId: paidBy === "friend" ? paidByFriendId : undefined,
    };
    const result = isEditing
      ? await updateTransaction(transaction.id, payload)
      : await createTransaction(payload);

    if (result.success) {
      router.push(
        isEditing ? `/transaction/${transaction.id}` : "/transaction",
      );
    } else {
      setError(result.error ?? "Something went wrong");
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 border border-brand-border rounded-app text-sm bg-white focus:outline-none focus:border-brand-black transition-colors";
  const labelClass = "text-sm font-medium text-gray-700";

  return (
    <div className="max-w-2xl mx-auto px-2 py-4">
      <h2
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        {isEditing ? "Edit Transaction" : "Add Transaction"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Title</label>
          <input
            {...register("title")}
            placeholder="e.g. Kaufland groceries"
            className={inputClass}
          />
          {errors.title && (
            <p className="text-red-500 text-xs">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Description</label>
          <textarea
            {...register("description")}
            placeholder="Add details about this transaction"
            rows={2}
            className={`${inputClass} resize-none`}
          />
          {errors.description && (
            <p className="text-red-500 text-xs">{errors.description.message}</p>
          )}
        </div>

        {/* Amount + Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Amount (€)</label>
            <input
              {...register("amount")}
              type="number"
              step="0.01"
              placeholder="0.00"
              className={inputClass}
            />
            {errors.amount && (
              <p className="text-red-500 text-xs">{errors.amount.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Date</label>
            <input
              {...register("paymentDate")}
              type="date"
              className={inputClass}
            />
            {errors.paymentDate && (
              <p className="text-red-500 text-xs">
                {errors.paymentDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Category + Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Category</label>
            <select {...register("category")} className={inputClass}>
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
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Payment Method</label>
            <select {...register("paymentMethod")} className={inputClass}>
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

        {/* Payment Type + Group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Payment Type</label>
            <select {...register("paymentType")} className={inputClass}>
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
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Group (optional)</label>
            <select {...register("groupId")} className={inputClass}>
              <option value="">No group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Remark */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Remark (optional)</label>
          <input
            {...register("remark")}
            placeholder="Any additional note"
            className={inputClass}
          />
        </div>

        {/* Who paid? */}
        <label className={labelClass}>Who paid?</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPaidBy("me")}
            className={`flex-1 py-2 rounded-app text-sm font-medium border-2 transition-all duration-200 ${
              paidBy === "me"
                ? "bg-brand-black text-white border-brand-black"
                : "bg-white text-gray-500 border-brand-border hover:border-brand-black hover:text-brand-black"
            }`}
          >
            I paid
          </button>
          <button
            type="button"
            onClick={() => setPaidBy("friend")}
            className={`flex-1 py-2 rounded-app text-sm font-medium border-2 transition-all duration-200 ${
              paidBy === "friend"
                ? "bg-brand-black text-white border-brand-black"
                : "bg-white text-gray-500 border-brand-border hover:border-brand-black hover:text-brand-black"
            }`}
          >
            Friend paid
          </button>
        </div>
        {paidBy === "friend" && (
          <div className="flex flex-col gap-1.5 mt-2">
            <label className={labelClass}>Which friend paid?</label>
            <select
              value={paidByFriendId}
              onChange={(e) => setPaidByFriendId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select friend</option>
              {friends.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.prefix ?? ""} {f.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Contributors */}
        <div className="flex flex-col gap-3">
          <label className={labelClass}>Contributors</label>

          {/* Existing contributors */}
          {contributors.length > 0 && (
            <div className="flex flex-col gap-2">
              {contributors.map((c) => (
                <div
                  key={c.friendId}
                  className="flex items-center justify-between px-3 py-2 bg-brand-light rounded-app"
                >
                  <span className="text-sm font-medium">{c.friendName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">
                      €{c.amount.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveContributor(c.friendId)}
                      className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add contributor row */}
          {friends.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_80px] gap-2">
              <select
                value={selectedFriendId}
                onChange={(e) => setSelectedFriendId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select friend</option>
                {friends
                  .filter((f) => !contributors.find((c) => c.friendId === f.id))
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.prefix ?? ""} {f.name}
                    </option>
                  ))}
              </select>
              <input
                type="number"
                step="0.01"
                placeholder="€ Amount"
                value={contributorAmount}
                onChange={(e) => setContributorAmount(e.target.value)}
                className={inputClass}
              />
              <button
                type="button"
                onClick={handleAddContributor}
                className="btn-outline hover:btn-primary px-3 justify-center"
              >
                Add
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              Add friends first to track contributors.
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-app">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-brand-border">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-outline px-6"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary px-6 py-2.5 text-base font-semibold"
          >
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
