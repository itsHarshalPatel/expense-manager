"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FriendSchema, type FriendInput } from "@/lib/validations";
import { createFriend } from "@/actions/friend.actions";
import { useRouter } from "next/navigation";

const FRIEND_GROUPS = [
  "GSFC",
  "Traveler",
  "College",
  "Work",
  "Family",
  "Neighbor",
  "Other",
];

const PREFIXES = ["Mr.", "Ms.", "Mrs.", "Dr."];

export default function AddFriendModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FriendInput>({
    resolver: zodResolver(FriendSchema),
  });

  const onSubmit = async (data: FriendInput) => {
    setError("");
    const result = await createFriend(data);
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
        + Add Friend
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h1 className="text-xl font-bold mb-6">Add Friend</h1>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              {/* Prefix + Name */}
              <div className="grid grid-cols-[100px_1fr] gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Prefix</label>
                  <select
                    {...register("prefix")}
                    className="w-full px-3 py-2 border border-brand-border rounded-app text-sm focus:outline-none focus:border-brand-black bg-white"
                  >
                    <option value="">-</option>
                    {PREFIXES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Name *</label>
                  <input
                    {...register("name")}
                    placeholder="Full name"
                    className="w-full px-3 py-2 border border-brand-border rounded-app text-sm focus:outline-none focus:border-brand-black"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Phone</label>
                <input
                  {...register("phone")}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-3 py-2 border border-brand-border rounded-app text-sm focus:outline-none focus:border-brand-black"
                />
              </div>

              {/* Location */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Location</label>
                <input
                  {...register("location")}
                  placeholder="City or area"
                  className="w-full px-3 py-2 border border-brand-border rounded-app text-sm focus:outline-none focus:border-brand-black"
                />
              </div>

              {/* Group */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Group</label>
                <select
                  {...register("group")}
                  className="w-full px-3 py-2 border border-brand-border rounded-app text-sm focus:outline-none focus:border-brand-black bg-white"
                >
                  <option value="">Select group</option>
                  {FRIEND_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
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
                  className="btn-primary"
                >
                  {isSubmitting ? "Adding..." : "Add Friend"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
