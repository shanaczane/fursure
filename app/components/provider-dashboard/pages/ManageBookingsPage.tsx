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

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const PetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);
const StarFilledIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const StarEmptyIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const QuoteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
  </svg>
);

/* ─── Star Row Component ─────────────────────────────────────────────────── */
const StarRow: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }, (_, i) =>
      i < rating ? <StarFilledIcon key={i} /> : <StarEmptyIcon key={i} />
    )}
  </div>
);

/* ─── Review Card Component ──────────────────────────────────────────────── */
const ReviewCard: React.FC<{ booking: ProviderBooking }> = ({ booking }) => {
  const hasReview = typeof booking.rating === "number" && booking.rating > 0;

  if (!hasReview) {
    return (
      <div className="rounded-xl px-4 py-3 border" style={{ background: "var(--fur-mist)", borderColor: "var(--border)" }}>
        <p className="text-xs font-600 uppercase tracking-wide mb-1" style={{ color: "var(--fur-slate-mid)" }}>
          Client Review
        </p>
        <p className="text-sm italic" style={{ color: "var(--fur-slate-light)" }}>
          No review has been submitted for this booking yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#FDE68A" }}>
      {/* Review header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
        <p className="text-xs font-700 uppercase tracking-wide" style={{ color: "#92400E" }}>
          Client Review
        </p>
        <div className="flex items-center gap-2">
          <StarRow rating={booking.rating ?? 0} />
          <span className="text-sm font-800" style={{ color: "#92400E", fontFamily: "'Fraunces', serif" }}>
            {booking.rating?.toFixed(1)}
          </span>
        </div>
      </div>
      {/* Review body */}
      <div className="px-4 py-3 relative" style={{ background: "#FFFBEB" }}>
        <div className="absolute top-3 right-3">
          <QuoteIcon />
        </div>
        {booking.reviewComment ? (
          <p className="text-sm leading-relaxed pr-8" style={{ color: "var(--fur-slate)" }}>
            {booking.reviewComment}
          </p>
        ) : (
          <p className="text-sm italic" style={{ color: "var(--fur-slate-light)" }}>
            {booking.ownerName} left a rating without a written comment.
          </p>
        )}
        {booking.reviewDate && (
          <p className="text-xs mt-2" style={{ color: "#B45309" }}>
            Reviewed {new Date(booking.reviewDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        )}
      </div>
    </div>
  );
};

/* ─── Section Label ──────────────────────────────────────────────────────── */
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs font-700 uppercase tracking-wide mb-1.5" style={{ color: "var(--fur-slate-mid)" }}>
    {children}
  </p>
);

/* ─── Info Row ───────────────────────────────────────────────────────────── */
const InfoPair: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
  <div>
    <SectionLabel>{label}</SectionLabel>
    <p className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>{value}</p>
    {sub && <p className="text-sm capitalize" style={{ color: "var(--fur-slate-light)" }}>{sub}</p>}
  </div>
);

/* ─── Main Page ──────────────────────────────────────────────────────────── */
const ManageBookingsPage: React.FC = () => {
  const {
    bookings,
    services,
    acceptBooking,
    rejectBooking,
    rescheduleBooking,
    completeBooking,
    updateBooking,
    confirmPaymentReceived,
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
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const filtered = useMemo(() => filterAndSortBookings(bookings, filters), [bookings, filters]);

  const openModal = (booking: ProviderBooking, a: ActionType) => {
    setSelectedBooking(booking);
    setAction(a);
  };
  const closeModal = () => {
    setSelectedBooking(null);
    setAction(null);
  };

  const handleApproveEdit = (bookingId: string) => updateBooking(bookingId, { editRequestStatus: "approved" });
  const handleRejectEdit = (bookingId: string) => updateBooking(bookingId, { editRequestStatus: "rejected" });
  const handleApproveCancel = (bookingId: string) => updateBooking(bookingId, { cancelRequestStatus: "approved", status: "cancelled" });
  const handleRejectCancel = (bookingId: string) => updateBooking(bookingId, { cancelRequestStatus: "rejected" });

  const handleConfirmPayment = async (bookingId: string) => {
    setConfirmingPaymentId(bookingId);
    setPaymentError(null);
    try {
      await confirmPaymentReceived(bookingId);
    } catch {
      setPaymentError(bookingId);
    } finally {
      setConfirmingPaymentId(null);
    }
  };

  const statusCounts = useMemo(() => ({
    all: bookings.length,
    pending: bookings.filter(b =>
      b.status === "pending" || b.status === "awaiting_downpayment" || b.status === "payment_submitted"
    ).length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    completed: bookings.filter(b => b.status === "completed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
    declined: bookings.filter(b => b.status === "declined").length,
    rescheduled: bookings.filter(b => b.status === "rescheduled").length,
  }), [bookings]);

  const pendingRequests = useMemo(() =>
    bookings.filter(b => b.editRequestStatus === "pending" || b.cancelRequestStatus === "pending").length,
    [bookings]
  );
  const pendingReschedules = useMemo(() =>
    bookings.filter(b => b.status === "rescheduled" && b.rescheduleStatus === "pending").length,
    [bookings]
  );
  const awaitingPaymentCount = useMemo(() =>
    bookings.filter(b => b.status === "awaiting_downpayment" || b.status === "payment_submitted").length,
    [bookings]
  );

  const STATUS_TABS = [
    { value: "all",         label: "All",         count: statusCounts.all },
    { value: "pending",     label: "Pending",      count: statusCounts.pending },
    { value: "confirmed",   label: "Confirmed",    count: statusCounts.confirmed },
    { value: "rescheduled", label: "Rescheduled",  count: statusCounts.rescheduled },
    { value: "completed",   label: "Completed",    count: statusCounts.completed },
    { value: "cancelled",   label: "Cancelled",    count: statusCounts.cancelled },
    { value: "declined",    label: "Declined",     count: statusCounts.declined },
  ];

  return (
    <ProviderLayout>
      <div className="space-y-5" style={{ fontFamily: "'Nunito', sans-serif" }}>

        {/* ── Page Header ── */}
        <div className="pb-1 border-b" style={{ borderColor: "var(--border)" }}>
          <h1 className="text-2xl md:text-3xl font-900 mb-0.5"
            style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
            Manage Bookings
          </h1>
          <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>
            Accept, reject, or reschedule appointment requests
          </p>
        </div>

        {/* ── Notice Banners ── */}
        {awaitingPaymentCount > 0 && (
          <div className="flex items-start gap-3 rounded-xl px-4 py-3 border"
            style={{ background: "#FFEDD5", borderColor: "#FDBA74" }}>
            <span className="mt-0.5 text-base" style={{ color: "#D97706" }}>💵</span>
            <p className="text-sm font-600" style={{ color: "#9A3412" }}>
              <span className="font-800">{awaitingPaymentCount} booking{awaitingPaymentCount > 1 ? "s are" : " is"}</span> awaiting or processing a down payment.
              View them under <span className="font-800">Pending</span> or <span className="font-800">All</span>.
            </p>
          </div>
        )}

        {pendingRequests > 0 && (
          <div className="flex items-start gap-3 rounded-xl px-4 py-3 border"
            style={{ background: "#FFFBEB", borderColor: "#FCD34D" }}>
            <span className="mt-0.5" style={{ color: "#D97706" }}><BellIcon /></span>
            <p className="text-sm font-600" style={{ color: "#92400E" }}>
              <span className="font-800">{pendingRequests} booking{pendingRequests > 1 ? "s have" : " has"}</span> a pending edit or cancellation request from the owner.
            </p>
          </div>
        )}

        {pendingReschedules > 0 && (
          <div className="flex items-start gap-3 rounded-xl px-4 py-3 border"
            style={{ background: "#F5F3FF", borderColor: "#C4B5FD" }}>
            <span className="mt-0.5 text-base">📅</span>
            <p className="text-sm font-600" style={{ color: "#5B21B6" }}>
              <span className="font-800">{pendingReschedules} reschedule proposal{pendingReschedules > 1 ? "s are" : " is"}</span> awaiting the owner&apos;s response.
            </p>
          </div>
        )}

        {/* ── Status Tabs ── */}
        <div className="rounded-xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)" }}>
          <div className="flex overflow-x-auto">
            {STATUS_TABS.map((tab) => {
              const active = filters.status === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setFilters({ ...filters, status: tab.value })}
                  className="flex items-center gap-1.5 px-4 py-3 text-sm font-700 whitespace-nowrap border-b-2 transition-colors"
                  style={active
                    ? { borderColor: "var(--fur-teal)", color: "var(--fur-teal)", background: "var(--fur-teal-light)" }
                    : { borderColor: "transparent", color: "var(--fur-slate-light)", background: "white" }}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-700"
                      style={
                        tab.value === "pending"
                          ? { background: "#FEF3C7", color: "#92400E" }
                          : tab.value === "rescheduled"
                          ? { background: "#EDE9FE", color: "#5B21B6" }
                          : active
                          ? { background: "rgba(0,0,0,0.08)", color: "var(--fur-teal-dark)" }
                          : { background: "var(--fur-mist)", color: "var(--fur-slate-mid)" }
                      }>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="rounded-xl border p-4" style={{ background: "white", borderColor: "var(--border)" }}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                placeholder="Search by owner, pet, or service…"
                className="fur-input"
                style={{ paddingLeft: "2.5rem" }}
              />
              <svg className="w-4 h-4 absolute left-3 top-3.5" style={{ color: "var(--fur-slate-light)" }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="fur-input">
              <option value="all">All dates</option>
              <option value="today">Today</option>
              <option value="week">Next 7 days</option>
              <option value="month">Next 30 days</option>
            </select>
            <select value={filters.serviceId}
              onChange={(e) => setFilters({ ...filters, serviceId: e.target.value })}
              className="fur-input">
              <option value="all">All services</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Booking List ── */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border p-14 text-center" style={{ background: "white", borderColor: "var(--border)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--fur-mist)", color: "var(--fur-slate-light)" }}>
              <InboxIcon />
            </div>
            <p className="font-700 text-lg mb-1" style={{ color: "var(--fur-slate)" }}>No bookings found</p>
            <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((booking) => {
              const cfg = BOOKING_STATUS_CONFIG[booking.status];
              const isExpanded = expandedId === booking.id;
              const effectiveDate = booking.rescheduleDate || booking.date;
              const effectiveTime = booking.rescheduleTime || booking.time;

              const dpExpired = isDownPaymentExpired(booking);
              const dpHoursLeft = booking.status === "awaiting_downpayment" ? downPaymentHoursRemaining(booking) : null;

              const hasPendingEdit = booking.editRequestStatus === "pending";
              const hasPendingCancel = booking.cancelRequestStatus === "pending";
              const hasRescheduleProposal = booking.status === "rescheduled" && !!booking.rescheduleDate && !!booking.rescheduleTime;
              const ownerRespondedToReschedule = booking.rescheduleStatus === "confirmed" || booking.rescheduleStatus === "declined";
              const isAwaitingPayment = booking.status === "awaiting_downpayment";
              const isPaymentSubmitted = booking.status === "payment_submitted";
              const isCompleted = booking.status === "completed";

              const showPaymentSummary =
                (booking.status === "confirmed" || booking.status === "awaiting_downpayment" || booking.status === "payment_submitted") &&
                booking.requiresDownPayment && booking.price > 0;

              const isConfirmingThisPayment = confirmingPaymentId === booking.id;
              const hasPaymentError = paymentError === booking.id;

              return (
                <div key={booking.id} className="rounded-xl border overflow-hidden transition-shadow"
                  style={{ background: "white", borderColor: "var(--border)", boxShadow: isExpanded ? "0 2px 12px rgba(0,0,0,0.06)" : "none" }}>

                  {/* ── Booking Row ── */}
                  <div
                    className="flex items-center px-5 py-4 cursor-pointer select-none transition-colors"
                    style={{ background: isExpanded ? "var(--fur-cream)" : "white" }}
                    onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = "var(--fur-cream)"; }}
                    onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = "white"; }}
                    onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mr-4"
                      style={{ background: "var(--fur-teal-light)", color: "var(--fur-teal)" }}>
                      <PetIcon />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <p className="font-700 text-sm" style={{ color: "var(--fur-slate)" }}>{booking.serviceName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-md border font-600 ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        {hasPendingEdit && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border font-600"
                            style={{ background: "#FEF3C7", color: "#92400E", borderColor: "#FCD34D" }}>
                            <EditIcon /> Edit Req.
                          </span>
                        )}
                        {hasPendingCancel && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border font-600"
                            style={{ background: "var(--fur-rose-light)", color: "var(--fur-rose)", borderColor: "#FCA5A5" }}>
                            <CancelIcon /> Cancel Req.
                          </span>
                        )}
                        {hasRescheduleProposal && !ownerRespondedToReschedule && (
                          <span className="text-xs px-2 py-0.5 rounded-md border font-600"
                            style={{ background: "#F5F3FF", color: "#7C3AED", borderColor: "#C4B5FD" }}>
                            ⏳ Awaiting Owner
                          </span>
                        )}
                        {isPaymentSubmitted && (
                          <span className="text-xs px-2 py-0.5 rounded-md border font-600"
                            style={{ background: "#DBEAFE", color: "#1E40AF", borderColor: "#BFDBFE" }}>
                            🕐 Payment Submitted
                          </span>
                        )}
                        {isCompleted && typeof booking.rating === "number" && booking.rating > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border font-600"
                            style={{ background: "#FFFBEB", color: "#92400E", borderColor: "#FDE68A" }}>
                            <StarFilledIcon size={11} /> {booking.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                        {booking.petName} ({booking.petBreed}) · {booking.ownerName}
                      </p>
                      <p className="text-xs mt-0.5 inline-flex items-center gap-1" style={{ color: "var(--fur-slate-light)" }}>
                        <CalendarIcon /> {formatBookingDateTime(effectiveDate, effectiveTime)}
                        {booking.rescheduleDate && (
                          <span className="ml-1" style={{ color: "#7C3AED", fontWeight: 600 }}>
                            {ownerRespondedToReschedule ? "(rescheduled)" : "(proposal pending)"}
                          </span>
                        )}
                      </p>
                      {isAwaitingPayment && (
                        <p className="text-xs mt-1 font-700 inline-flex items-center gap-1"
                          style={{ color: dpExpired ? "var(--fur-rose)" : "#D97706" }}>
                          <ClockIcon />
                          {dpExpired ? "Payment deadline passed — will auto-decline" : `Payment due within ${Math.ceil(dpHoursLeft ?? 0)} hrs`}
                        </p>
                      )}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                      <p className="font-800 text-sm hidden sm:block" style={{ color: "var(--fur-slate)", fontFamily: "'Fraunces', serif" }}>
                        {formatCurrency(booking.price)}
                      </p>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        style={{ color: "var(--fur-slate-light)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* ── Expanded Detail Panel ── */}
                  {isExpanded && (
                    <div className="border-t" style={{ borderColor: "var(--border)", background: "var(--fur-cream)" }}>
                      <div className="px-5 py-5 space-y-5">

                        {/* Owner + Pet info row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="rounded-xl border px-4 py-3" style={{ background: "white", borderColor: "var(--border)" }}>
                            <InfoPair
                              label="Owner"
                              value={booking.ownerName}
                              sub={[booking.ownerEmail, booking.ownerPhone].filter(Boolean).join(" · ")}
                            />
                          </div>
                          <div className="rounded-xl border px-4 py-3" style={{ background: "white", borderColor: "var(--border)" }}>
                            <InfoPair
                              label="Pet"
                              value={booking.petName}
                              sub={`${booking.petType} · ${booking.petBreed}`}
                            />
                          </div>
                        </div>

                        {/* Down Payment */}
                        {booking.requiresDownPayment && (
                          <div className="rounded-xl border px-4 py-3" style={{ background: "white", borderColor: "var(--border)" }}>
                            <SectionLabel>Down Payment</SectionLabel>
                            {booking.downPaymentPaid ? (
                              <div className="flex items-center gap-2 rounded-lg px-3 py-2 border"
                                style={{ background: "#D1FAE5", borderColor: "#6EE7B7" }}>
                                <span style={{ color: "#059669" }}><CheckIcon /></span>
                                <span className="text-sm font-700" style={{ color: "#065F46" }}>Paid</span>
                                {booking.downPaymentPaidAt && (
                                  <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                                    — {new Date(booking.downPaymentPaidAt).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            ) : isPaymentSubmitted ? (
                              <div className="rounded-lg px-3 py-2 border" style={{ background: "#DBEAFE", borderColor: "#BFDBFE" }}>
                                <p className="text-sm font-700" style={{ color: "#1E40AF" }}>
                                  🕐 Owner marked as paid — please verify and confirm
                                </p>
                              </div>
                            ) : dpExpired ? (
                              <div className="rounded-lg px-3 py-2 border" style={{ background: "var(--fur-rose-light)", borderColor: "#FCA5A5" }}>
                                <p className="text-sm font-700" style={{ color: "var(--fur-rose)" }}>
                                  Payment deadline passed. This booking will be automatically declined.
                                </p>
                              </div>
                            ) : (
                              <div className="rounded-lg px-3 py-2 border" style={{ background: "#FFEDD5", borderColor: "#FDBA74" }}>
                                <p className="text-sm font-700" style={{ color: "#9A3412" }}>
                                  Waiting for owner payment — {Math.ceil(dpHoursLeft ?? 0)} hrs remaining
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Payment Summary */}
                        {showPaymentSummary && (
                          <div className="rounded-xl border px-4 py-3" style={{ background: "white", borderColor: "var(--border)" }}>
                            <SectionLabel>Payment Summary</SectionLabel>
                            <div className="rounded-lg px-4 py-3 border space-y-2"
                              style={{ background: "var(--fur-teal-light)", borderColor: "var(--fur-teal)" }}>
                              <div className="flex justify-between text-sm">
                                <span style={{ color: "var(--fur-slate)" }}>Total Price</span>
                                <span className="font-700" style={{ color: "var(--fur-slate)" }}>{formatCurrency(booking.price)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span style={{ color: "var(--fur-slate)" }}>Down Payment (30%)</span>
                                <span className="font-700" style={{ color: booking.downPaymentPaid ? "#059669" : "#9A3412" }}>
                                  {booking.downPaymentPaid ? `✓ Paid — ${formatCurrency(booking.price * 0.3)}` : `Pending — ${formatCurrency(booking.price * 0.3)}`}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm pt-2 border-t" style={{ borderColor: "var(--fur-teal)" }}>
                                <span className="font-700" style={{ color: "var(--fur-slate)" }}>Remaining Balance</span>
                                <span className="font-800" style={{ color: "var(--fur-teal-dark)" }}>
                                  {formatCurrency(booking.downPaymentPaid ? booking.price * 0.7 : booking.price)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {booking.notes && (
                          <div className="rounded-xl border px-4 py-3" style={{ background: "white", borderColor: "var(--border)" }}>
                            <SectionLabel>Owner Notes</SectionLabel>
                            <p className="text-sm rounded-lg px-3 py-2 border"
                              style={{ color: "var(--fur-slate)", background: "var(--fur-amber-light)", borderColor: "var(--fur-amber)" }}>
                              {booking.notes}
                            </p>
                          </div>
                        )}

                        {booking.providerNotes && (
                          <div className="rounded-xl border px-4 py-3" style={{ background: "white", borderColor: "var(--border)" }}>
                            <SectionLabel>Your Notes</SectionLabel>
                            <p className="text-sm rounded-lg px-3 py-2 border"
                              style={{ color: "var(--fur-slate)", background: "var(--fur-teal-light)", borderColor: "var(--fur-teal)" }}>
                              {booking.providerNotes}
                            </p>
                          </div>
                        )}

                        {/* ── Client Review (completed bookings only) ── */}
                        {isCompleted && (
                          <div className="rounded-xl border px-4 py-3" style={{ background: "white", borderColor: "var(--border)" }}>
                            <ReviewCard booking={booking} />
                          </div>
                        )}

                        {/* Reschedule proposal status */}
                        {hasRescheduleProposal && !ownerRespondedToReschedule && (
                          <div className="rounded-xl border px-4 py-3"
                            style={{ background: "#F5F3FF", borderColor: "#C4B5FD" }}>
                            <p className="text-sm font-700 mb-1" style={{ color: "#5B21B6" }}>
                              📅 Reschedule proposal sent — awaiting owner response
                            </p>
                            <p className="text-sm" style={{ color: "#6D28D9" }}>
                              <span className="font-700">Proposed time: </span>
                              {formatBookingDateTime(booking.rescheduleDate!, booking.rescheduleTime!)}
                            </p>
                            <p className="text-xs mt-1" style={{ color: "#7C3AED", opacity: 0.7 }}>
                              The owner will confirm or decline this proposal from their dashboard.
                            </p>
                          </div>
                        )}

                        {/* Pending edit request */}
                        {hasPendingEdit && (
                          <div className="rounded-xl border px-4 py-3" style={{ background: "#FFFBEB", borderColor: "#FCD34D" }}>
                            <p className="text-sm font-700 mb-1" style={{ color: "#92400E" }}>
                              The owner is requesting to edit this booking.
                            </p>
                            <p className="text-xs mb-3" style={{ color: "#B45309" }}>
                              Review the changes and approve or reject their request.
                            </p>
                            <div className="flex gap-2">
                              <button onClick={() => handleApproveEdit(booking.id)}
                                className="px-3 py-1.5 text-white text-xs font-700 rounded-lg transition-colors"
                                style={{ background: "#059669" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#047857")}
                                onMouseLeave={e => (e.currentTarget.style.background = "#059669")}>
                                Approve Edit
                              </button>
                              <button onClick={() => handleRejectEdit(booking.id)}
                                className="px-3 py-1.5 text-xs font-700 rounded-lg border transition-colors"
                                style={{ background: "var(--fur-rose-light)", color: "var(--fur-rose)", borderColor: "#FCA5A5" }}>
                                Reject Edit
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Pending cancel request */}
                        {hasPendingCancel && (
                          <div className="rounded-xl border px-4 py-3" style={{ background: "var(--fur-rose-light)", borderColor: "#FCA5A5" }}>
                            <p className="text-sm font-700 mb-1" style={{ color: "var(--fur-rose)" }}>
                              The owner is requesting to cancel this booking.
                            </p>
                            <p className="text-xs mb-3" style={{ color: "var(--fur-rose)" }}>
                              Approving will cancel the booking immediately.
                            </p>
                            <div className="flex gap-2">
                              <button onClick={() => handleApproveCancel(booking.id)}
                                className="px-3 py-1.5 text-white text-xs font-700 rounded-lg transition-colors"
                                style={{ background: "var(--fur-rose)" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#b91c1c")}
                                onMouseLeave={e => (e.currentTarget.style.background = "var(--fur-rose)")}>
                                Approve Cancellation
                              </button>
                              <button onClick={() => handleRejectCancel(booking.id)}
                                className="px-3 py-1.5 text-xs font-700 rounded-lg border transition-colors"
                                style={{ background: "white", color: "var(--fur-slate-mid)", borderColor: "var(--border)" }}>
                                Reject &amp; Keep Booking
                              </button>
                            </div>
                          </div>
                        )}

                        {/* ── Primary Action Buttons ── */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {booking.status === "pending" && (
                            <>
                              <button onClick={() => openModal(booking, "accept")}
                                className="px-4 py-2 text-white text-sm font-700 rounded-lg transition-colors"
                                style={{ background: "#059669" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#047857")}
                                onMouseLeave={e => (e.currentTarget.style.background = "#059669")}>
                                Accept
                              </button>
                              <button onClick={() => openModal(booking, "reschedule")}
                                className="px-4 py-2 text-white text-sm font-700 rounded-lg transition-colors"
                                style={{ background: "#7C3AED" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#6D28D9")}
                                onMouseLeave={e => (e.currentTarget.style.background = "#7C3AED")}>
                                Reschedule
                              </button>
                              <button onClick={() => openModal(booking, "reject")}
                                className="px-4 py-2 text-sm font-700 rounded-lg border transition-colors"
                                style={{ background: "var(--fur-rose-light)", color: "var(--fur-rose)", borderColor: "#FCA5A5" }}>
                                Reject
                              </button>
                            </>
                          )}

                          {isAwaitingPayment && (
                            <button onClick={() => openModal(booking, "reject")}
                              className="px-4 py-2 text-sm font-700 rounded-lg border transition-colors"
                              style={{ background: "var(--fur-rose-light)", color: "var(--fur-rose)", borderColor: "#FCA5A5" }}>
                              Decline
                            </button>
                          )}

                          {isPaymentSubmitted && (
                            <div className="flex flex-col gap-2 w-full">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleConfirmPayment(booking.id)}
                                  disabled={isConfirmingThisPayment}
                                  className="px-4 py-2 text-white text-sm font-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                  style={{ background: "#059669" }}
                                  onMouseEnter={e => { if (!isConfirmingThisPayment) e.currentTarget.style.background = "#047857"; }}
                                  onMouseLeave={e => { if (!isConfirmingThisPayment) e.currentTarget.style.background = "#059669"; }}>
                                  {isConfirmingThisPayment ? "Confirming…" : "✓ Confirm Payment Received"}
                                </button>
                                <button
                                  onClick={() => openModal(booking, "reject")}
                                  disabled={isConfirmingThisPayment}
                                  className="px-4 py-2 text-sm font-700 rounded-lg border transition-colors disabled:opacity-60"
                                  style={{ background: "var(--fur-rose-light)", color: "var(--fur-rose)", borderColor: "#FCA5A5" }}>
                                  ✗ Payment Not Received
                                </button>
                              </div>
                              {hasPaymentError && (
                                <p className="text-xs font-700 rounded-lg px-3 py-2 border"
                                  style={{ background: "var(--fur-rose-light)", color: "var(--fur-rose)", borderColor: "#FCA5A5" }}>
                                  ⚠️ Failed to confirm payment. Check your connection and try again.
                                </p>
                              )}
                            </div>
                          )}

                          {booking.status === "confirmed" && (
                            <>
                              <button onClick={() => openModal(booking, "complete")}
                                className="px-4 py-2 text-white text-sm font-700 rounded-lg transition-colors"
                                style={{ background: "var(--fur-teal)" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-teal-dark)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "var(--fur-teal)")}>
                                Mark Complete
                              </button>
                              <button onClick={() => openModal(booking, "reschedule")}
                                className="px-4 py-2 text-sm font-700 rounded-lg border transition-colors"
                                style={{ background: "#EDE9FE", color: "#5B21B6", borderColor: "#C4B5FD" }}>
                                Reschedule
                              </button>
                              <button onClick={() => openModal(booking, "reject")}
                                className="px-4 py-2 text-sm font-700 rounded-lg border transition-colors"
                                style={{ background: "var(--fur-rose-light)", color: "var(--fur-rose)", borderColor: "#FCA5A5" }}>
                                Cancel
                              </button>
                            </>
                          )}

                          {booking.status === "rescheduled" && (
                            <>
                              <button onClick={() => openModal(booking, "reschedule")}
                                className="px-4 py-2 text-sm font-700 rounded-lg transition-colors"
                                style={{ background: "#7C3AED", color: "white" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#6D28D9")}
                                onMouseLeave={e => (e.currentTarget.style.background = "#7C3AED")}>
                                📅 Change Proposal
                              </button>
                              <button onClick={() => openModal(booking, "reject")}
                                className="px-4 py-2 text-sm font-700 rounded-lg border transition-colors"
                                style={{ background: "var(--fur-rose-light)", color: "var(--fur-rose)", borderColor: "#FCA5A5" }}>
                                ✗ Cancel Booking
                              </button>
                            </>
                          )}

                          {(booking.status === "completed" || booking.status === "cancelled" || booking.status === "declined") && (
                            <p className="text-sm italic" style={{ color: "var(--fur-slate-light)" }}>
                              No further actions available
                            </p>
                          )}
                        </div>
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