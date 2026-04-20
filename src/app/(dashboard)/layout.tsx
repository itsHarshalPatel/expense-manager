import Sidebar from "@/components/shared/Sidebar";
import MobileHeader from "@/components/shared/MobileHeader";
import { Metadata } from "next";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden flex">
      <aside className="hidden md:flex w-[250px] flex-shrink-0 h-screen overflow-y-auto bg-brand-light border-r-2 border-brand-border flex-col">
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto bg-brand-light p-4">
          {children}
        </main>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Vyaya Prabandhana",
  description: "Track your expenses, friends and groups",
};
