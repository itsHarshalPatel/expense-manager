import { getFriends, getFriendBalances } from "@/actions/friend.actions";
import Link from "next/link";
import { FaUserFriends, FaStar } from "react-icons/fa";
import { formatAmount } from "@/lib/utils";
import AddFriendModal from "@/components/shared/AddFriendModal";

export default async function FriendPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const friends = await getFriends();
  const balances = await getFriendBalances();
  const filter = searchParams.filter;

  const sorted = [...friends].sort((a, b) => {
    const ba = balances[a.id] ?? 0;
    const bb = balances[b.id] ?? 0;
    return Math.abs(bb) - Math.abs(ba);
  });

  const filtered =
    filter === "owed"
      ? sorted.filter((f) => (balances[f.id] ?? 0) > 0)
      : filter === "owe"
        ? sorted.filter((f) => (balances[f.id] ?? 0) < 0)
        : sorted;

  return (
    <div className="max-w-3xl mx-auto px-2 py-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-3xl font-bold text-brand-black"
            style={{ fontFamily: "DM Serif Display, serif" }}
          >
            Friends
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {friends.length} {friends.length === 1 ? "friend" : "friends"}
          </p>
        </div>
        <AddFriendModal />
      </div>

      {/* Filter tabs */}
      {friends.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/friend"
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              !filter
                ? "bg-brand-black text-white border-brand-black"
                : "bg-brand-white text-gray-500 border-brand-border hover:border-brand-black"
            }`}
          >
            All
          </Link>
          <Link
            href="/friend?filter=owed"
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              filter === "owed"
                ? "bg-green-600 text-white border-green-600"
                : "bg-brand-white text-gray-500 border-brand-border hover:border-green-400"
            }`}
          >
            They owe you
          </Link>
          <Link
            href="/friend?filter=owe"
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              filter === "owe"
                ? "bg-red-500 text-white border-red-500"
                : "bg-brand-white text-gray-500 border-brand-border hover:border-red-400"
            }`}
          >
            You owe
          </Link>
        </div>
      )}

      {filtered.length === 0 ? (
        filter ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <p className="text-sm text-gray-400">
              No friends in this category.
            </p>
            <Link href="/friend" className="text-xs text-gray-400 underline">
              Clear filter
            </Link>
          </div>
        ) : (
          <EmptyState />
        )
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((friend) => {
            const balance = balances[friend.id] ?? 0;
            const isPositive = balance > 0;
            const isZero = balance === 0;
            return (
              <Link
                key={friend.id}
                href={`/friend/${friend.id}`}
                className="bg-brand-white border border-brand-border rounded-app px-4 py-3 flex items-center justify-between hover:border-brand-black transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-black text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {friend.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {friend.prefix} {friend.name}
                      </span>
                      {friend.isFavourite && (
                        <FaStar size={11} className="text-yellow-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {friend.group && (
                        <span className="tag">{friend.group}</span>
                      )}
                      {friend.location && (
                        <span className="text-xs text-gray-400">
                          {friend.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {isZero ? (
                    <span className="text-xs text-gray-400">Settled</span>
                  ) : (
                    <>
                      <p
                        className={`text-sm font-bold ${isPositive ? "text-green-600" : "text-red-500"}`}
                      >
                        {formatAmount(Math.abs(balance))}
                      </p>
                      <p className="text-xs text-gray-400">
                        {isPositive ? "owes you" : "you owe"}
                      </p>
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <FaUserFriends size={48} className="text-gray-300" />
      <p className="text-lg font-semibold text-gray-400">
        No friends added yet
      </p>
      <p className="text-sm text-gray-400">
        Add friends to split expenses and track balances
      </p>
    </div>
  );
}
