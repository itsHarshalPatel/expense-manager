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
    <div className="max-w-2xl mx-auto px-2 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/group" className="btn-outline">
          <FaArrowLeft size={12} />
          <span>Back</span>
        </Link>
        <DeleteGroupButton id={group.id} />
      </div>

      {/* Group info card */}
      <div className="bg-brand-white rounded-app border border-brand-border p-5 mb-4">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "DM Serif Display, serif" }}
          >
            {group.name}
          </h1>
          <span className="text-xs font-medium text-gray-500 bg-brand-light px-2.5 py-1 rounded-full flex-shrink-0">
            {group.category}
          </span>
        </div>

        {group.description && (
          <p className="text-sm text-gray-400 mt-1 mb-4">{group.description}</p>
        )}

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-brand-border">
          <div>
            <p className="text-xs text-gray-400">Total Spent</p>
            <p className="text-xl font-bold mt-0.5">{formatAmount(total)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Transactions</p>
            <p className="text-xl font-bold mt-0.5">
              {group.transactions.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Created</p>
            <p className="text-sm font-medium mt-0.5">
              {formatDate(group.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-brand-white rounded-app border border-brand-border p-5">
        <h2 className="text-base font-bold mb-4">Transactions</h2>
        {group.transactions.length === 0 ? (
          <p className="text-sm text-gray-400">
            No transactions in this group yet.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-brand-border">
            {group.transactions.map((t) => {
              const meta = getCategoryMeta(t.category);
              const isCredit = t.paymentMethod === "Credit";
              return (
                <Link
                  key={t.id}
                  href={`/transaction/${t.id}`}
                  className="flex items-center justify-between py-3 hover:opacity-70 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-brand-light rounded-app flex items-center justify-center flex-shrink-0">
                      <Image
                        src={meta.image}
                        alt={meta.value}
                        width={20}
                        height={20}
                        className="w-5 h-5 object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.title}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(t.paymentDate)}
                      </p>
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
