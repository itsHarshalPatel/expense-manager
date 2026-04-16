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
    return { success: false, error: parsed.error.issues[0].message };
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
  } catch (_) {
    return { success: false, error: "Failed to add friend" };
  }
}

export async function updateFriend(id: string, formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = FriendSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
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

export async function getFriendWithBalance(friendId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const friend = await prisma.friend.findFirst({
    where: { id: friendId, userId: session.user.id },
    include: {
      contributions: {
        include: { transaction: true },
      },
    },
  });

  if (!friend) return null;

  // Also fetch transactions where this friend paid
  const friendPaidTransactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      paidByFriendId: friendId,
    },
    include: {
      contributors: {
        where: { friendId },
      },
    },
  });

  let balance = 0;

  // You paid — friend contributed — friend owes you
  friend.contributions.forEach((c: any) => {
    if (!c.transaction.paidByFriendId) {
      if (!c.settled) balance += Number(c.amount);
    }
  });

  // Friend paid — you owe friend the full amount
  friendPaidTransactions.forEach((t: any) => {
    const unsettled =
      t.contributors.length === 0 || !t.contributors[0]?.settled;
    if (unsettled) balance -= Number(t.amount);
  });
  // Merge all transactions for display
  const allContributions = [
    ...friend.contributions,
    ...friendPaidTransactions.map((t: any) => ({
      id: t.contributors[0]?.id ?? t.id,
      amount: t.amount, // use full transaction amount
      settled: t.contributors[0]?.settled ?? false,
      transaction: { ...t, paidByFriendId: friendId },
    })),
  ];

  return { ...friend, balance, contributions: allContributions };
}

export async function getFriendBalances(): Promise<Record<string, number>> {
  const session = await auth();
  if (!session?.user?.id) return {};

  const friends = await prisma.friend.findMany({
    where: { userId: session.user.id },
    include: {
      contributions: {
        include: { transaction: true },
      },
    },
  });

  const balances: Record<string, number> = {};

  for (const friend of friends) {
    let balance = 0;
    friend.contributions.forEach((c: any) => {
      if (!(c as any).settled) {
        if (!c.transaction.paidByFriendId) {
          balance += Number(c.amount);
        } else {
          balance -= Number(c.amount);
        }
      }
    });
    balances[friend.id] = balance;
  }

  return balances;
}

export async function settleContributor(contributorId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    await (prisma.transactionContributor as any).update({
      where: { id: contributorId },
      data: {
        settled: true,
        settledAt: new Date(),
      },
    });

    revalidatePath("/friend");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to settle" };
  }
}

export async function getPendingSettlements() {
  const session = await auth();
  if (!session?.user?.id) return { totalOwed: 0, totalOwe: 0 };

  const friends = await prisma.friend.findMany({
    where: { userId: session.user.id },
    include: {
      contributions: {
        where: { settled: false } as any,
        include: { transaction: true },
      },
    },
  });

  let totalOwed = 0; // friends owe you
  let totalOwe = 0; // you owe friends

  friends.forEach((friend) => {
    friend.contributions.forEach((c: any) => {
      if (c.transaction.paidByFriendId === friend.id) {
        totalOwe += Number(c.amount);
      } else {
        totalOwed += Number(c.amount);
      }
    });
  });

  return { totalOwed, totalOwe };
}
