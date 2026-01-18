"use client";

import React, { useState } from "react";
import { X, Clock } from "lucide-react";
import { format, addDays, setHours, setMinutes } from "date-fns";

interface SendLaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dateTime: Date) => void;
  currentDateTime?: string;
}

export function SendLaterModal({
  isOpen,
  onClose,
  onConfirm,
  currentDateTime,
}: SendLaterModalProps) {
  const [selectedDateTime, setSelectedDateTime] = useState(
    currentDateTime || ""
  );

  if (!isOpen) return null;

  const tomorrow = addDays(new Date(), 1);
  const quickOptions = [
    {
      label: "Tomorrow",
      value: format(tomorrow, "yyyy-MM-dd'T'HH:mm"),
    },
    {
      label: "Tomorrow, 10:00 AM",
      value: format(setHours(tomorrow, 10), "yyyy-MM-dd'T'HH:mm"),
    },
    {
      label: "Tomorrow, 11:00 AM",
      value: format(setHours(tomorrow, 11), "yyyy-MM-dd'T'HH:mm"),
    },
    {
      label: "Tomorrow, 3:00 PM",
      value: format(setHours(tomorrow, 15), "yyyy-MM-dd'T'HH:mm"),
    },
  ];

  const handleQuickSelect = (value: string) => {
    setSelectedDateTime(value);
  };

  const handleConfirm = () => {
    if (selectedDateTime) {
      const selectedDate = new Date(selectedDateTime);
      const now = new Date();
      if (selectedDate <= now) {
        alert("Please select a future date and time");
        return;
      }
      onConfirm(selectedDate);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold">Send Later</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Date & Time Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pick date & time
            </label>
            <input
              type="datetime-local"
              value={selectedDateTime}
              onChange={(e) => {
                const value = e.target.value;
                const selectedDate = new Date(value);
                const now = new Date();
                if (selectedDate <= now) {
                  alert("Please select a future date and time");
                  return;
                }
                setSelectedDateTime(value);
              }}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
            />
          </div>

          {/* Quick Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick options
            </label>
            <div className="space-y-2">
              {quickOptions.map((option) => {
                const optionDate = new Date(option.value);
                const now = new Date();
                const isPast = optionDate <= now;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      if (!isPast) {
                        handleQuickSelect(option.value);
                      }
                    }}
                    disabled={isPast}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                      selectedDateTime === option.value
                        ? "bg-green-50 border-green-500 text-green-700"
                        : isPast
                        ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedDateTime}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
