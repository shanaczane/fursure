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

const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const PetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const EditIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const CancelIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const InboxIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const ManageBookingsPage: React.FC = () => {
  const {
    bookings,
    services,
    acceptBooking,
    rejectBooking,
    rescheduleBooking,
    completeBooking,
    updateBooking,
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

  const handleApproveEdit = (bookingId: string) => {
    updateBooking(bookingId, { editRequestStatus: "approved" });
  };
  const handleRejectEdit = (bookingId: string) => {
    updateBooking(bookingId, { editRequestStatus: "rejected" });
  };
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
      <div className="space-y-5" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {/* Header */}
        <div>
          <h1
            className="text-2xl md:text-3xl font-900 mb-1"
            style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}
          >
            Manage Bookings
          </h1>
          <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>Accept, reject, or reschedule appointment requests</p>
        </div>

        {/* Pending edit/cancel requests banner */}
        {pendingRequests > 0 && (
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 border"
            style={{ background: "#FFFBEB", borderColor: "#FCD34D" }}>
            <span style={{ color: "#D97706" }}><BellIcon /></span>
            <p className="text-sm font-700" style={{ color: "#92400E" }}>
              {pendingRequests} booking{pendingRequests > 1 ? "s have" : " has"} a pending edit or cancellation request from the owner.
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
        <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)" }}>
          <div className="flex overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilters({ ...filters, status: tab.value })}
                className="flex items-center gap-2 px-4 py-3 text-sm font-700 whitespace-nowrap border-b-2 transition-colors"
                style={filters.status === tab.value
                  ? { borderColor: "var(--fur-teal)", color: "var(--fur-teal)", background: "var(--fur-teal-light)" }
                  : { borderColor: "transparent", color: "var(--fur-slate-light)" }}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-700"
                    style={tab.value === "pending"
                      ? { background: "#FEF3C7", color: "#92400E" }
                      : tab.value === "awaiting_downpayment"
                      ? { background: "#FFEDD5", color: "#9A3412" }
                        : tab.value === "rescheduled"
                        ? "bg-purple-100 text-purple-700"
                      : filters.status === tab.value
                      ? { background: "rgba(0,0,0,0.08)", color: "var(--fur-teal-dark)" }
                      : { background: "var(--fur-mist)", color: "var(--fur-slate-mid)" }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Row */}
        <div className="rounded-2xl border p-4" style={{ background: "white", borderColor: "var(--border)" }}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                placeholder="Search by owner, pet, or service..."
                className="fur-input"
                style={{ paddingLeft: "2.5rem" }}
              />
              <svg className="w-4 h-4 absolute left-3 top-3.5" style={{ color: "var(--fur-slate-light)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="fur-input"
            >
              <option value="all">All dates</option>
              <option value="today">Today</option>
              <option value="week">Next 7 days</option>
              <option value="month">Next 30 days</option>
            </select>
            <select
              value={filters.serviceId}
              onChange={(e) => setFilters({ ...filters, serviceId: e.target.value })}
              className="fur-input"
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
          <div className="rounded-2xl border p-12 text-center" style={{ background: "white", borderColor: "var(--border)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--fur-mist)", color: "var(--fur-slate-light)" }}>
              <InboxIcon />
            </div>
            <p className="font-700 text-lg mb-1" style={{ color: "var(--fur-slate)" }}>No bookings found</p>
            <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>Try adjusting your filters</p>
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
                <div key={booking.id} className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)" }}>
                  {/* Main Row */}
                  <div
                    className="flex items-center p-4 cursor-pointer transition-colors"
                    style={{ ["--hover-bg" as string]: "var(--fur-cream)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-cream)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "white")}
                    onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mr-4"
                      style={{ background: "var(--fur-teal-light)", color: "var(--fur-teal)" }}>
                      <PetIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2">
                        <p className="font-700 text-sm" style={{ color: "var(--fur-slate)" }}>{booking.serviceName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        {hasPendingEdit && (
                          <span className="text-xs px-2 py-0.5 rounded-full border font-700 flex items-center gap-1"
                            style={{ background: "#FEF3C7", color: "#92400E", borderColor: "#FCD34D" }}>
                            <EditIcon /> Edit Request
                          </span>
                        )}
                        {hasPendingCancel && (
                          <span className="text-xs px-2 py-0.5 rounded-full border font-700 flex items-center gap-1"
                            style={{ background: "var(--fur-rose-light)", color: "var(--fur-rose)", borderColor: "#FCA5A5" }}>
                            <CancelIcon /> Cancel Request
                          </span>
                        )}
                        {/* Badge: awaiting owner's reschedule response */}
                        {hasRescheduleProposal && !ownerRespondedToReschedule && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 font-medium">
                            ⏳ Awaiting Owner
                          </span>
                        )}
                        {/* Badge: awaiting owner's reschedule response */}
                        {hasRescheduleProposal && !ownerRespondedToReschedule && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 font-medium">
                            ⏳ Awaiting Owner
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "var(--fur-slate-light)" }}>
                        {booking.petName} ({booking.petBreed}) · {booking.ownerName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        📅 {formatBookingDateTime(effectiveDate, effectiveTime)}
                        {booking.rescheduleDate && !ownerRespondedToReschedule && (
                          <span className="ml-1 text-purple-600 font-medium">(proposal pending)</span>
                      <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--fur-slate-light)" }}>
                        <CalendarIcon /> {formatBookingDateTime(effectiveDate, effectiveTime)}
                        {booking.rescheduleDate && (
                          <span className="ml-1" style={{ color: "#7C3AED" }}>(rescheduled)</span>
                        )}
                      </p>
                      {booking.status === "awaiting_downpayment" && (
                        <p className={`text-xs mt-1 font-700 flex items-center gap-1`}
                          style={{ color: dpExpired ? "var(--fur-rose)" : "#D97706" }}>
                          <ClockIcon />
                          {dpExpired
                            ? "Payment deadline passed — will auto-decline"
                            : `Payment due within ${Math.ceil(dpHoursLeft ?? 0)} hrs`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 ml-3 shrink-0">
                      <p className="font-700 text-sm hidden sm:block" style={{ color: "var(--fur-slate)" }}>
                        {formatCurrency(booking.price)}
                      </p>
                      <svg
                        className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        style={{ color: "var(--fur-slate-light)" }}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="border-t px-4 py-4 space-y-4" style={{ borderColor: "var(--border)", background: "var(--fur-cream)" }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-700 uppercase tracking-wide mb-1" style={{ color: "var(--fur-slate-mid)" }}>Owner Details</p>
                          <p className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>{booking.ownerName}</p>
                          <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>{booking.ownerEmail}</p>
                          {booking.ownerPhone && (
                            <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>{booking.ownerPhone}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-700 uppercase tracking-wide mb-1" style={{ color: "var(--fur-slate-mid)" }}>Pet Details</p>
                          <p className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>{booking.petName}</p>
                          <p className="text-sm capitalize" style={{ color: "var(--fur-slate-light)" }}>{booking.petType} · {booking.petBreed}</p>
                        </div>

                        {booking.requiresDownPayment && (
                          <div className="sm:col-span-2">
                            <p className="text-xs font-700 uppercase tracking-wide mb-1" style={{ color: "var(--fur-slate-mid)" }}>Down Payment</p>
                            {booking.downPaymentPaid ? (
                              <div className="flex items-center gap-2 rounded-xl px-3 py-2 border"
                                style={{ background: "#D1FAE5", borderColor: "#6EE7B7" }}>
                                <span style={{ color: "#059669" }}><CheckIcon /></span>
                                <span className="text-sm font-700" style={{ color: "#065F46" }}>Paid</span>
                                {booking.downPaymentPaidAt && (
                                  <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                                    — {new Date(booking.downPaymentPaidAt).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            ) : dpExpired ? (
                              <div className="rounded-xl px-3 py-2 border" style={{ background: "var(--fur-rose-light)", borderColor: "#FCA5A5" }}>
                                <p className="text-sm font-700" style={{ color: "var(--fur-rose)" }}>
                                  Payment deadline passed. This booking will be automatically declined.
                                </p>
                              </div>
                            ) : (
                              <div className="rounded-xl px-3 py-2 border" style={{ background: "#FFEDD5", borderColor: "#FDBA74" }}>
                                <p className="text-sm font-700" style={{ color: "#9A3412" }}>
                                  Waiting for owner payment — {Math.ceil(dpHoursLeft ?? 0)} hrs remaining
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {booking.notes && (
                          <div className="sm:col-span-2">
                            <p className="text-xs font-700 uppercase tracking-wide mb-1" style={{ color: "var(--fur-slate-mid)" }}>Owner Notes</p>
                            <p className="text-sm rounded-xl px-3 py-2 border" style={{ color: "var(--fur-slate)", background: "var(--fur-amber-light)", borderColor: "var(--fur-amber)" }}>
                              {booking.notes}
                            </p>
                          </div>
                        )}
                        {booking.providerNotes && (
                          <div className="sm:col-span-2">
                            <p className="text-xs font-700 uppercase tracking-wide mb-1" style={{ color: "var(--fur-slate-mid)" }}>Your Notes</p>
                            <p className="text-sm rounded-xl px-3 py-2 border" style={{ color: "var(--fur-slate)", background: "var(--fur-teal-light)", borderColor: "var(--fur-teal)" }}>
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

                      {/* Pending edit request */}
                      {hasPendingEdit && (
                        <div className="rounded-xl p-3 border" style={{ background: "#FFFBEB", borderColor: "#FCD34D" }}>
                          <p className="text-sm font-700 mb-1" style={{ color: "#92400E" }}>
                            The owner is requesting to edit this booking.
                          </p>
                          <p className="text-xs text-yellow-700 mb-3">
                            Approve to let them update their booking details.
                          <p className="text-xs mb-3" style={{ color: "#B45309" }}>
                            Review the changes and approve or reject their request.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveEdit(booking.id)}
                              className="px-3 py-1.5 text-white text-xs font-700 rounded-xl transition-colors"
                              style={{ background: "#059669" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#047857")}
                              onMouseLeave={e => (e.currentTarget.style.background = "#059669")}
                            >
                              Approve Edit
                            </button>
                            <button
                              onClick={() => handleRejectEdit(booking.id)}
                              className="px-3 py-1.5 text-xs font-700 rounded-xl border transition-colors"
                              style={{ background: "var(--fur-rose-light)", color: "var(--fur-rose)", borderColor: "#FCA5A5" }}
                            >
                              Reject Edit
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Pending cancel request */}
                      {hasPendingCancel && (
                        <div className="rounded-xl p-3 border" style={{ background: "var(--fur-rose-light)", borderColor: "#FCA5A5" }}>
                          <p className="text-sm font-700 mb-1" style={{ color: "var(--fur-rose)" }}>
                            The owner is requesting to cancel this booking.
                          </p>
                          <p className="text-xs mb-3" style={{ color: "var(--fur-rose)" }}>
                            Approving will cancel the booking immediately.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveCancel(booking.id)}
                              className="px-3 py-1.5 text-white text-xs font-700 rounded-xl transition-colors"
                              style={{ background: "var(--fur-rose)" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#b91c1c")}
                              onMouseLeave={e => (e.currentTarget.style.background = "var(--fur-rose)")}
                            >
                              Approve Cancellation
                            </button>
                            <button
                              onClick={() => handleRejectCancel(booking.id)}
                              className="px-3 py-1.5 text-xs font-700 rounded-xl border transition-colors"
                              style={{ background: "white", color: "var(--fur-slate-mid)", borderColor: "var(--border)" }}
                            >
                              Reject & Keep Booking
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Primary Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {booking.status === "pending" && (
                          <>
                            <button
                              onClick={() => openModal(booking, "accept")}
                              className="px-4 py-2 text-white text-sm font-700 rounded-xl transition-colors"
                              style={{ background: "#059669" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#047857")}
                              onMouseLeave={e => (e.currentTarget.style.background = "#059669")}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => openModal(booking, "reschedule")}
                              className="px-4 py-2 text-white text-sm font-700 rounded-xl transition-colors"
                              style={{ background: "#7C3AED" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#6D28D9")}
                              onMouseLeave={e => (e.currentTarget.style.background = "#7C3AED")}
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => openModal(booking, "reject")}
                              className="px-4 py-2 text-sm font-700 rounded-xl border transition-colors"
                              style={{ background: "var(--fur-rose-light)", color: "var(--fur-rose)", borderColor: "#FCA5A5" }}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {booking.status === "awaiting_downpayment" && (
                          <button
                            onClick={() => openModal(booking, "reject")}
                            className="px-4 py-2 text-sm font-700 rounded-xl border transition-colors"
                            style={{ background: "var(--fur-rose-light)", color: "var(--fur-rose)", borderColor: "#FCA5A5" }}
                            title="Decline this booking if the owner has not paid"
                          >
                            Decline
                          </button>
                        )}

                        {booking.status === "confirmed" && (
                          <>
                            <button
                              onClick={() => openModal(booking, "complete")}
                              className="px-4 py-2 text-white text-sm font-700 rounded-xl transition-colors"
                              style={{ background: "var(--fur-teal)" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-teal-dark)")}
                              onMouseLeave={e => (e.currentTarget.style.background = "var(--fur-teal)")}
                            >
                              Mark Complete
                            </button>
                            <button
                              onClick={() => openModal(booking, "reschedule")}
                              className="px-4 py-2 text-sm font-700 rounded-xl border transition-colors"
                              style={{ background: "#EDE9FE", color: "#5B21B6", borderColor: "#C4B5FD" }}
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => openModal(booking, "reject")}
                              className="px-4 py-2 text-sm font-700 rounded-xl border transition-colors"
                              style={{ background: "var(--fur-rose-light)", color: "var(--fur-rose)", borderColor: "#FCA5A5" }}
                            >
                              Cancel
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
                              className="px-4 py-2 text-sm font-700 rounded-xl border transition-colors"
                              style={{ background: "var(--fur-rose-light)", color: "var(--fur-rose)", borderColor: "#FCA5A5" }}
                            >
                              ✗ Cancel Booking
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
                          <p className="text-sm italic" style={{ color: "var(--fur-slate-light)" }}>No actions available</p>
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
