"use client";

import { useSearchParams } from "next/navigation";
import { EmailList } from "@/components/EmailList";

export default function DashboardClient() {
  const tab = useSearchParams().get("tab");

  return (
    <EmailList
      type={tab === "sent" ? "sent" : "scheduled"}
    />
  );
}
