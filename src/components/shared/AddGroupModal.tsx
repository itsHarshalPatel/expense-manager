"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GroupSchema, type GroupInput } from "@/lib/validations";
import { createGroup } from "@/actions/group.actions";
import { GROUP_CATEGORIES } from "@/constants/data";
import { useRouter } from "next/navigation";

export default function AddGroupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GroupInput>({
    resolver: zodResolver(GroupSchema),
  });

  const onSubmit = async (data: GroupInput) => {
    setError("");
    const result = await createGroup(data);
    if (result.success) {
      reset();
      setIsOpen(false);
      router.refresh();
    } else {
      setError(result.error ?? "Something went wrong");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="common-btn relative z-20"
      >
        + Create Group
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h1 className="text-xl font-bold mb-6">Create Group</h1>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Group Name *</label>
                <input
                  {...register("name")}
                  placeholder="e.g. GSFC Friends"
                  className="w-full px-3 py-2 border border-brand-border rounded-app text-sm focus:outline-none focus:border-brand-black"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Category *</label>
                <select
                  {...register("category")}
                  className="w-full px-3 py-2 border border-brand-border rounded-app text-sm focus:outline-none focus:border-brand-black bg-white"
                >
                  <option value="">Select category</option>
                  {GROUP_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.icon} {c.value}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  {...register("description")}
                  placeholder="What is this group for?"
                  rows={3}
                  className="w-full px-3 py-2 border border-brand-border rounded-app text-sm focus:outline-none focus:border-brand-black resize-none"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-app">
                  {error}
                </p>
              )}

              <div className="flex justify-between gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setIsOpen(false);
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="common-btn"
                >
                  {isSubmitting ? "Creating..." : "Create Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
