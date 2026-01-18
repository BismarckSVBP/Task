import { Suspense } from "react";
import AuthSuccessClient from "./AuthSuccessClient";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-8">Processing login…</p>}>
      <AuthSuccessClient />
    </Suspense>
  );
}
