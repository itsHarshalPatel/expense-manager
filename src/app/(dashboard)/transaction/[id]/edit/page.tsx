import {
  getTransactionById,
  getFriendsAndGroups,
} from "@/actions/transaction.actions";
import { notFound } from "next/navigation";
import TransactionForm from "@/components/shared/TransactionForm";

export default async function EditTransactionPage({
  params,
}: {
  params: { id: string };
}) {
  const [transaction, { friends, groups }] = await Promise.all([
    getTransactionById(params.id),
    getFriendsAndGroups(),
  ]);

  if (!transaction) notFound();

  return (
    <TransactionForm
      transaction={{
        ...transaction,
        amount: Number(transaction.amount),
        contributors: transaction.contributors.map((c) => ({
          friendId: c.friendId,
          amount: Number(c.amount),
          friend: c.friend,
        })),
      }}
      friends={friends}
      groups={groups}
    />
  );
}
