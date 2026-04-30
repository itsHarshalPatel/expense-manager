"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { FriendSchema } from "@/lib/validations";
import { calculateBalance } from "@/lib/balance";
import { revalidatePath } from "next/cache";
import { isDemoUser } from "@/lib/demo";

export async function getFriends() {
  try {
    const userId = await requireAuth();
    return prisma.friend.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getFriendById(id: string) {
  try {
    const userId = await requireAuth();
    return prisma.friend.findFirst({
      where: { id, userId },
      include: {
        contributions: {
          include: { transaction: { include: { group: true } } },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function createFriend(formData: unknown) {
  try {
    const userId = await requireAuth();
    if (isDemoUser(userId))
      return { success: false, error: "Demo account is read-only." };

    const parsed = FriendSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const friend = await prisma.friend.create({
      data: { userId, ...parsed.data },
    });

    revalidatePath("/friend");
    return { success: true, data: friend };
  } catch (error) {
    console.error("[createFriend]", error);
    return { success: false, error: "Failed to add friend" };
  }
}

export async function updateFriend(id: string, formData: unknown) {
  try {
    const userId = await requireAuth();
    if (isDemoUser(userId))
      return { success: false, error: "Demo account is read-only." };

    const parsed = FriendSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const existing = await prisma.friend.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Friend not found" };

    const friend = await prisma.friend.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/friend");
    revalidatePath(`/friend/${id}`);
    return { success: true, data: friend };
  } catch (error) {
    console.error("[updateFriend]", error);
    return { success: false, error: "Failed to update friend" };
  }
}

export async function deleteFriend(id: string) {
  try {
    const userId = await requireAuth();
    if (isDemoUser(userId))
      return { success: false, error: "Demo account is read-only." };

    const existing = await prisma.friend.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Friend not found" };

    await prisma.friend.delete({ where: { id } });

    revalidatePath("/friend");
    return { success: true };
  } catch (error) {
    console.error("[deleteFriend]", error);
    return { success: false, error: "Failed to delete friend" };
  }
}

export async function toggleFavourite(id: string, isFavourite: boolean) {
  try {
    const userId = await requireAuth();
    if (isDemoUser(userId))
      return { success: false, error: "Demo account is read-only." };

    // Ownership check before update
    const existing = await prisma.friend.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Friend not found" };

    await prisma.friend.update({ where: { id }, data: { isFavourite } });

    revalidatePath("/friend");
    revalidatePath(`/friend/${id}`);
    return { success: true };
  } catch (error) {
    console.error("[toggleFavourite]", error);
    return { success: false, error: "Failed to update favourite" };
  }
}

// Uses shared calculateBalance — no more duplicated logic
export async function getFriendWithBalance(friendId: string) {
  try {
    const userId = await requireAuth();

    const friend = await prisma.friend.findFirst({
      where: { id: friendId, userId },
      include: {
        contributions: {
          include: { transaction: true },
        },
      },
    });

    if (!friend) return null;

    // Transactions where this friend paid — fetch with contributors
    const friendPaidTransactions = await prisma.transaction.findMany({
      where: { userId, paidByFriendId: friendId },
      include: {
        contributors: {
          where: { friendId },
        },
      },
    });

    let balance = 0;

    // Case: I paid, friend is contributor → friend owes me
    friend.contributions
      .filter((c) => !c.transaction.paidByFriendId) // only when I paid
      .forEach((c) => {
        if (!c.settled) balance += Number(c.amount);
      });

    // Case: Friend paid → I owe friend MY SHARE only (contributor amount)
    friendPaidTransactions.forEach((t) => {
      const myShare = t.contributors[0];
      if (myShare && !myShare.settled) {
        balance -= Number(myShare.amount);
      }
    });

    // Build display list
    const myContributions = friend.contributions.filter(
      (c) => !c.transaction.paidByFriendId,
    );

    const friendPaidEntries = friendPaidTransactions.map((t) => ({
      id: t.contributors[0]?.id ?? t.id,
      amount: t.contributors[0]?.amount ?? t.amount, // show MY SHARE not full amount
      settled: t.contributors[0]?.settled ?? false,
      settledAt: t.contributors[0]?.settledAt ?? null,
      transaction: { ...t, paidByFriendId: friendId },
    }));

    return {
      ...friend,
      balance,
      contributions: [...myContributions, ...friendPaidEntries],
    };
  } catch (error) {
    console.error("[getFriendWithBalance]", error);
    return null;
  }
}

export async function getFriendBalances(): Promise<Record<string, number>> {
  try {
    const userId = await requireAuth();

    const friends = await prisma.friend.findMany({
      where: { userId },
      include: {
        contributions: {
          include: { transaction: true },
        },
      },
    });

    const balances: Record<string, number> = {};

    for (const friend of friends) {
      let balance = 0;
      for (const c of friend.contributions) {
        if (c.settled) continue;
        if (c.transaction.paidByFriendId === friend.id) {
          // Friend paid — I owe my share (this contributor amount)
          balance -= Number(c.amount);
        } else {
          // I paid — friend owes me
          balance += Number(c.amount);
        }
      }
      balances[friend.id] = balance;
    }

    return balances;
  } catch (error) {
    console.error("[getFriendBalances]", error);
    return {};
  }
}

// Task 3 — removed the `as any` cast, settled/settledAt are in schema
export async function settleContributor(contributorId: string) {
  try {
    const userId = await requireAuth();
    if (isDemoUser(userId))
      return { success: false, error: "Demo account is read-only." };

    // Ownership check — verify the contributor belongs to this user's transaction
    const contributor = await prisma.transactionContributor.findFirst({
      where: { id: contributorId },
      include: { transaction: true },
    });

    if (!contributor || contributor.transaction.userId !== userId) {
      return { success: false, error: "Not found" };
    }

    await prisma.transactionContributor.update({
      where: { id: contributorId },
      data: { settled: true, settledAt: new Date() },
    });

    revalidatePath("/friend");
    return { success: true };
  } catch (error) {
    console.error("[settleContributor]", error);
    return { success: false, error: "Failed to settle" };
  }
}

// Pending Settlements
export async function getPendingSettlements() {
  try {
    const userId = await requireAuth();

    const contributors = await prisma.transactionContributor.findMany({
      where: {
        settled: false,
        transaction: { userId },
      },
      include: { transaction: true },
    });

    let totalOwed = 0; // friends owe me
    let totalOwe = 0; // I owe friends

    for (const c of contributors) {
      if (c.transaction.paidByFriendId) {
        // Friend paid — I owe my share
        totalOwe += Number(c.amount);
      } else {
        // I paid — friend owes me their share
        totalOwed += Number(c.amount);
      }
    }

    return { totalOwed, totalOwe };
  } catch (error) {
    console.error("[getPendingSettlements]", error);
    return { totalOwed: 0, totalOwe: 0 };
  }
}
