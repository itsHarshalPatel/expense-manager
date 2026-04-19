"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { TransactionSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

// ── Create Transaction ──────────────────────────────────
export async function createTransaction(formData: unknown) {
  try {
    const userId = await requireAuth();

    const parsed = TransactionSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { contributors, paidByFriendId, groupId, myShare, ...rest } =
      parsed.data;

    // When friend paid: create one contributor entry for MY share only
    const contributorData = paidByFriendId
      ? myShare && myShare > 0
        ? [{ friendId: paidByFriendId, amount: myShare }]
        : []
      : contributors;

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        ...rest,
        paymentDate: new Date(rest.paymentDate),
        groupId: groupId || null,
        paidByFriendId: paidByFriendId || null,
        contributors: {
          create: contributorData.map((c) => ({
            friendId: c.friendId,
            amount: c.amount,
          })),
        },
      },
    });

    revalidatePath("/transaction");
    revalidatePath("/dashboard");
    return { success: true, data: transaction };
  } catch (error) {
    console.error("[createTransaction]", error);
    return { success: false, error: "Failed to create transaction" };
  }
}

// ── Update Transaction ──────────────────────────────────
export async function updateTransaction(id: string, formData: unknown) {
  try {
    const userId = await requireAuth();

    const parsed = TransactionSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing) return { success: false, error: "Transaction not found" };

    const { contributors, paidByFriendId, groupId, myShare, ...rest } =
      parsed.data;

    const contributorData = paidByFriendId
      ? myShare && myShare > 0
        ? [{ friendId: paidByFriendId, amount: myShare }]
        : []
      : contributors;

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...rest,
        paymentDate: new Date(rest.paymentDate),
        groupId: groupId || null,
        paidByFriendId: paidByFriendId || null,
        contributors: {
          deleteMany: {
            transactionId: id,
            friendId: { notIn: contributorData.map((c) => c.friendId) },
          },
          upsert: contributorData.map((c) => ({
            where: {
              transactionId_friendId: {
                transactionId: id,
                friendId: c.friendId,
              },
            },
            create: { friendId: c.friendId, amount: c.amount },
            update: { amount: c.amount },
          })),
        },
      },
    });

    revalidatePath("/transaction");
    revalidatePath(`/transaction/${id}`);
    revalidatePath("/dashboard");
    return { success: true, data: transaction };
  } catch (error) {
    console.error("[updateTransaction]", error);
    return { success: false, error: "Failed to update transaction" };
  }
}

// ── Delete Transaction ──────────────────────────────────
export async function deleteTransaction(id: string) {
  try {
    const userId = await requireAuth();

    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing) return { success: false, error: "Transaction not found" };

    await prisma.transaction.delete({ where: { id } });

    revalidatePath("/transaction");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[deleteTransaction]", error);
    return { success: false, error: "Failed to delete transaction" };
  }
}

// ── Get All Transactions ────────────────────────────────
export async function getTransactions() {
  try {
    const userId = await requireAuth();
    return prisma.transaction.findMany({
      where: { userId },
      include: { group: true, contributors: { include: { friend: true } } },
      orderBy: { paymentDate: "desc" },
    });
  } catch {
    return [];
  }
}

// ── Get Single Transaction ──────────────────────────────
export async function getTransactionById(id: string) {
  try {
    const userId = await requireAuth();
    return prisma.transaction.findFirst({
      where: { id, userId },
      include: { group: true, contributors: { include: { friend: true } } },
    });
  } catch {
    return null;
  }
}

// ── Dashboard Data ──────────────────────────────────────
export async function getDashboardData() {
  try {
    const userId = await requireAuth();
    const now = new Date();

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );

    const [
      thisMonthTx,
      lastMonthTx,
      recentTransactions,
      totalTransactions,
      allForChart,
    ] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId, paymentDate: { gte: startOfThisMonth } },
        select: {
          amount: true,
          category: true,
          paymentMethod: true,
          paidByFriendId: true,
          contributors: { select: { amount: true } },
        },
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          paymentDate: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        select: {
          amount: true,
          paymentMethod: true,
          paidByFriendId: true,
          contributors: { select: { amount: true } },
        },
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { paymentDate: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          category: true,
          paymentMethod: true,
          amount: true,
          paymentDate: true,
          paidByFriendId: true,
          contributors: { select: { amount: true } },
        },
      }),
      prisma.transaction.count({ where: { userId } }),
      prisma.transaction.findMany({
        where: {
          userId,
          paymentDate: {
            gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
          },
        },
        select: {
          amount: true,
          paymentMethod: true,
          paymentDate: true,
          paidByFriendId: true,
          contributors: { select: { amount: true } },
        },
      }),
    ]);

    // Helper: get the actual spend amount for a transaction
    // If friend paid → my share = contributor[0].amount
    // If I paid → full amount
    const getSpend = (t: {
      amount: { toNumber?: () => number } | number;
      paidByFriendId: string | null;
      contributors: { amount: { toNumber?: () => number } | number }[];
    }) => {
      if (t.paidByFriendId) {
        return t.contributors[0] ? Number(t.contributors[0].amount) : 0;
      }
      return Number(t.amount);
    };

    const totalThisMonth = thisMonthTx
      .filter((t) => t.paymentMethod === "Debit")
      .reduce((s, t) => s + getSpend(t), 0);

    const totalLastMonth = lastMonthTx
      .filter((t) => t.paymentMethod === "Debit")
      .reduce((s, t) => s + getSpend(t), 0);

    // Category breakdown — use actual spend
    const categoryMap: Record<string, number> = {};
    for (const t of thisMonthTx.filter((t) => t.paymentMethod === "Debit")) {
      const spend = getSpend(t);
      categoryMap[t.category] = (categoryMap[t.category] || 0) + spend;
    }
    const categoryData = Object.entries(categoryMap)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    // Monthly trend
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        0,
        23,
        59,
        59,
      );
      const monthName = monthStart.toLocaleString("default", {
        month: "short",
      });

      const monthTx = allForChart.filter((t) => {
        const d = new Date(t.paymentDate);
        return d >= monthStart && d <= monthEnd;
      });

      const debit = monthTx
        .filter((t) => t.paymentMethod === "Debit")
        .reduce((s, t) => s + getSpend(t), 0);
      const credit = monthTx
        .filter((t) => t.paymentMethod === "Credit")
        .reduce((s, t) => s + Number(t.amount), 0);

      monthlyData.push({ month: monthName, debit, credit });
    }

    return {
      totalThisMonth,
      totalLastMonth,
      changePercent:
        totalLastMonth > 0
          ? Math.round(
              ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100,
            )
          : 0,
      categoryData,
      monthlyData,
      recentTransactions,
      totalTransactions,
    };
  } catch (error) {
    console.error("[getDashboardData]", error);
    return null;
  }
}

// ── Friends + Groups for form ───────────────────────────
export async function getFriendsAndGroups() {
  try {
    const userId = await requireAuth();
    const [friends, groups] = await Promise.all([
      prisma.friend.findMany({ where: { userId }, orderBy: { name: "asc" } }),
      prisma.group.findMany({ where: { userId }, orderBy: { name: "asc" } }),
    ]);
    return { friends, groups };
  } catch {
    return { friends: [], groups: [] };
  }
}
