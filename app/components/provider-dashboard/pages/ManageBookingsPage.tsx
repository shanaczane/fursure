"use client";

import React, { useState, useMemo } from "react";
import { useProviderContext } from "../context/ProviderAppContext";
import type { ProviderBooking } from "../types";
import { BOOKING_STATUS_CONFIG } from "../types";
import {
  filterAndSortBookings,
  formatBookingDateTime,
  formatCurrency,
} from "../utils/providerUtils";
import ProviderLayout from "../components/ProviderLayout";
import BookingActionModal from "../components/BookingActionModal";

type ActionType = "accept" | "reject" | "reschedule" | "complete";

const ManageBookingsPage: React.FC = () => {
  const { bookings, services, acceptBooking, rejectBooking, rescheduleBooking, completeBooking } =
    useProviderContext();

  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
    serviceId: "all",
    searchQuery: "",
  });
  const [selectedBooking, setSelectedBooking] = useState<ProviderBooking | null>(null);
  const [action, setAction] = useState<ActionType | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => filterAndSortBookings(bookings, filters), [bookings, filters]);

  const openModal = (booking: ProviderBooking, a: ActionType) => {
    setSelectedBooking(booking);
    setAction(a);
  };
  const closeModal = () => {
    setSelectedBooking(null);
    setAction(null);
  };

  const statusCounts = useMemo(() => ({
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    rescheduled: bookings.filter((b) => b.status === "rescheduled").length,
  }), [bookings]);

  const STATUS_TABS = [
    { value: "all", label: "All", count: statusCounts.all },
    { value: "pending", label: "Pending", count: statusCounts.pending },
    { value: "confirmed", label: "Confirmed", count: statusCounts.confirmed },
    { value: "rescheduled", label: "Rescheduled", count: statusCounts.rescheduled },
    { value: "completed", label: "Completed", count: statusCounts.completed },
    { value: "cancelled", label: "Cancelled", count: statusCounts.cancelled },
  ];

  return (
    <ProviderLayout>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Manage Bookings</h1>
          <p className="text-gray-500 text-sm">Accept, reject, or reschedule appointment requests</p>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilters({ ...filters, status: tab.value })}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  filters.status === tab.value
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      tab.value === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : filters.status === tab.value
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Row */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                placeholder="Search by owner, pet, or service..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All dates</option>
              <option value="today">Today</option>
              <option value="week">Next 7 days</option>
              <option value="month">Next 30 days</option>
            </select>
            <select
              value={filters.serviceId}
              onChange={(e) => setFilters({ ...filters, serviceId: e.target.value })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All services</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bookings List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-5xl mb-3">📭</p>
            <p className="font-semibold text-gray-700">No bookings found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((booking) => {
              const cfg = BOOKING_STATUS_CONFIG[booking.status];
              const isExpanded = expandedId === booking.id;
              const effectiveDate = booking.rescheduleDate || booking.date;
              const effectiveTime = booking.rescheduleTime || booking.time;

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Main Row */}
                  <div
                    className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                  >
                    <div className="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center text-2xl flex-shrink-0 mr-4">
                      {booking.petType === "cat" ? "🐈" : "🐕"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2">
                        <p className="font-semibold text-gray-900 text-sm">{booking.serviceName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {booking.petName} ({booking.petBreed}) · {booking.ownerName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        📅 {formatBookingDateTime(effectiveDate, effectiveTime)}
                        {booking.rescheduleDate && (
                          <span className="ml-1 text-purple-600">(rescheduled)</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3 ml-3 flex-shrink-0">
                      <p className="font-semibold text-gray-900 text-sm hidden sm:block">
                        {formatCurrency(booking.price)}
                      </p>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Owner Details</p>
                          <p className="text-sm font-medium text-gray-900">{booking.ownerName}</p>
                          <p className="text-sm text-gray-600">{booking.ownerEmail}</p>
                          {booking.ownerPhone && (
                            <p className="text-sm text-gray-600">{booking.ownerPhone}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Pet Details</p>
                          <p className="text-sm font-medium text-gray-900">{booking.petName}</p>
                          <p className="text-sm text-gray-600 capitalize">{booking.petType} · {booking.petBreed}</p>
                        </div>
                        {booking.notes && (
                          <div className="sm:col-span-2">
                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Owner Notes</p>
                            <p className="text-sm text-gray-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                              {booking.notes}
                            </p>
                          </div>
                        )}
                        {booking.providerNotes && (
                          <div className="sm:col-span-2">
                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Your Notes</p>
                            <p className="text-sm text-gray-700 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
                              {booking.providerNotes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {booking.status === "pending" && (
                          <>
                            <button
                              onClick={() => openModal(booking, "accept")}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              ✓ Accept
                            </button>
                            <button
                              onClick={() => openModal(booking, "reschedule")}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              📅 Reschedule
                            </button>
                            <button
                              onClick={() => openModal(booking, "reject")}
                              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-lg transition-colors border border-red-200"
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}
                        {(booking.status === "confirmed" || booking.status === "rescheduled") && (
                          <>
                            <button
                              onClick={() => openModal(booking, "complete")}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              ✓ Mark Complete
                            </button>
                            <button
                              onClick={() => openModal(booking, "reschedule")}
                              className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-medium rounded-lg transition-colors border border-purple-200"
                            >
                              📅 Reschedule
                            </button>
                            <button
                              onClick={() => openModal(booking, "reject")}
                              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-lg transition-colors border border-red-200"
                            >
                              ✗ Cancel
                            </button>
                          </>
                        )}
                        {(booking.status === "completed" || booking.status === "cancelled") && (
                          <p className="text-sm text-gray-400 italic">No actions available</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BookingActionModal
        booking={selectedBooking}
        action={action}
        isOpen={!!selectedBooking && !!action}
        onClose={closeModal}
        onAccept={acceptBooking}
        onReject={rejectBooking}
        onReschedule={rescheduleBooking}
        onComplete={completeBooking}
      />
    </ProviderLayout>
  );
};

export default ManageBookingsPage;