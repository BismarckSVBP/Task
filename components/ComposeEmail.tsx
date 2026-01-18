"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, ChevronDown, Upload, Paperclip, Clock } from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "./RichTextEditor";
import { SendLaterModal } from "./SendLaterModal";
import { useToast, showToast, ToastContainer } from "./Toast";

interface User {
  email: string;
  id?: string;
}

export function ComposeEmail() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const { toasts, removeToast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [recipient, setRecipient] = useState("");
  const [toEmails, setToEmails] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [delay, setDelay] = useState("2000");
  const [hourlyLimit, setHourlyLimit] = useState("100");
  const [startTime, setStartTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSendLaterModal, setShowSendLaterModal] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [senders, setSenders] = useState<string[]>([]);
  const [selectedSender, setSelectedSender] = useState<string>("");
  const [showSenderDropdown, setShowSenderDropdown] = useState(false);

  /** Load user safely (NO hydration bug) */
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const userData = JSON.parse(stored);
      setUser(userData);
      setSenders([userData.email]);
      setSelectedSender(userData.email);
    }
  }, []);

  // Store object URLs for cleanup
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      attachmentUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [attachmentUrls]);

  const handleAddEmail = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && recipient.trim()) {
      const email = recipient.trim();
      if (validateEmail(email) && !toEmails.includes(email)) {
        setToEmails((prev) => [...prev, email]);
        setRecipient("");
      } else if (!validateEmail(email)) {
        showToast("Invalid email address", "error");
      } else {
        showToast("Email already added", "info");
      }
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const removeEmail = (index: number) => {
    setToEmails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const emails = parseCSV(text);
      const validEmails = emails.filter((email) => validateEmail(email));
      const newEmails = validEmails.filter(
        (email) => !toEmails.includes(email),
      );

      if (newEmails.length > 0) {
        setToEmails((prev) => [...prev, ...newEmails]);
        showToast(`Added ${newEmails.length} email(s) from CSV`, "success");
      } else {
        showToast("No new valid emails found in CSV", "info");
      }
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string): string[] => {
    const lines = text.split(/\r?\n/);
    const emails: string[] = [];

    for (const line of lines) {
      // Handle CSV format (comma-separated or just email per line)
      const parts = line.split(",").map((p) => p.trim());
      for (const part of parts) {
        if (part && validateEmail(part)) {
          emails.push(part);
        }
      }
    }

    return emails;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachments((prev) => [...prev, ...files]);
      // Create object URLs for preview
      const urls = files.map((file) => URL.createObjectURL(file));
      setAttachmentUrls((prev) => [...prev, ...urls]);
      showToast(`Added ${files.length} attachment(s)`, "success");
    }
  };

  const removeAttachment = (index: number) => {
    // Revoke the object URL before removing
    if (attachmentUrls[index]) {
      URL.revokeObjectURL(attachmentUrls[index]);
    }
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setAttachmentUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendLater = (dateTime: Date) => {
    const now = new Date();
    if (dateTime <= now) {
      showToast("Please select a future date and time", "error");
      return;
    }
    setStartTime(formatDateTimeLocal(dateTime));
    setShowSendLaterModal(false);
  };

  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getMinDateTime = (): string => {
    return formatDateTimeLocal(new Date());
  };

  const validateDateTime = (dateTime: string): boolean => {
    if (!dateTime) return false;
    const selected = new Date(dateTime);
    const now = new Date();
    return selected > now;
  };

  const sendLater = async () => {
    if (!toEmails.length) {
      showToast("Add at least one recipient", "error");
      return;
    }
    if (!startTime) {
      showToast("Select start time", "error");
      return;
    }
    if (!validateDateTime(startTime)) {
      showToast("Please select a future date and time", "error");
      return;
    }
    if (!subject.trim()) {
      showToast("Subject is required", "error");
      return;
    }
    if (!body.trim()) {
      showToast("Email body is required", "error");
      return;
    }

    // Prepare attachment metadata
    const attachmentMetadata = attachments.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setLoading(true);
    try {
      await api.post("/api/email/schedule", {
        recipients: toEmails,
        subject,
        body,
        startTime: new Date(startTime).toISOString(),
        delayBetweenEmails: Number(delay),
        hourlyLimit: Number(hourlyLimit),
        fromEmail: selectedSender,
        attachments: JSON.stringify(attachmentMetadata),
      });

      showToast(
        `Scheduled ${toEmails.length} email(s) successfully`,
        "success",
      );
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error: any) {
      showToast(
        error.response?.data?.error || "Failed to schedule email",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-8 text-gray-500">Loading…</div>;
  }

  return (
    <>
      <div className="flex flex-col h-full bg-gray-50/50">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            ←
          </button>
          <h2 className="text-xl font-semibold flex-1 text-center">
            Compose New Email
          </h2>
          <div className="flex items-center gap-3">
            {attachments.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Paperclip size={16} />
                <span>{attachments.length}</span>
              </div>
            )}
            <button
              onClick={() => setShowSendLaterModal(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Schedule send"
            >
              <Clock size={20} />
            </button>
            <button
              onClick={sendLater}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Scheduling..." : "Send Later"}
            </button>
          </div>
        </div>

        <div className="p-8 flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto bg-white rounded-xl border p-8 space-y-6">
            {/* FROM */}
            <div className="flex gap-4 items-center">
              <label className="w-12 text-sm text-gray-500">From</label>
              <div className="relative">
                <button
                  onClick={() => setShowSenderDropdown(!showSenderDropdown)}
                  className="bg-gray-100 px-3 py-1.5 rounded-md text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors"
                >
                  {selectedSender || user.email}
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      showSenderDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {showSenderDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[200px]">
                    {senders.map((sender) => (
                      <button
                        key={sender}
                        onClick={() => {
                          setSelectedSender(sender);
                          setShowSenderDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                          selectedSender === sender ? "bg-green-50" : ""
                        }`}
                      >
                        {sender}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* TO */}
            <div className="flex gap-4 border-b pb-2">
              <label className="w-12 text-sm text-gray-500">To</label>
              <div className="flex-1 flex flex-wrap gap-2">
                {toEmails.map((email, i) => (
                  <span
                    key={i}
                    className="bg-green-100 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                  >
                    {email}
                    <button
                      onClick={() => removeEmail(i)}
                      className="hover:text-red-600"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  onKeyDown={handleAddEmail}
                  className="flex-1 outline-none min-w-[200px]"
                  placeholder="recipient@example.com"
                />
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleCSVUpload}
                  className="hidden"
                />
                <button
                  onClick={() => csvInputRef.current?.click()}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Upload size={14} />
                  Upload List
                </button>
              </div>
            </div>

            {/* SUBJECT */}
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full outline-none border-b py-2"
            />

            {/* DELAY + HOURLY LIMIT + TIME */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500 whitespace-nowrap">
                  Delay between 2 emails:
                </label>
                <input
                  type="number"
                  value={delay}
                  onChange={(e) => setDelay(e.target.value)}
                  className="w-20 border text-center px-2 py-1 rounded"
                  placeholder="00"
                  min="0"
                />
                <span className="text-xs text-gray-500">ms</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500 whitespace-nowrap">
                  Hourly Limit:
                </label>
                <input
                  type="number"
                  value={hourlyLimit}
                  onChange={(e) => setHourlyLimit(e.target.value)}
                  className="w-20 border text-center px-2 py-1 rounded"
                  placeholder="00"
                  min="1"
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <label className="text-sm text-gray-500">Start time:</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (validateDateTime(value)) {
                      setStartTime(value);
                    } else {
                      showToast(
                        "Please select a future date and time",
                        "error",
                      );
                    }
                  }}
                  className="border px-3 py-1 rounded"
                  min={getMinDateTime()}
                />
              </div>
            </div>

            {/* ATTACHMENTS PREVIEW */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm text-gray-500">Attachments:</label>
                <div className="flex flex-wrap gap-3">
                  {attachments.map((file, i) => {
                    const isImage = file.type.startsWith("image/");
                    const fileSize = (file.size / 1024).toFixed(1);
                    const fileUrl = attachmentUrls[i];

                    return (
                      <div
                        key={i}
                        className="border rounded-lg p-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        {isImage ? (
                          <div className="space-y-2">
                            <img
                              src={fileUrl}
                              alt={file.name}
                              className="w-32 h-32 object-cover rounded border"
                            />
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-gray-600 truncate max-w-[100px]">
                                {file.name}
                              </span>
                              <button
                                onClick={() => removeAttachment(i)}
                                className="hover:text-red-600"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <span className="text-xs text-gray-500">
                              {fileSize} KB
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Paperclip size={16} className="text-gray-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-700 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {fileSize} KB
                              </p>
                            </div>
                            <button
                              onClick={() => removeAttachment(i)}
                              className="hover:text-red-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* BODY */}
            <div>
              <RichTextEditor
                value={body}
                onChange={setBody}
                placeholder="Type Your Reply..."
              />
            </div>

            {/* ATTACH FILE BUTTON */}
            <div className="flex justify-end">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Paperclip size={16} />
                Attach file
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Send Later Modal */}
      <SendLaterModal
        isOpen={showSendLaterModal}
        onClose={() => setShowSendLaterModal(false)}
        onConfirm={handleSendLater}
        currentDateTime={startTime}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
