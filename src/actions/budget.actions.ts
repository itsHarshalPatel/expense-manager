"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { BUDGETABLE_CATEGORIES } from "@/constants/data";

export async function getBudgets() {
  try {
    const userId = await requireAuth();
    return prisma.budget.findMany({
      where: { userId },
      orderBy: { category: "asc" },
    });
  } catch {
    return [];
  }
}

export async function upsertBudgets(
  budgets: { category: string; amount: number }[],
) {
  try {
    const userId = await requireAuth();

    const validCategories: string[] = BUDGETABLE_CATEGORIES.map((c) => c.value);
    const invalid = budgets.find((b) => !validCategories.includes(b.category));
    if (invalid) return { success: false, error: "Invalid category" };

    const toDelete = budgets
      .filter((b) => b.amount <= 0)
      .map((b) => b.category);
    const toUpsert = budgets.filter((b) => b.amount > 0);

    await Promise.all([
      toDelete.length > 0
        ? prisma.budget.deleteMany({
            where: { userId, category: { in: toDelete } },
          })
        : Promise.resolve(),
      ...toUpsert.map((b) =>
        prisma.budget.upsert({
          where: { userId_category: { userId, category: b.category } },
          create: { userId, category: b.category, amount: b.amount },
          update: { amount: b.amount },
        }),
      ),
    ]);

    revalidatePath("/dashboard");
    revalidatePath("/setting");
    return { success: true };
  } catch (error) {
    console.error("[upsertBudgets]", error);
    return { success: false, error: "Failed to save budgets" };
  }
}
