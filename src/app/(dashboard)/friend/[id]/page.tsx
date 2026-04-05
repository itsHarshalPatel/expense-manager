import { getFriendById } from "@/actions/friend.actions";
import { notFound } from "next/navigation";
import { formatDate, formatAmount } from "@/lib/utils";
import Link from "next/link";
import { FaArrowLeft, FaPhone, FaLocationDot, FaStar } from "react-icons/fa6";
import DeleteFriendButton from "@/components/shared/DeleteFriendButton";
import FavouriteButton from "@/components/shared/FavouriteButton";

export default async function FriendDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const friend = await getFriendById(params.id);
  if (!friend) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/friend" className="common-btn">
          <FaArrowLeft size={14} />
          <span>Back</span>
        </Link>
        <FavouriteButton id={friend.id} isFavourite={friend.isFavourite} />
      </div>

      {/* Profile */}
      <div className="basic-section-layout flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-brand-black text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
          {friend.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">
            {friend.prefix} {friend.name}
          </h1>
          {friend.group && <span className="tag w-fit">{friend.group}</span>}
          {friend.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <FaPhone size={12} />
              <span>{friend.phone}</span>
            </div>
          )}
          {friend.location && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaLocationDot size={12} />
              <span>{friend.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Transactions with this friend */}
      <div className="basic-section-layout">
        <h2 className="text-base font-bold mb-3">
          Transactions ({friend.contributions.length})
        </h2>

        {friend.contributions.length === 0 ? (
          <p className="text-sm text-gray-400">
            No transactions with this friend yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {friend.contributions.map((c) => (
              <Link
                key={c.id}
                href={`/transaction/${c.transaction.id}`}
                className="flex items-center justify-between px-3 py-2 bg-brand-light rounded-app hover:bg-brand-border transition-all"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {c.transaction.title}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(c.transaction.paymentDate)}
                    {c.transaction.group && ` · ${c.transaction.group.name}`}
                  </span>
                </div>
                <span className="text-sm font-bold">
                  {formatAmount(Number(c.amount))}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Delete */}
      <div className="flex justify-end mx-4 mb-6">
        <DeleteFriendButton id={friend.id} />
      </div>
    </div>
  );
}
