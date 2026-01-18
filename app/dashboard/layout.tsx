"use client";

import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        {children}
      </main>
    </div>
  );
}
