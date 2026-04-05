"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteFriend } from "@/actions/friend.actions";
import { MdDelete } from "react-icons/md";

export default function DeleteFriendButton({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteFriend(id);
    if (result.success) {
      router.push("/friend");
    } else {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn-danger">
        <MdDelete size={15} />
        <span>Remove</span>
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h1 className="text-xl font-bold mb-2">Delete Friend?</h1>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure? All transactions linked to this friend will also be
              removed.
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
                {isDeleting ? "Removing..." : "Yes, Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
