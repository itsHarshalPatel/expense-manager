import {
  getRecurringTransactions,
  getDueRecurringTransactions,
} from "@/actions/recurring.actions";
import { getFriendsAndGroups } from "@/actions/transaction.actions";
import RecurringCard from "@/components/shared/RecurringCard";
import AddRecurringModal from "@/components/shared/AddRecurringModal";
import { MdRepeat } from "react-icons/md";

export default async function RecurringPage() {
  const [items, due, { groups }] = await Promise.all([
    getRecurringTransactions(),
    getDueRecurringTransactions(),
    getFriendsAndGroups(),
  ]);

  const dueIds = new Set(due.map((d) => d.id));
  const active = items.filter((i) => i.isActive);
  const paused = items.filter((i) => !i.isActive);

  return (
    <div className="max-w-2xl mx-auto px-2 py-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-bold text-brand-black"
            style={{ fontFamily: "DM Serif Display, serif" }}
          >
            Recurring
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {items.length} template{items.length !== 1 ? "s" : ""} ·{" "}
            {due.length} due today
          </p>
        </div>
        <AddRecurringModal groups={groups} />
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <MdRepeat size={48} className="text-gray-300" />
          <p className="text-lg font-semibold text-gray-400">
            No recurring transactions
          </p>
          <p className="text-sm text-gray-400 text-center">
            Set up rent, subscriptions, or any regular expense
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {active.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Active ({active.length})
              </h2>
              {active.map((item) => (
                <RecurringCard
                  key={item.id}
                  item={item}
                  groups={groups}
                  isDue={dueIds.has(item.id)}
                />
              ))}
            </section>
          )}

          {paused.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Paused ({paused.length})
              </h2>
              {paused.map((item) => (
                <RecurringCard
                  key={item.id}
                  item={item}
                  groups={groups}
                  isDue={false}
                />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
