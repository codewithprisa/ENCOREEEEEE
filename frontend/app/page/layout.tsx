import type { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#FFFFFF]">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}