"use client";

import React, { useState, useMemo } from "react";
import { useProviderContext } from "../context/ProviderAppContext";
import {
  generateCalendarDays,
  getBookingsForDate,
  formatTime,
  formatBookingDateTime,
} from "../utils/providerUtils";
import { BOOKING_STATUS_CONFIG } from "../types";
import ProviderLayout from "../components/ProviderLayout";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toLocalDateStr = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const SchedulePage: React.FC = () => {
  const { bookings } = useProviderContext();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string>(toLocalDateStr(today));

  const calendarDays = useMemo(
    () => generateCalendarDays(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );

  const selectedBookings = useMemo(
    () => getBookingsForDate(bookings, selectedDate),
    [bookings, selectedDate]
  );

  // Dates that have bookings (for dot indicators)
  const datesWithBookings = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach((b) => {
      if (b.status !== "cancelled") {
        set.add(b.rescheduleDate || b.date);
      }
    });
    return set;
  }, [bookings]);

  const prevMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  const goToday = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(toLocalDateStr(today));
  };

  const formatSelectedDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const isToday = (d: Date) => toLocalDateStr(d) === toLocalDateStr(today);
  const isSelected = (d: Date) => toLocalDateStr(d) === selectedDate;

  return (
    <ProviderLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Schedule</h1>
            <p className="text-gray-500 text-sm">View your appointment calendar</p>
          </div>
          <button
            onClick={goToday}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Today
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Calendar */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Calendar Nav */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg font-bold text-gray-900">
                {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
              {DAY_NAMES.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="h-16 border-b border-r border-gray-100 bg-gray-50/50" />;
                }
                const dateStr = toLocalDateStr(day);
                const hasBookings = datesWithBookings.has(dateStr);
                const selected = isSelected(day);
                const todayDay = isToday(day);

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-16 border-b border-r border-gray-100 flex flex-col items-center justify-start pt-2 px-1 transition-colors relative ${
                      selected
                        ? "bg-blue-600"
                        : todayDay
                        ? "bg-blue-50 hover:bg-blue-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        selected
                          ? "text-white"
                          : todayDay
                          ? "text-blue-700"
                          : day.getMonth() !== viewDate.getMonth()
                          ? "text-gray-300"
                          : "text-gray-800"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {hasBookings && (
                      <div className="flex space-x-0.5 mt-1">
                        {Array.from({ length: Math.min(getBookingsForDate(bookings, dateStr).length, 3) }).map((_, i) => (
                          <span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${selected ? "bg-blue-200" : "bg-blue-500"}`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="px-6 py-3 border-t border-gray-100 flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Has bookings</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
                <span>Selected</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 bg-blue-200 rounded-full" />
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Day Detail Panel */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">{formatSelectedDate(selectedDate)}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedBookings.length === 0
                  ? "No appointments"
                  : `${selectedBookings.length} appointment${selectedBookings.length !== 1 ? "s" : ""}`}
              </p>
            </div>

            {selectedBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-gray-500 text-sm">Free day — no appointments</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 overflow-y-auto max-h-[480px]">
                {selectedBookings
                  .sort((a, b) => {
                    const tA = (a.rescheduleTime || a.time).replace(":", "");
                    const tB = (b.rescheduleTime || b.time).replace(":", "");
                    return parseInt(tA) - parseInt(tB);
                  })
                  .map((booking) => {
                    const cfg = BOOKING_STATUS_CONFIG[booking.status];
                    const time = booking.rescheduleTime || booking.time;
                    return (
                      <div key={booking.id} className="px-5 py-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-12 text-center">
                            <p className="text-sm font-bold text-blue-600">{formatTime(time)}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                                {booking.serviceName}
                              </p>
                              <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                                {cfg.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {booking.petName} · {booking.ownerName}
                            </p>
                            {booking.notes && (
                              <p className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1 mt-1.5 line-clamp-2">
                                "{booking.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming week summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-4">Next 7 Days Overview</h2>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() + i);
              const dateStr = toLocalDateStr(d);
              const dayBookings = getBookingsForDate(bookings, dateStr);
              const isT = i === 0;
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`rounded-xl p-3 text-center transition-all border-2 ${
                    selectedDate === dateStr
                      ? "border-blue-500 bg-blue-50"
                      : isT
                      ? "border-blue-200 bg-blue-50/50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <p className="text-xs text-gray-500 font-medium">
                    {DAY_NAMES[d.getDay()]}
                  </p>
                  <p className={`text-lg font-bold mt-0.5 ${isT ? "text-blue-600" : "text-gray-800"}`}>
                    {d.getDate()}
                  </p>
                  {dayBookings.length > 0 ? (
                    <p className="text-xs font-semibold text-blue-600 mt-1">
                      {dayBookings.length}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-300 mt-1">—</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
};

export default SchedulePage;