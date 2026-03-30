"use client";

import React, { useState, useMemo } from "react";
import { useProviderContext } from "../context/ProviderAppContext";
import type { ProviderBooking } from "../types";
import {
  BOOKING_STATUS_CONFIG,
  isDownPaymentExpired,
  downPaymentHoursRemaining,
} from "../types";
import {
  filterAndSortBookings,
  formatBookingDateTime,
  formatCurrency,
} from "../utils/providerUtils";
import ProviderLayout from "../components/ProviderLayout";
import BookingActionModal from "../components/BookingActionModal";

type ActionType = "accept" | "reject" | "reschedule" | "complete" | "approve_edit" | "approve_cancel";

const ManageBookingsPage: React.FC = () => {
  const {
    bookings,
    services,
    acceptBooking,
    rejectBooking,
    rescheduleBooking,
    completeBooking,
    updateBooking,
  } = useProviderContext();

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

  // ── Approve / Reject edit request ─────────────────────────────────────────
  const handleApproveEdit = (bookingId: string) => {
    updateBooking(bookingId, { editRequestStatus: "approved" });
  };
  const handleRejectEdit = (bookingId: string) => {
    updateBooking(bookingId, { editRequestStatus: "rejected" });
  };

  // ── Approve / Reject cancel request ──────────────────────────────────────
  const handleApproveCancel = (bookingId: string) => {
    updateBooking(bookingId, { cancelRequestStatus: "approved", status: "cancelled" });
  };
  const handleRejectCancel = (bookingId: string) => {
    updateBooking(bookingId, { cancelRequestStatus: "rejected" });
  };

  const statusCounts = useMemo(() => ({
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    awaiting_downpayment: bookings.filter((b) => b.status === "awaiting_downpayment").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    declined: bookings.filter((b) => b.status === "declined").length,
    rescheduled: bookings.filter((b) => b.status === "rescheduled").length,
  }), [bookings]);

  const pendingRequests = useMemo(() =>
    bookings.filter(
      (b) => b.editRequestStatus === "pending" || b.cancelRequestStatus === "pending"
    ).length,
    [bookings]
  );

  // Bookings where provider proposed a reschedule but owner hasn't responded yet
  const pendingReschedules = useMemo(() =>
    bookings.filter(
      (b) => b.status === "rescheduled" && b.rescheduleStatus === "pending"
    ).length,
    [bookings]
  );

  const STATUS_TABS = [
    { value: "all", label: "All", count: statusCounts.all },
    { value: "pending", label: "Pending", count: statusCounts.pending },
    { value: "awaiting_downpayment", label: "Awaiting Payment", count: statusCounts.awaiting_downpayment },
    { value: "confirmed", label: "Confirmed", count: statusCounts.confirmed },
    { value: "rescheduled", label: "Rescheduled", count: statusCounts.rescheduled },
    { value: "completed", label: "Completed", count: statusCounts.completed },
    { value: "cancelled", label: "Cancelled", count: statusCounts.cancelled },
    { value: "declined", label: "Declined", count: statusCounts.declined },
  ];

  return (
    <ProviderLayout>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h1
            className="text-2xl md:text-3xl mb-1"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, color: "var(--fur-slate)" }}
          >
            Manage Bookings
          </h1>
          <p className="text-gray-500 text-sm">Accept, reject, or reschedule appointment requests</p>
        </div>

        {/* Pending edit/cancel requests banner */}
        {pendingRequests > 0 && (
          <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
            <span className="text-yellow-600 text-lg">🔔</span>
            <p className="text-sm font-medium text-yellow-800">
              {pendingRequests} booking{pendingRequests > 1 ? "s have" : " has"} a pending edit or
              cancellation request from the owner.
            </p>
          </div>
        )}

        {/* Pending reschedule proposals banner */}
        {pendingReschedules > 0 && (
          <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
            <span className="text-purple-600 text-lg">📅</span>
            <p className="text-sm font-medium text-purple-800">
              {pendingReschedules} reschedule proposal{pendingReschedules > 1 ? "s are" : " is"} awaiting
              the owner's response.
            </p>
          </div>
        )}

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
                        : tab.value === "awaiting_downpayment"
                        ? "bg-orange-100 text-orange-700"
                        : tab.value === "rescheduled"
                        ? "bg-purple-100 text-purple-700"
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
              <svg
                className="w-4 h-4 text-gray-400 absolute left-3 top-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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

              const dpExpired = isDownPaymentExpired(booking);
              const dpHoursLeft =
                booking.status === "awaiting_downpayment"
                  ? downPaymentHoursRemaining(booking)
                  : null;

              const hasPendingEdit = booking.editRequestStatus === "pending";
              const hasPendingCancel = booking.cancelRequestStatus === "pending";

              // Provider sent a reschedule proposal and owner hasn't responded yet
              const hasRescheduleProposal =
                booking.status === "rescheduled" &&
                !!booking.rescheduleDate &&
                !!booking.rescheduleTime;
              const ownerRespondedToReschedule =
                booking.rescheduleStatus === "confirmed" ||
                booking.rescheduleStatus === "declined";

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
                        {hasPendingEdit && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 font-medium">
                            ✏️ Edit Request
                          </span>
                        )}
                        {hasPendingCancel && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 font-medium">
                            🚫 Cancel Request
                          </span>
                        )}
                        {/* Badge: awaiting owner's reschedule response */}
                        {hasRescheduleProposal && !ownerRespondedToReschedule && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 font-medium">
                            ⏳ Awaiting Owner
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {booking.petName} ({booking.petBreed}) · {booking.ownerName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        📅 {formatBookingDateTime(effectiveDate, effectiveTime)}
                        {booking.rescheduleDate && !ownerRespondedToReschedule && (
                          <span className="ml-1 text-purple-600 font-medium">(proposal pending)</span>
                        )}
                      </p>
                      {booking.status === "awaiting_downpayment" && (
                        <p className={`text-xs mt-1 font-medium ${dpExpired ? "text-red-600" : "text-orange-600"}`}>
                          {dpExpired
                            ? "⛔ Payment deadline passed — will auto-decline"
                            : `⏳ Payment due within ${Math.ceil(dpHoursLeft ?? 0)} hrs`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 ml-3 flex-shrink-0">
                      <p className="font-semibold text-gray-900 text-sm hidden sm:block">
                        {formatCurrency(booking.price)}
                      </p>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-4">
                      {/* Info grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          <p className="text-sm text-gray-600 capitalize">
                            {booking.petType} · {booking.petBreed}
                          </p>
                        </div>

                        {/* Down payment status */}
                        {booking.requiresDownPayment && (
                          <div className="sm:col-span-2">
                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Down Payment</p>
                            {booking.downPaymentPaid ? (
                              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                <span className="text-green-600 text-sm">✅ Paid</span>
                                {booking.downPaymentPaidAt && (
                                  <span className="text-xs text-gray-500">
                                    — {new Date(booking.downPaymentPaidAt).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            ) : dpExpired ? (
                              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                <p className="text-sm text-red-700 font-medium">
                                  ⛔ Payment deadline passed. This booking will be automatically declined.
                                </p>
                              </div>
                            ) : (
                              <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                                <p className="text-sm text-orange-700 font-medium">
                                  ⏳ Waiting for owner payment —{" "}
                                  {Math.ceil(dpHoursLeft ?? 0)} hrs remaining
                                </p>
                              </div>
                            )}
                          </div>
                        )}

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

                      {/* ── Reschedule proposal status banner ────────────── */}
                      {hasRescheduleProposal && !ownerRespondedToReschedule && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <p className="text-sm font-semibold text-purple-800 mb-1">
                            📅 Reschedule proposal sent — awaiting owner response
                          </p>
                          <p className="text-sm text-purple-700">
                            <span className="font-medium">Proposed time: </span>
                            {formatBookingDateTime(booking.rescheduleDate!, booking.rescheduleTime!)}
                          </p>
                          <p className="text-xs text-purple-500 mt-1">
                            The owner will confirm or decline this proposal from their dashboard.
                          </p>
                        </div>
                      )}

                      {/* ── Pending edit request ───────────────────────────── */}
                      {hasPendingEdit && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm font-semibold text-yellow-800 mb-2">
                            ✏️ The owner is requesting to edit this booking.
                          </p>
                          <p className="text-xs text-yellow-700 mb-3">
                            Approve to let them update their booking details.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveEdit(booking.id)}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                              ✓ Approve Edit
                            </button>
                            <button
                              onClick={() => handleRejectEdit(booking.id)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-lg transition-colors"
                            >
                              ✗ Reject Edit
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ── Pending cancel request ────────────────────────── */}
                      {hasPendingCancel && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm font-semibold text-red-800 mb-2">
                            🚫 The owner is requesting to cancel this booking.
                          </p>
                          <p className="text-xs text-red-700 mb-3">
                            Approving will cancel the booking immediately.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveCancel(booking.id)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                              ✓ Approve Cancellation
                            </button>
                            <button
                              onClick={() => handleRejectCancel(booking.id)}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 text-xs font-semibold rounded-lg transition-colors"
                            >
                              ✗ Reject & Keep Booking
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ── Primary Action Buttons ────────────────────────── */}
                      <div className="flex flex-wrap gap-2 pt-1">
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

                        {booking.status === "awaiting_downpayment" && (
                          <button
                            onClick={() => openModal(booking, "reject")}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-lg transition-colors border border-red-200"
                            title="Decline this booking if the owner has not paid"
                          >
                            ✗ Decline
                          </button>
                        )}

                        {booking.status === "confirmed" && (
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

                        {/*
                         * Rescheduled: proposal is pending owner response.
                         * Provider can send a new proposal (overwrite) or cancel.
                         * They CANNOT mark it complete until the owner confirms.
                         */}
                        {booking.status === "rescheduled" && (
                          <>
                            <button
                              onClick={() => openModal(booking, "reschedule")}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              📅 Change Proposal
                            </button>
                            <button
                              onClick={() => openModal(booking, "reject")}
                              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-lg transition-colors border border-red-200"
                            >
                              ✗ Cancel Booking
                            </button>
                          </>
                        )}

                        {(booking.status === "completed" ||
                          booking.status === "cancelled" ||
                          booking.status === "declined") && (
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