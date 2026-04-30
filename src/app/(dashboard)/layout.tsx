import Sidebar from "@/components/shared/Sidebar";
import MobileHeader from "@/components/shared/MobileHeader";
import { Metadata } from "next";
import { auth } from "@/auth";
import { DEMO_USER_ID } from "@/lib/demo";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isDemo = session?.user?.id === DEMO_USER_ID;

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {isDemo && (
        <div className="w-full bg-yellow-400 text-yellow-900 text-xs font-medium text-center py-1.5 flex-shrink-0">
          👀 Demo Mode — Read Only · All changes are disabled
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:flex w-[250px] flex-shrink-0 h-full overflow-y-auto bg-brand-light border-r-2 border-brand-border flex-col">
          <Sidebar />
        </aside>
        <div className="flex-1 flex flex-col overflow-hidden">
          <MobileHeader />
          <main className="flex-1 overflow-y-auto bg-brand-light p-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Vyaya Prabandhana",
  description: "Track your expenses, friends and groups",
};
