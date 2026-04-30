"use client";

import { useState } from "react";
import { formatAmount, formatDate } from "@/lib/utils";
import { getCategoryMeta } from "@/constants/data";
import {
  toggleRecurringActive,
  deleteRecurringTransaction,
  confirmRecurringTransaction,
} from "@/actions/recurring.actions";
import { MdEdit, MdRepeat } from "react-icons/md";
import { FaCheck, FaTrash } from "react-icons/fa";
import RecurringForm from "./RecurringForm";

interface Props {
  item: {
    id: string;
    title: string;
    description: string;
    category: string;
    paymentMethod: string;
    paymentType: string;
    amount: any;
    remark: string;
    frequency: string;
    nextDueDate: Date;
    isActive: boolean;
    groupId: string | null;
    group: { id: string; name: string } | null;
  };
  groups: { id: string; name: string }[];
  isDue: boolean;
}

const FREQ_LABELS: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  monthly: "Monthly",
  yearly: "Yearly",
};

export default function RecurringCard({ item, groups, isDue }: Props) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const meta = getCategoryMeta(item.category);

  async function handleToggle() {
    setLoading(true);
    await toggleRecurringActive(item.id);
    setLoading(false);
  }

  async function handleConfirm() {
    setLoading(true);
    await confirmRecurringTransaction(item.id);
    setLoading(false);
    setConfirming(false);
  }

  async function handleDelete(mode: "single" | "future") {
    setLoading(true);
    await deleteRecurringTransaction(item.id, mode);
    setLoading(false);
    setDeleting(false);
  }

  if (editing) {
    return (
      <div className="bg-brand-white rounded-app border border-brand-border p-5">
        <h3 className="text-sm font-bold mb-4">Edit Recurring</h3>
        <RecurringForm
          groups={groups}
          initial={{ ...item, amount: Number(item.amount) }}
          onSuccess={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div
      className={`bg-brand-white rounded-app border p-4 transition-all ${
        isDue ? "border-yellow-300 bg-yellow-50" : "border-brand-border"
      } ${!item.isActive ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 bg-brand-light rounded-app flex items-center justify-center flex-shrink-0 text-lg">
            {meta.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold truncate">{item.title}</p>
              {isDue && (
                <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                  Due
                </span>
              )}
              {!item.isActive && (
                <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                  Paused
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {FREQ_LABELS[item.frequency]} · Next:{" "}
              {formatDate(item.nextDueDate)}
            </p>
            {item.group && (
              <p className="text-xs text-gray-400">{item.group.name}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <p
            className={`text-sm font-bold ${item.paymentMethod === "Credit" ? "text-green-600" : "text-red-500"}`}
          >
            {item.paymentMethod === "Credit" ? "+" : "-"}
            {formatAmount(Number(item.amount))}
          </p>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-brand-border flex-wrap">
        {isDue && item.isActive && !confirming && (
          <button
            onClick={() => setConfirming(true)}
            className="common-btn text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <FaCheck size={10} /> Confirm
          </button>
        )}
        {confirming && (
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500">Add to transactions?</p>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="common-btn text-xs py-1 px-2"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="btn-outline text-xs py-1 px-2"
            >
              No
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {/* Pause toggle */}
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`text-xs px-3 py-1.5 rounded-app border transition-all font-medium ${
              item.isActive
                ? "border-brand-border text-gray-500 hover:border-brand-black"
                : "border-green-300 text-green-600 hover:border-green-500"
            }`}
          >
            {item.isActive ? "Pause" : "Resume"}
          </button>
          <button
            onClick={() => setEditing(true)}
            className="btn-outline text-xs py-1.5 px-2"
          >
            <MdEdit size={13} />
          </button>
          {!deleting && (
            <button
              onClick={() => setDeleting(true)}
              className="btn-outline text-xs py-1.5 px-2 text-red-400 border-red-200 hover:border-red-400"
            >
              <FaTrash size={11} />
            </button>
          )}
          {deleting && (
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-gray-500">Delete:</p>
              <button
                onClick={() => handleDelete("single")}
                disabled={loading}
                className="text-xs px-2 py-1 bg-red-50 border border-red-300 text-red-500 rounded-app hover:bg-red-100"
              >
                This only
              </button>
              <button
                onClick={() => handleDelete("future")}
                disabled={loading}
                className="text-xs px-2 py-1 bg-red-500 text-white rounded-app hover:bg-red-600"
              >
                Stop recurring
              </button>
              <button
                onClick={() => setDeleting(false)}
                className="text-xs px-2 py-1 border border-brand-border rounded-app"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
