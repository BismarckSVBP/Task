"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthSuccessClient() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const user = params.get("user");

    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", user);
      router.replace("/dashboard");
    } else {
      router.replace("/");
    }
  }, [router, params]);

  return <p className="p-8">Redirecting…</p>;
}
