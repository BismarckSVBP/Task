
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, Filter, RotateCcw, ChevronDown, Paperclip, Image } from "lucide-react";
import api from "@/lib/api";

export interface Email {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  status: "scheduled" | "sent" | "failed";
  scheduledAt?: string;
  sentAt?: string;
  attachments?: string; // JSON string of attachment metadata
}

// Helper function to strip HTML tags
const stripHtml = (html: string): string => {
  if (typeof window === "undefined") {
    // Server-side: simple regex fallback
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  }
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
};

export function EmailList({
  type = "scheduled",
}: {
  type?: "scheduled" | "sent";
}) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/email/${type}`);
      setEmails(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [type]);

  /** 🔍 Search filter (client-side, fast & safe) */
  const filteredEmails = useMemo(() => {
    if (!search.trim()) return emails;

    const q = search.toLowerCase();
    return emails.filter(
      (e) =>
        e.recipient.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q) ||
        e.body.toLowerCase().includes(q)
    );
  }, [emails, search]);

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="px-6 py-4 flex items-center gap-4 bg-white border-b border-gray-100">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by email, subject or message"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100/50 border-none rounded-lg text-sm focus:ring-1 focus:ring-gray-200 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-gray-400">
         

          {/* Refresh */}
          <button
            title="Refresh"
            onClick={fetchEmails}
            className="p-2 hover:bg-gray-50 rounded-full"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Column Labels */}
      <div className="px-6 py-2 border-b border-gray-100 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500 flex gap-4">
        <div className="w-48">To</div>
        <div className="w-64">Subject</div>
        <div className="flex-1">Message</div>
        <div className="w-44 text-right">Time</div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto bg-white">
        {filteredEmails.map((email) => {
          const isOpen = openId === email.id;
          const date =
            type === "sent" ? email.sentAt : email.scheduledAt;

          const timeTag = date
            ? new Date(date).toLocaleString()
            : "";

          return (
            <div key={email.id} className="border-b border-gray-50">
              {/* Row */}
              <div
                onClick={() =>
                  setOpenId(isOpen ? null : email.id)
                }
                className="group flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer"
              >
                <div className="w-48 text-sm font-semibold text-gray-900 truncate">
                  {email.recipient}
                </div>

                <div className="w-64 text-sm font-medium text-gray-800 truncate">
                  {email.subject}
                </div>

                <div className="flex-1 text-sm text-gray-500 truncate">
                  {(() => {
                    const textContent = stripHtml(email.body);
                    return textContent.length > 100 ? textContent.substring(0, 100) + "..." : textContent;
                  })()}
                </div>

                <div className="w-44 flex items-center justify-end gap-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      email.status === "sent"
                        ? "bg-green-100 text-green-700"
                        : email.status === "failed"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {timeTag}
                  </span>

                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Expanded */}
              {isOpen && (
                <div className="px-6 py-4 bg-gray-50 text-sm space-y-3">
                  <div>
                    <span className="font-semibold text-gray-700">To:</span>
                    <p className="text-gray-800 mt-1">{email.recipient}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Subject:</span>
                    <p className="text-gray-800 mt-1">{email.subject}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Message:</span>
                    <div 
                      className="text-gray-700 mt-1 prose prose-sm max-w-none border rounded-lg p-4 bg-white"
                      dangerouslySetInnerHTML={{ __html: email.body }}
                    />
                  </div>

                  {/* Attachments */}
                  {email.attachments && email.attachments !== "[]" && (
                    <div>
                      <span className="font-semibold text-gray-700 flex items-center gap-2">
                        <Paperclip size={14} />
                        Attachments:
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(() => {
                          try {
                            const atts = JSON.parse(email.attachments || "[]");
                            return atts.map((att: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2"
                              >
                                {att.type?.startsWith("image/") ? (
                                  <Image size={14} className="text-blue-500" />
                                ) : (
                                  <Paperclip size={14} className="text-gray-500" />
                                )}
                                <span className="text-xs text-gray-700">{att.name}</span>
                                <span className="text-xs text-gray-500">
                                  ({(att.size / 1024).toFixed(1)} KB)
                                </span>
                              </div>
                            ));
                          } catch {
                            return null;
                          }
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {!loading && filteredEmails.length === 0 && (
          <div className="p-6 text-center text-xs text-gray-400 uppercase">
            No emails found
          </div>
        )}
      </div>
    </div>
  );
}
