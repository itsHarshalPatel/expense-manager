import Sidebar from "@/components/shared/Sidebar";
import MobileHeader from "@/components/shared/MobileHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden flex">
      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden md:flex w-[250px] flex-shrink-0 h-screen overflow-y-auto bg-brand-light border-r-2 border-brand-border flex-col">
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile header — only visible on mobile */}
        <MobileHeader />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-brand-light p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
