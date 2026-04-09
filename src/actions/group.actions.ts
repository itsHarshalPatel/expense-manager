"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { GroupSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getGroups() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.group.findMany({
    where: { userId: session.user.id },
    include: { transactions: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getGroupById(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.group.findFirst({
    where: { id, userId: session.user.id },
    include: {
      transactions: {
        include: { contributors: { include: { friend: true } } },
        orderBy: { paymentDate: "desc" },
      },
    },
  });
}

export async function createGroup(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = GroupSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const group = await prisma.group.create({
      data: { userId: session.user.id, ...parsed.data },
    });
    revalidatePath("/group");
    return { success: true, data: group };
  } catch (error) {
    return { success: false, error: "Failed to create group" };
  }
}

export async function deleteGroup(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const existing = await prisma.group.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) return { success: false, error: "Group not found" };

    await prisma.group.delete({ where: { id } });
    revalidatePath("/group");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete group" };
  }
}
