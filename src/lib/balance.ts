import { Decimal } from "@prisma/client/runtime/library";

interface Contribution {
  amount: number | string | Decimal;
  settled: boolean;
  transaction: {
    paidByFriendId: string | null;
  };
}

export function calculateBalance(
  friendId: string,
  contributions: Contribution[],
): number {
  let balance = 0;

  for (const c of contributions) {
    if (c.settled) continue;
    const amount = Number(c.amount);
    if (c.transaction.paidByFriendId === friendId) {
      balance -= amount;
    } else {
      balance += amount;
    }
  }

  return balance;
}
