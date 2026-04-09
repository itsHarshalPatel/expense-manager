import { getGroupById } from "@/actions/group.actions";
import { notFound } from "next/navigation";
import { formatDate, formatAmount } from "@/lib/utils";
import { getGroupCategoryColor } from "@/constants/data";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { getCategoryMeta } from "@/constants/data";
import DeleteGroupButton from "@/components/shared/DeleteGroupButton";
import Image from "next/image";

export default async function GroupDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const group = await getGroupById(params.id);
  if (!group) notFound();

  const color = getGroupCategoryColor(group.category);
  const total = group.transactions.reduce(
    (sum, t) => sum + Number(t.amount),
    0,
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/group" className="common-btn">
          <FaArrowLeft size={14} />
          <span>Back</span>
        </Link>
        <DeleteGroupButton id={group.id} />
      </div>

      {/* Group info */}
      <div className="basic-section-layout">
        <div
          className="w-full h-2 rounded-full mb-4"
          style={{ backgroundColor: color }}
        />
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <span
            className="text-xs font-medium px-2 py-1 rounded-full text-white"
            style={{ backgroundColor: color }}
          >
            {group.category}
          </span>
        </div>
        {group.description && (
          <p className="text-gray-500 text-sm mb-3">{group.description}</p>
        )}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-brand-border">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Total Spent</span>
            <span className="text-xl font-bold">{formatAmount(total)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400">Transactions</span>
            <span className="text-xl font-bold">
              {group.transactions.length}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400">Created</span>
            <span className="text-sm font-medium">
              {formatDate(group.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="basic-section-layout">
        <h2 className="text-base font-bold mb-3">Transactions</h2>
        {group.transactions.length === 0 ? (
          <p className="text-sm text-gray-400">
            No transactions in this group yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {group.transactions.map((t) => {
              const meta = getCategoryMeta(t.category);
              const isCredit = t.paymentMethod === "Credit";
              return (
                <Link
                  key={t.id}
                  href={`/transaction/${t.id}`}
                  className="flex items-center justify-between px-3 py-2 bg-brand-light rounded-app hover:bg-brand-border transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={meta.image}
                      alt={meta.value}
                      className="w-8 h-8 object-contain"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{t.title}</span>
                      <span className="text-xs text-gray-400">
                        {formatDate(t.paymentDate)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${isCredit ? "text-green-600" : "text-red-500"}`}
                  >
                    {isCredit ? "+" : "-"}
                    {formatAmount(Number(t.amount))}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
