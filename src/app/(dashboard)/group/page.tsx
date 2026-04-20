import { getGroups } from "@/actions/group.actions";
import Link from "next/link";
import { FaLayerGroup } from "react-icons/fa";
import { formatDate, trimDescription } from "@/lib/utils";
import { getGroupCategoryColor } from "@/constants/data";
import AddGroupModal from "@/components/shared/AddGroupModal";

export default async function GroupPage() {
  const groups = await getGroups();

  return (
    <div className="max-w-4xl mx-auto px-2 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-3xl font-bold text-brand-black"
            style={{ fontFamily: "DM Serif Display, serif" }}
          >
            Groups
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {groups.length} {groups.length === 1 ? "group" : "groups"}
          </p>
        </div>
        <AddGroupModal />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.length === 0 ? (
          <EmptyState />
        ) : (
          groups.map((group) => {
            const color = getGroupCategoryColor(group.category);
            const total = group.transactions.reduce(
              (sum, t) => sum + Number(t.amount),
              0,
            );
            return (
              <Link
                key={group.id}
                href={`/group/${group.id}`}
                className="bg-brand-white rounded-app border border-brand-border p-5 cursor-pointer transition-all duration-200 hover:border-brand-black hover:shadow-sm block"
              >
                {/* Top row — name + category dot */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-base font-bold leading-snug">
                    {group.name}
                  </h3>
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                    style={{ backgroundColor: color }}
                    title={group.category}
                  />
                </div>

                {/* Category tag */}
                <span className="text-xs font-medium text-gray-500 bg-brand-light px-2 py-0.5 rounded-full">
                  {group.category}
                </span>

                {group.description && (
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    {trimDescription(group.description, 60)}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-brand-border">
                  <span className="text-xs text-gray-400">
                    {group.transactions.length}{" "}
                    {group.transactions.length === 1
                      ? "transaction"
                      : "transactions"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(group.createdAt)}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-3 flex flex-col items-center justify-center py-20 gap-4">
      <FaLayerGroup size={48} className="text-gray-300" />
      <p className="text-lg font-semibold text-gray-400">No groups yet</p>
      <p className="text-sm text-gray-400">
        Create a group to track shared expenses
      </p>
    </div>
  );
}
