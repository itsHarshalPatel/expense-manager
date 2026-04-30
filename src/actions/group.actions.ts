"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { GroupSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { isDemoUser } from "@/lib/demo";

export async function getGroups() {
  try {
    const userId = await requireAuth();
    return prisma.group.findMany({
      where: { userId },
      include: { transactions: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getGroupById(id: string) {
  try {
    const userId = await requireAuth();
    return prisma.group.findFirst({
      where: { id, userId },
      include: {
        transactions: {
          include: { contributors: { include: { friend: true } } },
          orderBy: { paymentDate: "desc" },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function createGroup(formData: unknown) {
  try {
    const userId = await requireAuth();
    if (isDemoUser(userId))
      return { success: false, error: "Demo account is read-only." };

    const parsed = GroupSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const group = await prisma.group.create({
      data: { userId, ...parsed.data },
    });

    revalidatePath("/group");
    return { success: true, data: group };
  } catch (error) {
    console.error("[createGroup]", error);
    return { success: false, error: "Failed to create group" };
  }
}

export async function deleteGroup(id: string) {
  try {
    const userId = await requireAuth();
    if (isDemoUser(userId))
      return { success: false, error: "Demo account is read-only." };

    const existing = await prisma.group.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Group not found" };

    await prisma.group.delete({ where: { id } });

    revalidatePath("/group");
    return { success: true };
  } catch (error) {
    console.error("[deleteGroup]", error);
    return { success: false, error: "Failed to delete group" };
  }
}
