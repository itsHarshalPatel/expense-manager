"use client";

import { useState } from "react";
import { getTransactionsForExport } from "@/actions/export.actions";
import { HiDownload } from "react-icons/hi";

export default function ExportButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const data = await getTransactionsForExport();
      if (data.length === 0) {
        alert("No transactions to export.");
        return;
      }

      const headers = [
        "Date",
        "Title",
        "Description",
        "Category",
        "Payment Method",
        "Payment Type",
        "Amount (€)",
        "Group",
        "Contributors",
        "Remark",
      ];

      const rows = data.map((t) => [
        t.paymentDate,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${t.description.replace(/"/g, '""')}"`,
        t.category,
        t.paymentMethod,
        t.paymentType,
        t.amount.toFixed(2),
        `"${t.group}"`,
        `"${t.contributors}"`,
        `"${t.remark.replace(/"/g, '""')}"`,
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
        "\n",
      );

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `expense-manager-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="btn-outline gap-2"
    >
      <HiDownload size={15} />
      {loading ? "Exporting..." : "Export CSV"}
    </button>
  );
}
