import { Sidebar } from "@/components/layout/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-chronos-surface">
      <Sidebar />
      <ScrollArea className="flex-1">
        <main className="min-h-screen p-6 lg:p-8">{children}</main>
      </ScrollArea>
    </div>
  );
}
