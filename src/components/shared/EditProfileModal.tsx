"use client";

import { useState } from "react";
import { updateProfile } from "@/actions/user.actions";
import { MdEdit } from "react-icons/md";

interface Props {
  name: string;
  phone: string | null;
  paymentHandle: string | null;
}

export default function EditProfileModal({
  name,
  phone,
  paymentHandle,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: name ?? "",
    phone: phone ?? "",
    paymentHandle: paymentHandle ?? "",
  });

  const inputClass =
    "w-full px-3 py-2.5 border border-brand-border rounded-app text-sm bg-white focus:outline-none focus:border-brand-black transition-colors";
  const labelClass = "text-sm font-medium text-gray-700";

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const res = await updateProfile(form);
    setLoading(false);
    if (res.success) setOpen(false);
    else setError(res.error ?? "Something went wrong");
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-outline">
        <MdEdit size={14} />
        <span>Edit</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-app w-full max-w-md p-6 flex flex-col gap-4 shadow-xl">
            <h2 className="text-lg font-bold">Edit Profile</h2>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">
                  Name
                </label>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Your name"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">
                  Phone
                </label>
                <input
                  className={inputClass}
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+49 123 456 7890"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">
                  Payment Handle
                </label>
                <input
                  className={inputClass}
                  value={form.paymentHandle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, paymentHandle: e.target.value }))
                  }
                  placeholder="e.g. @yourname on PayPal / UPI ID"
                />
                <p className="text-xs text-gray-400">
                  Shown to friends when settling up
                </p>
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex gap-2 justify-end mt-1">
              <button
                onClick={() => setOpen(false)}
                className="btn-outline"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="common-btn"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
