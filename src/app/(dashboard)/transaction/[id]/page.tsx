import { getTransactionById } from "@/actions/transaction.actions";
import { notFound } from "next/navigation";
import { formatDate, formatAmount } from "@/lib/utils";
import { getCategoryMeta } from "@/constants/data";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import DeleteTransactionButton from "@/components/shared/DeleteTransactionButton";
import SettleButton from "@/components/shared/SettleButton";
import Image from "next/image";
type TransactionDetail = Awaited<ReturnType<typeof getTransactionById>>;

export default async function TransactionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const transaction = await getTransactionById(params.id);
  if (!transaction) notFound();

  const meta = getCategoryMeta(transaction.category);
  const isCredit = transaction.paymentMethod === "Credit";
  const friendPaid = !!transaction.paidByFriendId;
  const myShare =
    friendPaid && transaction.contributors[0]
      ? Number(transaction.contributors[0].amount)
      : null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/transaction" className="btn-outline">
          <FaArrowLeft size={12} />
          <span>Back</span>
        </Link>

        <Link
          href={`/transaction/${transaction.id}/edit`}
          className="btn-outline"
        >
          <MdEdit size={15} />
          <span>Edit</span>
        </Link>
      </div>

      {/* Title + Description */}
      <div className="basic-section-layout">
        <div className="flex items-center gap-3 mb-2">
          <Image
            src={meta.image}
            alt={meta.value}
            width={10}
            height={10}
            className="w-12 h-12 object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold">{transaction.title}</h1>
            <p className="text-gray-500 text-sm">{transaction.description}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="basic-section-layout flex flex-col gap-3">
        <DetailRow label="Date" value={formatDate(transaction.paymentDate)} />
        <DetailRow
          label="Category"
          value={`${meta.icon} ${transaction.category}`}
        />
        <DetailRow label="Payment Type" value={transaction.paymentType} />
        <DetailRow label="Payment Method" value={transaction.paymentMethod} />
        {friendPaid && transaction.paidByFriendId && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 w-32">Paid By</span>
            <Link
              href={`/friend/${transaction.paidByFriendId}`}
              className="tag hover:opacity-80 transition-opacity"
            >
              {(transaction as any).paidByFriend?.prefix}{" "}
              {(transaction as any).paidByFriend?.name}
            </Link>
          </div>
        )}
        {transaction.group && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 w-32">Group</span>
            <Link
              href={`/group/${transaction.group.id}`}
              className="tag hover:opacity-80 transition-opacity"
            >
              {transaction.group.name}
            </Link>
          </div>
        )}
        {transaction.remark && (
          <DetailRow label="Remark" value={transaction.remark} />
        )}
      </div>

      {/* Amount + Contributors */}
      <div className="basic-section-layout flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total Amount</span>
          <span
            className={`text-2xl font-bold ${isCredit ? "text-green-600" : "text-red-500"}`}
          >
            {isCredit ? "+" : "-"}
            {formatAmount(Number(transaction.amount))}
          </span>
        </div>

        {friendPaid && myShare !== null && (
          <div className="flex items-center justify-between px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-app">
            <div className="flex flex-col">
              <span className="text-xs text-yellow-700 font-medium">
                Friend Paid — Your Share
              </span>
              <span className="text-xs text-gray-500">
                out of {formatAmount(Number(transaction.amount))} total
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-yellow-700">
                {formatAmount(myShare)}
              </span>
              {!transaction.contributors[0]?.settled && (
                <SettleButton contributorId={transaction.contributors[0].id} />
              )}
              {transaction.contributors[0]?.settled && (
                <span className="text-xs text-gray-400 font-medium">
                  Settled
                </span>
              )}
            </div>
          </div>
        )}

        {!friendPaid && transaction.contributors.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-500">
              Contributors
            </span>
            {(transaction as NonNullable<TransactionDetail>).contributors.map(
              (c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between px-3 py-2 bg-brand-light rounded-app"
                >
                  <Link
                    href={`/friend/${c.friend.id}`}
                    className="flex items-center gap-2 hover:opacity-70 transition-opacity flex-1"
                  >
                    <span className="text-sm font-medium">
                      {c.friend.prefix} {c.friend.name}
                    </span>
                  </Link>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold ${(c as any).settled ? "text-gray-300 line-through" : "text-green-600"}`}
                    >
                      {formatAmount(Number(c.amount))}
                    </span>
                    {!(c as any).settled && (
                      <SettleButton contributorId={c.id} />
                    )}
                    {(c as any).settled && (
                      <span className="text-xs text-gray-400 font-medium">
                        Settled
                      </span>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* Delete */}
      <div className="flex justify-end mx-4 mb-6">
        <DeleteTransactionButton id={transaction.id} />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500 w-32">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
