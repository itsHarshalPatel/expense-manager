"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function getTransactionsForExport() {
  try {
    const userId = await requireAuth();

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        group: { select: { name: true } },
        contributors: { include: { friend: { select: { name: true } } } },
      },
      orderBy: { paymentDate: "desc" },
    });

    return transactions.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      paymentMethod: t.paymentMethod,
      paymentType: t.paymentType,
      amount: Number(t.amount),
      remark: t.remark,
      paymentDate: t.paymentDate.toISOString().split("T")[0],
      group: t.group?.name ?? "",
      contributors: t.contributors
        .map((c) => `${c.friend.name} (€${Number(c.amount).toFixed(2)})`)
        .join("; "),
    }));
  } catch (error) {
    console.error("[getTransactionsForExport]", error);
    return [];
  }
}
