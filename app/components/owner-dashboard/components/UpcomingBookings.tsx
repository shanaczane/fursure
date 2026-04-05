"use client";

import React from "react";
import Link from "next/link";
import {
  type Booking,
  BOOKING_STATUS_LABELS,
  getBookingPermissions,
  gracePeriodHoursRemaining,
  isDownPaymentExpired,
} from "@/app/types";
import { formatBookingDate, formatRelativeDate } from "@/app/utils/dashboardUtils";

interface UpcomingBookingsProps {
  bookings: Booking[];
  showViewAll?: boolean;
  onEdit?: (booking: Booking) => void;
  onCancel?: (bookingId: string, needsApproval: boolean) => void;
  onDelete?: (bookingId: string) => void;
  onPayDownPayment?: (bookingId: string) => void;
  onConfirmReschedule?: (bookingId: string) => void;
  onDeclineReschedule?: (bookingId: string) => void;
}

/* ─── Status pill config ─────────────────────────────────────────────────── */
const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  pending:              { color: "#92400E", bg: "#FEF3C7" },
  awaiting_downpayment: { color: "#9A3412", bg: "#FFEDD5" },
  payment_submitted:    { color: "#1E40AF", bg: "#DBEAFE" },
  confirmed:            { color: "#065F46", bg: "#D1FAE5" },
  rescheduled:          { color: "#5B21B6", bg: "#EDE9FE" },
  completed:            { color: "#134E4A", bg: "#CCFBF1" },
  cancelled:            { color: "#991B1B", bg: "#FEE2E2" },
  declined:             { color: "#374151", bg: "#F3F4F6" },
};

/* ─── Small SVG icons ────────────────────────────────────────────────────── */
const BuildingIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
  </svg>
);
const PawIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="4" cy="8" r="2"/><circle cx="7" cy="15" r="2"/><path d="M15 12a5 5 0 0 0-6 0l-2 7h10l-2-7z"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const InfoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

