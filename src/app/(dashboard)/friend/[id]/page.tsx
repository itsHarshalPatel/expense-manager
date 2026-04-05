import { getFriendWithBalance } from "@/actions/friend.actions";
import { notFound } from "next/navigation";
import { formatDate, formatAmount } from "@/lib/utils";
import Link from "next/link";
import { FaArrowLeft, FaPhone, FaLocationDot } from "react-icons/fa6";
import { FaStar } from "react-icons/fa";
import DeleteFriendButton from "@/components/shared/DeleteFriendButton";
import FavouriteButton from "@/components/shared/FavouriteButton";
import SettleButton from "@/components/shared/SettleButton";

export default async function FriendDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const friend = await getFriendWithBalance(params.id);
  if (!friend) notFound();

  const balance = friend.balance;
  const isPositive = balance > 0;
  const isZero = balance === 0;

  return (
    <div className="max-w-2xl mx-auto px-2 py-4">
      {/* Header */}
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/friend" className="btn-outline">
          <FaArrowLeft size={12} />
          <span>Back</span>
        </Link>
        <FavouriteButton id={friend.id} isFavourite={friend.isFavourite} />
      </div>

      {/* Profile card */}
      <div className="bg-brand-white rounded-app p-5 border border-brand-border mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-black text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
            {friend.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">
                {friend.prefix} {friend.name}
              </h1>
              {friend.isFavourite && (
                <FaStar size={14} className="text-yellow-400" />
              )}
            </div>
            {friend.group && (
              <span className="tag mt-1 inline-block">{friend.group}</span>
            )}
            <div className="flex flex-col gap-1 mt-2">
              {friend.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FaPhone size={11} />
                  <span>{friend.phone}</span>
                </div>
              )}
              {friend.location && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FaLocationDot size={11} />
                  <span>{friend.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Balance card */}
      <div
        className={`rounded-app p-5 border mb-4 ${
          isZero
            ? "bg-brand-white border-brand-border"
            : isPositive
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
        }`}
      >
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">
          Balance
        </p>
        <p
          className={`text-3xl font-bold ${
            isZero
              ? "text-gray-400"
              : isPositive
                ? "text-green-600"
                : "text-red-500"
          }`}
        >
          {isZero
            ? "All settled up"
            : isPositive
              ? `${formatAmount(balance)} to collect`
              : `${formatAmount(Math.abs(balance))} to pay`}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {isZero
            ? "No pending balances"
            : isPositive
              ? `${friend.name} owes you`
              : `You owe ${friend.name}`}
        </p>
      </div>

      {/* Transactions */}
      <div className="bg-brand-white rounded-app p-5 border border-brand-border mb-4">
        <h2 className="text-base font-bold mb-4">
          Transactions ({friend.contributions.length})
        </h2>

        {friend.contributions.length === 0 ? (
          <p className="text-sm text-gray-400">
            No transactions with {friend.name} yet.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-brand-border">
            {friend.contributions.map((c: any) => (
              <div
                key={c.id}
                className="py-3 flex items-center justify-between"
              >
                <Link
                  href={`/transaction/${c.transaction.id}`}
                  className="flex flex-col hover:opacity-70 transition-opacity flex-1"
                >
                  <span className="text-sm font-medium">
                    {c.transaction.title}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(c.transaction.paymentDate)}
                    {c.transaction.paidByFriendId === friend.id
                      ? " · Friend paid"
                      : " · You paid"}
                  </span>
                </Link>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-bold ${
                      (c as any).settled
                        ? "text-gray-300 line-through"
                        : c.transaction.paidByFriendId === friend.id
                          ? "text-red-500"
                          : "text-green-600"
                    }`}
                  >
                    {formatAmount(Number(c.amount))}
                  </span>
                  {!(c as any).settled && <SettleButton contributorId={c.id} />}
                  {(c as any).settled && (
                    <span className="text-xs text-gray-300 font-medium">
                      Settled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="bg-brand-white rounded-app p-5 border border-red-100">
        <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">
          Danger Zone
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Remove friend</p>
            <p className="text-xs text-gray-400 mt-0.5">
              This will remove {friend.name} from your friends list
            </p>
          </div>
          <DeleteFriendButton id={friend.id} />
        </div>
      </div>
    </div>
  );
}
