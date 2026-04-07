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
      transaction={transaction}
      friends={friends}
      groups={groups}
    />
  );
}
