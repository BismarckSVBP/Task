import { Suspense } from "react";
import DashboardClient from "./DashboardClient";


export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading dashboard…</div>}>
      <DashboardClient />
    </Suspense>
  );
}
