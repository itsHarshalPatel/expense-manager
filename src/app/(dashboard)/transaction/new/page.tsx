import TransactionForm from "@/components/shared/TransactionForm";
import { getFriendsAndGroups } from "@/actions/transaction.actions";

export default async function NewTransactionPage() {
  const { friends, groups } = await getFriendsAndGroups();
  return <TransactionForm friends={friends} groups={groups} />;
}
