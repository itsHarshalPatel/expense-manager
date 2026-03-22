import Sidebar from "@/components/shared/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[250px_1fr] h-screen overflow-hidden">
      <aside className="h-screen overflow-y-auto bg-brand-light border-r-2 border-brand-border shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
        <Sidebar />
      </aside>
      <main className="overflow-y-auto bg-brand-light p-4">{children}</main>
    </div>
  );
}
