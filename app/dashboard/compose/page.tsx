import { Suspense } from "react";
import ComposeClient from "./ComposeClient";


export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8">Loading compose…</div>}>
      <ComposeClient />
    </Suspense>
  );
}
