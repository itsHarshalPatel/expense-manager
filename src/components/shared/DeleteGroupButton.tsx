"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteGroup } from "@/actions/group.actions";
import { MdDelete } from "react-icons/md";

export default function DeleteGroupButton({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteGroup(id);
    if (result.success) {
      router.push("/group");
    } else {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn-danger">
        <MdDelete size={15} />
        <span>Delete</span>
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h1 className="text-xl font-bold mb-2">Delete Group?</h1>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure? This will delete the group but not the transactions
              inside it.
            </p>
            <div className="flex justify-between gap-3">
              <button onClick={() => setIsOpen(false)} className="btn-outline">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn-danger bg-red-500 text-white border-red-500"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
