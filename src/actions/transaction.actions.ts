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