/* ─── Component ──────────────────────────────────────────────────────────── */
const UpcomingBookings: React.FC<UpcomingBookingsProps> = ({
  bookings,
  showViewAll = false,
  onEdit,
  onCancel,
  onDelete,
  onPayDownPayment,
  onConfirmReschedule,
  onDeclineReschedule,
}) => {
  const displayBookings = showViewAll ? bookings.slice(0, 3) : bookings;

  return (
    <div
      className="rounded-2xl border"
      style={{ background: "white", borderColor: "var(--border)", fontFamily: "'Nunito', sans-serif" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "var(--border)", background: "var(--fur-cream)", borderRadius: "1rem 1rem 0 0" }}
      >
        <h2 className="text-lg font-800" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
          Upcoming Bookings
        </h2>
        {showViewAll && (
          <Link
            href="/owner/bookings"
            className="text-sm font-700 transition-colors"
            style={{ color: "var(--fur-teal)" }}
          >
            View all →
          </Link>
        )}
      </div>

      {/* Empty state */}
      {bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: "var(--fur-mist)" }}
          >
            <CalendarIcon />
          </div>
          <p className="font-700 text-sm mb-1" style={{ color: "var(--fur-slate)" }}>No upcoming bookings</p>
          <p className="text-xs mb-3" style={{ color: "var(--fur-slate-light)" }}>Book a service to get started</p>
          <Link
            href="/owner/services"
            className="text-sm font-700 px-4 py-1.5 rounded-xl transition-colors"
            style={{ background: "var(--fur-teal-light)", color: "var(--fur-teal-dark)" }}
          >
            Browse services
          </Link>
        </div>
      )}

      {/* Booking cards */}
      <div className="divide-y" style={{ borderColor: "var(--border)" }}>
        {displayBookings.map((booking) => {
          const permissions = getBookingPermissions(booking);
          const hoursLeft = gracePeriodHoursRemaining(booking);
          const downPaymentExpired = isDownPaymentExpired(booking);
          const editApproved = booking.editRequestStatus === "approved";
          const paymentSubmitted = booking.status === "payment_submitted";
          const hasRescheduleProposal =
            booking.status === "rescheduled" && !!booking.rescheduleDate && !!booking.rescheduleTime;

          const statusStyle = STATUS_STYLE[booking.status] ?? { color: "#374151", bg: "#F3F4F6" };
          const displayDate = hasRescheduleProposal ? booking.rescheduleDate! : booking.date;
          const displayTime = hasRescheduleProposal ? booking.rescheduleTime! : booking.time;

          return (
            <div key={booking.id} className="px-5 py-4">

              {/* ── Top row: service name + date badge ── */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-800 text-base leading-tight" style={{ color: "var(--fur-slate)", fontFamily: "'Fraunces', serif" }}>
                      {booking.serviceName}
                    </h3>
                    <span
                      className="text-xs font-700 px-2.5 py-0.5 rounded-full shrink-0"
                      style={{ background: statusStyle.bg, color: statusStyle.color }}
                    >
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </span>
                  </div>
                </div>

                {/* Date badge */}
                <div
                  className="text-xs font-700 px-3 py-1.5 rounded-xl shrink-0 whitespace-nowrap"
                  style={{ background: "var(--fur-teal-light)", color: "var(--fur-teal-dark)" }}
                >
                  {formatRelativeDate(displayDate)}
                </div>
              </div>

              {/* ── Info grid ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--fur-slate-mid)" }}><BuildingIcon /></span>
                  <span className="text-sm font-600 truncate" style={{ color: "var(--fur-slate)" }}>{booking.providerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--fur-slate-mid)" }}><PawIcon /></span>
                  <span className="text-sm font-600 truncate" style={{ color: "var(--fur-slate)" }}>{booking.petName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--fur-slate-mid)" }}>
                    {hasRescheduleProposal ? <ClockIcon /> : <CalendarIcon />}
                  </span>
                  {hasRescheduleProposal ? (
                    <span className="text-sm line-through" style={{ color: "var(--fur-slate-light)" }}>
                      {formatBookingDate(booking.date, booking.time)}
                    </span>
                  ) : (
                    <span className="text-sm font-600" style={{ color: "var(--fur-slate)" }}>
                      {formatBookingDate(displayDate, displayTime)}
                    </span>
                  )}
                </div>
              </div>

              {/* ── Notes ── */}
              {booking.notes && (
                <p className="text-xs italic mb-3" style={{ color: "var(--fur-slate-light)" }}>
                  &ldquo;{booking.notes}&rdquo;
                </p>
              )}

              {/* ── Reschedule proposal banner ── */}
              {hasRescheduleProposal && (
                <div
                  className="rounded-xl px-4 py-3 mb-3 border"
                  style={{ background: "#F5F3FF", borderColor: "#C4B5FD" }}
                >
                  <div className="flex items-start gap-2 mb-1">
                    <span style={{ color: "#7C3AED", marginTop: 1 }}><InfoIcon /></span>
                    <div>
                      <p className="text-sm font-800" style={{ color: "#5B21B6" }}>
                        Provider proposed a new schedule
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#6D28D9" }}>
                        New time: <span className="font-700">{formatBookingDate(booking.rescheduleDate!, booking.rescheduleTime!)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {onConfirmReschedule && (
                      <button
                        onClick={() => onConfirmReschedule(booking.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-700 transition-colors"
                        style={{ background: "#7C3AED", color: "white" }}
                      >
                        Accept
                      </button>
                    )}
                    {onDeclineReschedule && (
                      <button
                        onClick={() => onDeclineReschedule(booking.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-700 border transition-colors"
                        style={{ background: "white", color: "#DC2626", borderColor: "#FECACA" }}
                      >
                        Decline
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── Down payment: expired ── */}
              {booking.status === "awaiting_downpayment" && downPaymentExpired && (
                <div
                  className="rounded-xl px-4 py-3 mb-3 border flex items-start gap-2"
                  style={{ background: "#FEF2F2", borderColor: "#FECACA" }}
                >
                  <span style={{ color: "#DC2626", marginTop: 1 }}><AlertIcon /></span>
                  <div>
                    <p className="text-sm font-800" style={{ color: "#991B1B" }}>Payment window closed</p>
                    <p className="text-xs mt-0.5" style={{ color: "#B91C1C" }}>
                      The deadline has passed. This booking has been automatically cancelled.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Down payment: active ── */}
              {booking.status === "awaiting_downpayment" && !downPaymentExpired && (
                <div
                  className="rounded-xl px-4 py-3 mb-3 border"
                  style={{ background: "#FFF7ED", borderColor: "#FED7AA" }}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span style={{ color: "#EA580C", marginTop: 1 }}><AlertIcon /></span>
                    <div>
                      <p className="text-sm font-800" style={{ color: "#9A3412" }}>Cash down payment required</p>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#C2410C" }}>
                        Pay the provider in cash to hold your booking.{" "}
                        {hoursLeft > 0 && (
                          <span className="font-800">
                            {Math.ceil(hoursLeft)} hour{Math.ceil(hoursLeft) !== 1 ? "s" : ""} remaining.
                          </span>
                        )}{" "}
                        Once paid, tap the button below so the provider can verify and confirm.
                      </p>
                    </div>
                  </div>
                  {onPayDownPayment && (
                    <button
                      onClick={() => onPayDownPayment(booking.id)}
                      className="w-full py-2 rounded-xl text-sm font-800 transition-colors"
                      style={{ background: "#EA580C", color: "white" }}
                    >
                      I&apos;ve Paid — Notify Provider
                    </button>
                  )}
                </div>
              )}

              {/* ── Payment submitted ── */}
              {paymentSubmitted && (
                <div
                  className="rounded-xl px-4 py-3 mb-3 border flex items-start gap-2"
                  style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}
                >
                  <span style={{ color: "#2563EB", marginTop: 1 }}><CheckCircleIcon /></span>
                  <div>
                    <p className="text-sm font-800" style={{ color: "#1E40AF" }}>Payment submitted — awaiting confirmation</p>
                    <p className="text-xs mt-0.5" style={{ color: "#1D4ED8" }}>
                      The provider will verify your payment and confirm your booking shortly.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Edit approved banner ── */}
              {editApproved && (
                <div
                  className="rounded-xl px-4 py-2.5 mb-3 border flex items-center gap-2"
                  style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
                >
                  <span style={{ color: "#16A34A" }}><CheckCircleIcon /></span>
                  <p className="text-xs font-700" style={{ color: "#166534" }}>
                    Edit approved — you can now update your booking.
                  </p>
                </div>
              )}

              {/* ── Pending request notices ── */}
              {booking.editRequestStatus === "pending" && (
                <div
                  className="rounded-xl px-4 py-2.5 mb-3 border flex items-center gap-2"
                  style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
                >
                  <span style={{ color: "#D97706" }}><ClockIcon /></span>
                  <p className="text-xs font-700" style={{ color: "#92400E" }}>
                    Edit request sent — waiting for provider approval.
                  </p>
                </div>
              )}
              {booking.cancelRequestStatus === "pending" && (
                <div
                  className="rounded-xl px-4 py-2.5 mb-3 border flex items-center gap-2"
                  style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
                >
                  <span style={{ color: "#D97706" }}><ClockIcon /></span>
                  <p className="text-xs font-700" style={{ color: "#92400E" }}>
                    Cancellation request sent — waiting for provider approval.
                  </p>
                </div>
              )}

              {/* ── Grace period expired notice ── */}
              {booking.status === "pending" && !permissions.withinGracePeriod && (
                <p className="text-xs mb-2" style={{ color: "var(--fur-slate-light)" }}>
                  Grace period expired — edits and cancellations are no longer available.
                </p>
              )}

              {/* ── Confirmed: edits need approval notice ── */}
              {booking.status === "confirmed" && !editApproved && booking.editRequestStatus !== "pending" && (
                <p className="text-xs mb-2" style={{ color: "var(--fur-slate-light)" }}>
                  Edits or cancellations require provider approval once confirmed.
                </p>
              )}

              {/* ── Contact provider (confirmed only) ── */}
              {booking.status === "confirmed" &&
                (booking.providerPhone || booking.providerEmail || booking.providerContactLink) && (
                <div
                  className="rounded-xl px-4 py-3 mb-3 border"
                  style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
                >
                  <p className="text-xs font-800 mb-1.5" style={{ color: "#166534" }}>Contact Provider</p>
                  <div className="space-y-1">
                    {booking.providerPhone && (
                      <a href={`tel:${booking.providerPhone}`} className="flex items-center gap-1.5 text-xs font-600" style={{ color: "#15803D" }}>
                        <span>📱</span><span>{booking.providerPhone}</span>
                      </a>
                    )}
                    {booking.providerEmail && (
                      <a href={`mailto:${booking.providerEmail}`} className="flex items-center gap-1.5 text-xs font-600" style={{ color: "#15803D" }}>
                        <span>✉️</span><span>{booking.providerEmail}</span>
                      </a>
                    )}
                    {booking.providerContactLink && (
                      <a href={booking.providerContactLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-600" style={{ color: "#15803D" }}>
                        <span>🔗</span>
                        <span>
                          {booking.providerContactLink.includes("facebook") ? "Facebook"
                            : booking.providerContactLink.includes("instagram") ? "Instagram"
                            : booking.providerContactLink.includes("tiktok") ? "TikTok"
                            : booking.providerContactLink.includes("twitter") || booking.providerContactLink.includes("x.com") ? "Twitter / X"
                            : "Social Profile"}
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* ── Action buttons ── */}
              {!hasRescheduleProposal && !paymentSubmitted && (
                <div className="flex gap-2 flex-wrap mt-1">
                  {onEdit && editApproved && (
                    <button
                      onClick={() => onEdit(booking)}
                      className="px-4 py-1.5 rounded-xl text-xs font-700 transition-colors"
                      style={{ background: "var(--fur-teal)", color: "white" }}
                    >
                      Edit Now
                    </button>
                  )}
                  {onEdit && !editApproved && permissions.canEdit && (
                    <button
                      onClick={() => onEdit(booking)}
                      className="px-4 py-1.5 rounded-xl text-xs font-700 border transition-colors"
                      style={{ background: "var(--fur-teal-light)", color: "var(--fur-teal-dark)", borderColor: "var(--fur-teal-light)" }}
                    >
                      {permissions.editNeedsProviderApproval ? "Request Edit" : "Edit"}
                    </button>
                  )}
                  {onCancel && permissions.canCancel && (
                    <button
                      onClick={() => onCancel(booking.id, permissions.cancelNeedsProviderApproval)}
                      className="px-4 py-1.5 rounded-xl text-xs font-700 border transition-colors"
                      style={{ background: "white", color: "#B45309", borderColor: "#FDE68A" }}
                    >
                      {permissions.cancelNeedsProviderApproval ? "Request Cancel" : "Cancel"}
                    </button>
                  )}
                  {onDelete && permissions.canDelete && (
                    <button
                      onClick={() => onDelete(booking.id)}
                      className="px-4 py-1.5 rounded-xl text-xs font-700 border transition-colors"
                      style={{ background: "white", color: "#DC2626", borderColor: "#FECACA" }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingBookings;
