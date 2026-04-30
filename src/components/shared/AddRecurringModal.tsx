"use client";

import { useState } from "react";
import RecurringForm from "./RecurringForm";

interface Props {
  groups: { id: string; name: string }[];
}

export default function AddRecurringModal({ groups }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="common-btn">
        + Add
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-app w-full max-w-lg p-6 flex flex-col gap-4 shadow-xl my-auto">
            <h2 className="text-lg font-bold">New Recurring Transaction</h2>
            <RecurringForm
              groups={groups}
              onSuccess={() => setOpen(false)}
              onCancel={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
