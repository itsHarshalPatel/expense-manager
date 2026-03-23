import { getTransactionById } from "@/actions/transaction.actions";
import { notFound } from "next/navigation";
import TransactionForm from "@/components/shared/TransactionForm";

export default async function EditTransactionPage({
  params,
}: {
  params: { id: string };
}) {
  const transaction = await getTransactionById(params.id);
  if (!transaction) notFound();

  return <TransactionForm transaction={transaction} />;
}
