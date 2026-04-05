import { getFriends } from "@/actions/friend.actions";
import Link from "next/link";
import { FaUserFriends, FaStar } from "react-icons/fa";
import { formatAmount } from "@/lib/utils";
import AddFriendModal from "@/components/shared/AddFriendModal";

export default async function FriendPage() {
  const friends = await getFriends();

  return (
    <div className="friend-page">
      {/* Hero banner */}
      <div
        className="big-box-container"
        style={{ backgroundImage: "url('/images/BgFriend.webp')" }}
      >
        <AddFriendModal />
      </div>

      {/* List */}
      <div className="mt-4">
        {friends.length === 0 ? (
          <EmptyState />
        ) : (
          friends.map((friend) => (
            <Link
              key={friend.id}
              href={`/friend/${friend.id}`}
              className="list-card"
            >
              {/* Left — avatar + name */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-black text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {friend.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold">
                      {friend.prefix} {friend.name}
                    </h3>
                    {friend.isFavourite && (
                      <FaStar size={12} className="text-yellow-400" />
                    )}
                  </div>
                  {friend.group && <span className="tag">{friend.group}</span>}
                </div>
              </div>

              {/* Right — location */}
              {friend.location && (
                <span className="text-sm text-gray-400 hidden md:block">
                  {friend.location}
                </span>
              )}
            </Link>
          ))
        )}
      </div>
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
