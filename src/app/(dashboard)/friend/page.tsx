import { getFriends } from "@/actions/friend.actions";
import Link from "next/link";
import { FaUserFriends, FaStar } from "react-icons/fa";
import AddFriendModal from "@/components/shared/AddFriendModal";

export default async function FriendPage() {
  const friends = await getFriends();

  return (
    <div className="max-w-3xl mx-auto px-2 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Friends
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {friends.length} {friends.length === 1 ? "friend" : "friends"}
          </p>
        </div>
        <AddFriendModal />
      </div>

      {/* List */}
      {friends.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-2">
          {friends.map((friend) => (
            <Link
              key={friend.id}
              href={`/friend/${friend.id}`}
              className="bg-brand-white border border-brand-border rounded-app px-4 py-3 flex items-center justify-between hover:bg-brand-light transition-all cursor-pointer"
            >
              {/* Left — avatar + info */}
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

              {/* Right — arrow */}
              <span className="text-gray-300 text-lg">→</span>
            </Link>
          ))}
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
