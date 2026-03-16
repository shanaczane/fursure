"use client";

import React, { useState, useEffect } from "react";
import type { ProviderBooking } from "../..provider-dashboard/../types";
import { formatBookingDateTime } from "../utils/providerUtils";

type ActionType = "accept" | "reject" | "reschedule" | "complete";

interface BookingActionModalProps {
  booking: ProviderBooking | null;
  action: ActionType | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (id: string, notes?: string) => void;
  onReject: (id: string, notes?: string) => void;
  onReschedule: (id: string, date: string, time: string, notes?: string) => void;
  onComplete: (id: string, notes?: string) => void;
}

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
];

const ACTION_CONFIG: Record<ActionType, { title: string; color: string; btnLabel: string }> = {
  accept: { title: "Accept Booking", color: "bg-green-600 hover:bg-green-700", btnLabel: "Accept Booking" },
  reject: { title: "Reject Booking", color: "bg-red-600 hover:bg-red-700", btnLabel: "Reject Booking" },
  reschedule: { title: "Reschedule Booking", color: "bg-purple-600 hover:bg-purple-700", btnLabel: "Send Reschedule" },
  complete: { title: "Mark as Completed", color: "bg-blue-600 hover:bg-blue-700", btnLabel: "Mark Complete" },
};

const BookingActionModal: React.FC<BookingActionModalProps> = ({
  booking,
  action,
  isOpen,
  onClose,
  onAccept,
  onReject,
  onReschedule,
  onComplete,
}) => {
  const [notes, setNotes] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("10:00");

  useEffect(() => {
    if (isOpen) {
      setNotes("");
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setRescheduleDate(tomorrow.toISOString().split("T")[0]);
      setRescheduleTime("10:00");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !booking || !action) return null;

  const config = ACTION_CONFIG[action];

  const handleSubmit = () => {
    if (action === "accept") onAccept(booking.id, notes || undefined);
    else if (action === "reject") onReject(booking.id, notes || undefined);
    else if (action === "reschedule") {
      if (!rescheduleDate) return alert("Please select a date");
      onReschedule(booking.id, rescheduleDate, rescheduleTime, notes || undefined);
    } else if (action === "complete") onComplete(booking.id, notes || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{config.title}</h2>

            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-5 border border-gray-200">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                  {booking.petType === "cat" ? "🐈" : "🐕"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{booking.serviceName}</p>
                  <p className="text-sm text-gray-600">
                    {booking.ownerName} · {booking.petName} ({booking.petBreed})
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatBookingDateTime(booking.date, booking.time)}
                  </p>
                  {booking.notes && (
                    <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mt-2">
                      Note: {booking.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Reschedule Fields */}
            {action === "reschedule" && (
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    New Date *
                  </label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    New Time *
                  </label>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {TIME_SLOTS.map((t) => {
                      const [h] = t.split(":");
                      const hour = parseInt(h);
                      const ampm = hour >= 12 ? "PM" : "AM";
                      const h12 = hour % 12 || 12;
                      return (
                        <option key={t} value={t}>
                          {h12}:00 {ampm}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {action === "reject"
                  ? "Reason for rejection (optional)"
                  : action === "reschedule"
                  ? "Message to pet owner (optional)"
                  : action === "complete"
                  ? "Completion notes (optional)"
                  : "Notes to pet owner (optional)"}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder={
                  action === "reject"
                    ? "e.g. Fully booked on that day, please rebook..."
                    : action === "reschedule"
                    ? "e.g. We had an emergency, would the new time work?"
                    : action === "complete"
                    ? "e.g. Great session! Rocky was well behaved."
                    : "e.g. Looking forward to seeing your pet!"
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className={`flex-1 px-4 py-2.5 ${config.color} text-white rounded-lg font-medium transition-colors`}
              >
                {config.btnLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingActionModal;