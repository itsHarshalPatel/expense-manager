"use client";

import { useState } from "react";
import { settleContributor } from "@/actions/friend.actions";
import { useRouter } from "next/navigation";

export default function SettleButton({
  contributorId,
}: {
  contributorId: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSettle = async () => {
    setLoading(true);
    await settleContributor(contributorId);
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={handleSettle}
      disabled={loading}
      className="btn-success text-xs px-3 py-1"
    >
      {loading ? "..." : "Settle"}
    </button>
  );
}
