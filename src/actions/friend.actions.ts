"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { FriendSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getFriends() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.friend.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFriendById(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.friend.findFirst({
    where: { id, userId: session.user.id },
    include: {
      contributions: {
        include: {
          transaction: {
            include: { group: true },
          },
        },
      },
    },
  });
}

export async function createFriend(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = FriendSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const friend = await prisma.friend.create({
      data: {
        userId: session.user.id,
        ...parsed.data,
      },
    });

    revalidatePath("/friend");
    return { success: true, data: friend };
  } catch (error) {
    return { success: false, error: "Failed to add friend" };
  }
}

export async function updateFriend(id: string, formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = FriendSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const existing = await prisma.friend.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) return { success: false, error: "Friend not found" };

    const friend = await prisma.friend.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/friend");
    revalidatePath(`/friend/${id}`);
    return { success: true, data: friend };
  } catch (error) {
    return { success: false, error: "Failed to update friend" };
  }
}

export async function deleteFriend(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const existing = await prisma.friend.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) return { success: false, error: "Friend not found" };

    await prisma.friend.delete({ where: { id } });

    revalidatePath("/friend");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete friend" };
  }
}

export async function toggleFavourite(id: string, isFavourite: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    await prisma.friend.update({
      where: { id },
      data: { isFavourite },
    });

    revalidatePath("/friend");
    revalidatePath(`/friend/${id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update favourite" };
  }
}

export async function getFriendBalance(friendId: string) {
  const session = await auth();
  if (!session?.user?.id) return 0;

  const contributions = await prisma.transactionContributor.findMany({
    where: { friendId },
    include: { transaction: true },
  });

  return contributions.reduce((total: number, c: any) => {
    const amount = Number(c.amount);
    return c.transaction.paymentMethod === "Credit"
      ? total + amount
      : total - amount;
  }, 0);
}
