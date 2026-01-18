"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Mail, Send, User, PenSquare, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/api";

interface UserType {
  name?: string;
  email?: string;
  avatar?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab");

  const [scheduledCount, setScheduledCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [user, setUser] = useState<UserType | null>(null);

  const isScheduledActive = pathname === "/dashboard" && tab !== "sent";
  const isSentActive = pathname === "/dashboard" && tab === "sent";

  /** 🔹 Load user safely */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);


  useEffect(() => {
    let mounted = true;

    const fetchCounts = async () => {
      try {
        const [scheduledRes, sentRes] = await Promise.all([
          api.get("/api/email/scheduled"),
          api.get("/api/email/sent"),
        ]);

        if (!mounted) return;
        setScheduledCount(scheduledRes.data.length);
        setSentCount(sentRes.data.length);
      } catch {}
    };

    fetchCounts();
    return () => {
      mounted = false;
    };
  }, []);

  
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
      {/* Profile */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="User"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={18} className="text-gray-500" />
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || ""}
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            title="Logout"
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Compose */}
      <div className="p-4">
        <Link
          href="/dashboard/compose"
          className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg shadow-sm transition-all"
        >
          <PenSquare size={18} />
          Compose
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-2">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isScheduledActive
              ? "bg-gray-100 text-gray-900"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          <Mail size={18} />
          Scheduled
          <span className="ml-auto bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
            {scheduledCount}
          </span>
        </Link>

        <Link
          href="/dashboard?tab=sent"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isSentActive
              ? "bg-gray-100 text-gray-900"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          <Send size={18} />
          Sent
          <span className="ml-auto bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
            {sentCount}
          </span>
        </Link>
      </nav>
    </aside>
  );
}
