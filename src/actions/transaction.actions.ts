"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { TransactionSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

// ── Create Transaction ──────────────────────────────────
export async function createTransaction(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = TransactionSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errorDs[0].message };
  }

  const data = parsed.data;

  try {
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        paymentMethod: data.paymentMethod,
        paymentType: data.paymentType,
        amount: data.amount,
        remark: data.remark ?? "",
        paymentDate: new Date(data.paymentDate),
        groupId: data.groupId || null,
      },
    });

    revalidatePath("/transaction");
    return { success: true, data: transaction };
  } catch (error) {
    return { success: false, error: "Failed to create transaction" };
  }
}

// ── Update Transaction ──────────────────────────────────
export async function updateTransaction(id: string, formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = TransactionSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const data = parsed.data;

  try {
    // Make sure the transaction belongs to this user
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) return { success: false, error: "Transaction not found" };

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        paymentMethod: data.paymentMethod,
        paymentType: data.paymentType,
        amount: data.amount,
        remark: data.remark ?? "",
        paymentDate: new Date(data.paymentDate),
        groupId: data.groupId || null,
      },
    });

    revalidatePath("/transaction");
    revalidatePath(`/transaction/${id}`);
    return { success: true, data: transaction };
  } catch (error) {
    return { success: false, error: "Failed to update transaction" };
  }
}

// ── Delete Transaction ──────────────────────────────────
export async function deleteTransaction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    // Make sure the transaction belongs to this user
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) return { success: false, error: "Transaction not found" };

    await prisma.transaction.delete({ where: { id } });

    revalidatePath("/transaction");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete transaction" };
  }
}

// ── Get All Transactions ────────────────────────────────
export async function getTransactions() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.transaction.findMany({
    where: { userId: session.user.id },
    include: { group: true, contributors: { include: { friend: true } } },
    orderBy: { paymentDate: "desc" },
  });
}

// ── Get Single Transaction ──────────────────────────────
export async function getTransactionById(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.transaction.findFirst({
    where: { id, userId: session.user.id },
    include: { group: true, contributors: { include: { friend: true } } },
  });
}

export async function getDashboardData() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  const now = new Date();

  // Current month range
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // All transactions
  const allTransactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { paymentDate: "desc" },
  });

  // This month
  const thisMonthTransactions = allTransactions.filter(
    (t) => new Date(t.paymentDate) >= startOfMonth,
  );

  // Last month
  const lastMonthTransactions = allTransactions.filter(
    (t) =>
      new Date(t.paymentDate) >= startOfLastMonth &&
      new Date(t.paymentDate) <= endOfLastMonth,
  );

  // Total this month
  const totalThisMonth = thisMonthTransactions
    .filter((t) => t.paymentMethod === "Debit")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Total last month
  const totalLastMonth = lastMonthTransactions
    .filter((t) => t.paymentMethod === "Debit")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Category breakdown this month
  const categoryMap: Record<string, number> = {};
  thisMonthTransactions
    .filter((t) => t.paymentMethod === "Debit")
    .forEach((t) => {
      categoryMap[t.category] =
        (categoryMap[t.category] || 0) + Number(t.amount);
    });

  const categoryData = Object.entries(categoryMap)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  // Monthly trend — last 6 months
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthName = monthStart.toLocaleString("default", { month: "short" });

    const monthTransactions = allTransactions.filter(
      (t) =>
        new Date(t.paymentDate) >= monthStart &&
        new Date(t.paymentDate) <= monthEnd,
    );

    const debit = monthTransactions
      .filter((t) => t.paymentMethod === "Debit")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const credit = monthTransactions
      .filter((t) => t.paymentMethod === "Credit")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    monthlyData.push({ month: monthName, debit, credit });
  }

  // Recent transactions
  const recentTransactions = allTransactions.slice(0, 5);

  return {
    totalThisMonth,
    totalLastMonth,
    changePercent:
      totalLastMonth > 0
        ? Math.round(((totalThisMonth - totalLastMonth) / totalLastMonth) * 100)
        : 0,
    categoryData,
    monthlyData,
    recentTransactions,
    totalTransactions: allTransactions.length,
  };
}
