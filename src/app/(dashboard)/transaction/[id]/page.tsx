import { getTransactionById } from "@/actions/transaction.actions";
import { notFound } from "next/navigation";
import { formatDate, formatAmount } from "@/lib/utils";
import { getCategoryMeta } from "@/constants/data";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import DeleteTransactionButton from "@/components/shared/DeleteTransactionButton";
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

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/transaction" className="common-btn">
          <FaArrowLeft size={14} />
          <span>Back</span>
        </Link>
        <Link
          href={`/transaction/${transaction.id}/edit`}
          className="common-btn"
        >
          <MdEdit size={16} />
          <span>Edit</span>
        </Link>
      </div>

      {/* Title + Description */}
      <div className="basic-section-layout">
        <div className="flex items-center gap-3 mb-2">
          <img
            src={meta.image}
            alt={meta.value}
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

        {transaction.contributors.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-500">
              Contributors
            </span>
            {(transaction as NonNullable<TransactionDetail>).contributors.map(
              (c) => (
                <Link
                  key={c.id}
                  href={`/friend/${c.friend.id}`}
                  className="flex items-center justify-between px-3 py-2 bg-brand-light rounded-app hover:bg-brand-border transition-all"
                >
                  <span className="text-sm font-medium">
                    {c.friend.prefix} {c.friend.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">
                      {formatAmount(Number(c.amount))}
                    </span>
                    <span className="text-xs text-green-600 font-medium">
                      Paid
                    </span>
                  </div>
                </Link>
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
