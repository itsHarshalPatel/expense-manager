"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { isDemoUser } from "@/lib/demo";

const RecurringSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentType: z.string().min(1, "Payment type is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  remark: z.string().optional().default(""),
  frequency: z.enum(["weekly", "biweekly", "monthly", "yearly"]),
  nextDueDate: z.string().min(1, "Due date is required"),
  groupId: z.string().optional(),
});

function getNextDueDate(current: Date, frequency: string): Date {
  const next = new Date(current);
  switch (frequency) {
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "biweekly":
      next.setDate(next.getDate() + 14);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

export async function getRecurringTransactions() {
  try {
    const userId = await requireAuth();
    return prisma.recurringTransaction.findMany({
      where: { userId },
      include: { group: true },
      orderBy: { nextDueDate: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getDueRecurringTransactions() {
  try {
    const userId = await requireAuth();
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return prisma.recurringTransaction.findMany({
      where: { userId, isActive: true, nextDueDate: { lte: today } },
      orderBy: { nextDueDate: "asc" },
    });
  } catch {
    return [];
  }
}

export async function createRecurringTransaction(formData: unknown) {
  try {
    const userId = await requireAuth();
    if (isDemoUser(userId))
      return { success: false, error: "Demo account is read-only." };
    const parsed = RecurringSchema.safeParse(formData);
    if (!parsed.success)
      return { success: false, error: parsed.error.issues[0].message };

    const { groupId, nextDueDate, ...rest } = parsed.data;
    await prisma.recurringTransaction.create({
      data: {
        userId,
        ...rest,
        nextDueDate: new Date(nextDueDate),
        groupId: groupId || null,
      },
    });

    revalidatePath("/recurring");
    return { success: true };
  } catch (error) {
    console.error("[createRecurringTransaction]", error);
    return { success: false, error: "Failed to create recurring transaction" };
  }
}

export async function updateRecurringTransaction(
  id: string,
  formData: unknown,
) {
  try {
    const userId = await requireAuth();
    if (isDemoUser(userId))
      return { success: false, error: "Demo account is read-only." };
    const parsed = RecurringSchema.safeParse(formData);
    if (!parsed.success)
      return { success: false, error: parsed.error.issues[0].message };

    const existing = await prisma.recurringTransaction.findFirst({
      where: { id, userId },
    });
    if (!existing) return { success: false, error: "Not found" };

    const { groupId, nextDueDate, ...rest } = parsed.data;
    await prisma.recurringTransaction.update({
      where: { id },
      data: {
        ...rest,
        nextDueDate: new Date(nextDueDate),
        groupId: groupId || null,
      },
    });

    revalidatePath("/recurring");
    return { success: true };
  } catch (error) {
    console.error("[updateRecurringTransaction]", error);
    return { success: false, error: "Failed to update" };
  }
}

export async function toggleRecurringActive(id: string) {
  try {
    const userId = await requireAuth();
    if (isDemoUser(userId))
      return { success: false, error: "Demo account is read-only." };
    const existing = await prisma.recurringTransaction.findFirst({
      where: { id, userId },
    });
    if (!existing) return { success: false, error: "Not found" };

    await prisma.recurringTransaction.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    revalidatePath("/recurring");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[toggleRecurringActive]", error);
    return { success: false, error: "Failed to toggle" };
  }
}

export async function confirmRecurringTransaction(id: string) {
  try {
    const userId = await requireAuth();
    if (isDemoUser(userId))
      return { success: false, error: "Demo account is read-only." };
    const recurring = await prisma.recurringTransaction.findFirst({
      where: { id, userId },
    });
    if (!recurring) return { success: false, error: "Not found" };

    // Create the actual transaction
    await prisma.transaction.create({
      data: {
        userId,
        title: recurring.title,
        description: recurring.description,
        category: recurring.category,
        paymentMethod: recurring.paymentMethod,
        paymentType: recurring.paymentType,
        amount: recurring.amount,
        remark: recurring.remark,
        groupId: recurring.groupId,
        paymentDate: new Date(),
      },
    });

    // Advance nextDueDate
    await prisma.recurringTransaction.update({
      where: { id },
      data: {
        nextDueDate: getNextDueDate(recurring.nextDueDate, recurring.frequency),
      },
    });

    revalidatePath("/recurring");
    revalidatePath("/transaction");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[confirmRecurringTransaction]", error);
    return { success: false, error: "Failed to confirm" };
  }
}

export async function deleteRecurringTransaction(
  id: string,
  mode: "single" | "future",
) {
  try {
    const userId = await requireAuth();
    if (isDemoUser(userId))
      return { success: false, error: "Demo account is read-only." };
    const existing = await prisma.recurringTransaction.findFirst({
      where: { id, userId },
    });
    if (!existing) return { success: false, error: "Not found" };

    // Both modes delete the template — "future" is just a label distinction for UX clarity
    // Past transactions are always preserved since they're separate Transaction records
    await prisma.recurringTransaction.delete({ where: { id } });

    revalidatePath("/recurring");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[deleteRecurringTransaction]", error);
    return { success: false, error: "Failed to delete" };
  }
}
