"use client";

import { useState } from "react";
import { updateFriend } from "@/actions/friend.actions";
import { useRouter } from "next/navigation";
import { HiX } from "react-icons/hi";

interface Friend {
  id: string;
  name: string;
  prefix?: string | null;
  phone?: string | null;
  location?: string | null;
  group?: string | null;
}

interface Props {
  friend: Friend;
}

export default function EditFriendModal({ friend }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    name: friend.name,
    prefix: friend.prefix ?? "",
    phone: friend.phone ?? "",
    location: friend.location ?? "",
    group: friend.group ?? "",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError("");

    const result = await updateFriend(friend.id, form);

    if (result.success) {
      setOpen(false);
      router.refresh();
    } else {
      setError(result.error ?? "Failed to update");
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 border border-brand-border rounded-app text-sm bg-white focus:outline-none focus:border-brand-black transition-colors";
  const labelClass = "text-sm font-medium text-gray-700";

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-outline">
        Edit
      </button>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: "DM Serif Display, serif" }}
              >
                Edit Friend
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-app hover:bg-brand-light transition-all"
              >
                <HiX size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-[80px_1fr] gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Prefix</label>
                  <input
                    value={form.prefix}
                    onChange={(e) => handleChange("prefix", e.target.value)}
                    placeholder="Mr."
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Full name"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+49 123 456789"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Location</label>
                <input
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="City"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Group / Label</label>
                <input
                  value={form.group}
                  onChange={(e) => handleChange("group", e.target.value)}
                  placeholder="e.g. TU Ilmenau"
                  className={inputClass}
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

            <div className="flex gap-3 mt-6 pt-4 border-t border-brand-border">
              <button
                onClick={() => setOpen(false)}
                className="btn-outline flex-1 justify-center"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex-1 justify-center"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
