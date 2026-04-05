import { getGroups } from "@/actions/group.actions";
import Link from "next/link";
import { FaLayerGroup } from "react-icons/fa";
import { formatDate, trimDescription } from "@/lib/utils";
import { getGroupCategoryColor } from "@/constants/data";
import AddGroupModal from "@/components/shared/AddGroupModal";

export default async function GroupPage() {
  const groups = await getGroups();

  return (
    <div className="group-page">
      <div
        className="big-box-container"
        style={{ backgroundImage: "url('/images/BgGroup.webp')" }}
      >
        <AddGroupModal />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
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
                className="bg-brand-white rounded-app p-4 cursor-pointer transition-all duration-300 hover:bg-brand-border hover:scale-[1.01] block"
              >
                {/* Category color band */}
                <div
                  className="w-full h-2 rounded-full mb-4"
                  style={{ backgroundColor: color }}
                />
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-extrabold">{group.name}</h3>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: color }}
                  >
                    {group.category}
                  </span>
                </div>
                {group.description && (
                  <p className="text-sm text-gray-400 mb-3">
                    {trimDescription(group.description, 50)}
                  </p>
                )}
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{group.transactions.length} transactions</span>
                  <span>{formatDate(group.createdAt)}</span>
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
