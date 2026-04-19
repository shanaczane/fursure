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
  formatBookingDateTime,
  formatCurrency,
} from "../utils/providerUtils";
import ProviderLayout from "../components/ProviderLayout";
import BookingActionModal from "../components/BookingActionModal";
import {
  providerInsertVaccination,
  providerInsertMedicalHistory,
} from "@/app/lib/api";
import type { Vaccination, MedicalHistory } from "@/app/types";

type ActionType = "accept" | "reject" | "reschedule" | "complete" | "approve_edit" | "approve_cancel";

// ─── Helper: format deadline hours into a human-readable label ───────────────
function formatDeadlineHours(hours: number): string {
  if (!hours || hours <= 0) return "—";
  if (hours === 1)  return "1 hour";
  if (hours < 24)   return `${hours} hours`;
  if (hours === 24) return "24 hours (1 day)";
  if (hours === 48) return "48 hours (2 days)";
  if (hours === 72) return "72 hours (3 days)";
  const days = Math.round(hours / 24);
  return `${hours} hours (${days} days)`;
}

/* ─── Service Emoji Map ──────────────────────────────────────────────────── */
const SERVICE_EMOJI: Record<string, string> = {
  grooming:   "✂️",
  veterinary: "🩺",
  training:   "🎯",
  boarding:   "🏠",
  walking:    "🦮",
  daycare:    "🐾",
};

function getServiceEmoji(serviceName: string): string {
  const lower = serviceName.toLowerCase();
  for (const [key, emoji] of Object.entries(SERVICE_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return "🐾";
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6"/>
  </svg>
);
const ChevronUpIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 15l-6-6-6 6"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ClockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const BellIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const StarFilledIcon = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const StarEmptyIcon = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const InboxIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);
const PetIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const CompleteIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const RescheduleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const RejectIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const AcceptIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const CancelIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const DeclineIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
);
const EditApproveIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const PaymentIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const RescheduleProposalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/* ─── Star Row ───────────────────────────────────────────────────────────── */
const StarRow: React.FC<{ rating: number; size?: number }> = ({ rating, size = 11 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
    {Array.from({ length: 5 }, (_, i) =>
      i < Math.round(rating)
        ? <StarFilledIcon key={i} size={size} />
        : <StarEmptyIcon key={i} size={size} />
    )}
  </div>
);

/* ─── Status Badge ───────────────────────────────────────────────────────── */
const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending:              { bg: "#FEF3C7", color: "#92400E" },
  awaiting_downpayment: { bg: "#FFEDD5", color: "#9A3412" },
  payment_submitted:    { bg: "#DBEAFE", color: "#1E40AF" },
  confirmed:            { bg: "#DBEAFE", color: "#1E40AF" },
  completed:            { bg: "#D1FAE5", color: "#065F46" },
  cancelled:            { bg: "#F3F4F6", color: "#374151" },
  declined:             { bg: "#FEE2E2", color: "#991B1B" },
  rescheduled:          { bg: "#EDE9FE", color: "#5B21B6" },
};
const STATUS_LABELS: Record<string, string> = {
  pending: "Pending", awaiting_downpayment: "Awaiting Payment",
  payment_submitted: "Payment Submitted", confirmed: "Confirmed",
  completed: "Completed", cancelled: "Cancelled",
  declined: "Declined", rescheduled: "Rescheduled",
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.declined;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: s.bg, color: s.color,
      fontSize: "0.8rem", fontWeight: 400,
      padding: "4px 12px", borderRadius: 9999,
      whiteSpace: "nowrap",
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
};

/* ─── Button style helper ────────────────────────────────────────────────── */
function btnStyle(variant: "teal" | "purple" | "rose" | "ghost"): React.CSSProperties {
  const variants = {
    teal:   { background: "var(--fur-teal)",       color: "white",                border: "none" },
    purple: { background: "#7C3AED",               color: "white",                border: "none" },
    rose:   { background: "var(--fur-rose-light)",  color: "var(--fur-rose)",      border: "1px solid #FCA5A5" },
    ghost:  { background: "white",                 color: "var(--fur-slate-mid)", border: "1px solid var(--border)" },
  };
  return {
    padding: "5px 12px", borderRadius: 8,
    fontSize: "0.82rem", fontWeight: 400,
    cursor: "pointer", fontFamily: "inherit",
    whiteSpace: "nowrap" as const,
    display: "inline-flex", alignItems: "center", gap: 6,
    ...variants[variant],
  };
}

/* ─── Filter helpers ─────────────────────────────────────────────────────── */
function filterAndSort(
  bookings: ProviderBooking[],
  filters: { status: string; month: string; serviceId: string; searchQuery: string }
): ProviderBooking[] {
  return bookings
    .filter((b) => {
      if (filters.status !== "all") {
        if (filters.status === "pending") {
          if (!["pending","awaiting_downpayment","payment_submitted"].includes(b.status)) return false;
        } else {
          if (b.status !== filters.status) return false;
        }
      }
      if (filters.serviceId !== "all" && b.serviceId !== filters.serviceId) return false;
      if (filters.month !== "all") {
        const d = new Date(b.date + "T00:00:00");
        if (d.getMonth() !== parseInt(filters.month)) return false;
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        if (
          !b.ownerName.toLowerCase().includes(q) &&
          !b.petName.toLowerCase().includes(q) &&
          !b.serviceName.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/* ─── Expanded Detail Panel ──────────────────────────────────────────────── */
const BookingDetailPanel: React.FC<{
  booking: ProviderBooking;
  isLast: boolean;
  onOpenModal: (b: ProviderBooking, a: ActionType) => void;
  onConfirmPayment: (id: string) => void;
  isConfirming: boolean;
  hasPayError: boolean;
  onApproveEdit: (id: string) => void;
  onRejectEdit: (id: string) => void;
  onApproveCancel: (id: string) => void;
  onRejectCancel: (id: string) => void;
  onOpenPetRecord: (b: ProviderBooking) => void;
  // ── Fallback policy values used when the booking predates the policy-snapshot
  //    feature. These come from the provider's live policy so that old bookings
  //    still display something sensible. ──────────────────────────────────────
  fallbackDepositPct: number;
  fallbackDeadlineHours: number;
}> = ({
  booking, isLast, onOpenModal, onConfirmPayment,
  isConfirming, hasPayError,
  onApproveEdit, onRejectEdit, onApproveCancel, onRejectCancel,
  onOpenPetRecord,
  fallbackDepositPct,
  fallbackDeadlineHours,
}) => {
  const isCompleted        = booking.status === "completed";
  const isAwaitingPayment  = booking.status === "awaiting_downpayment";
  const isPaymentSubmitted = booking.status === "payment_submitted";
  const isConfirmed        = booking.status === "confirmed";
  const dpExpired          = isDownPaymentExpired(booking);
  const dpHoursLeft        = isAwaitingPayment ? downPaymentHoursRemaining(booking) : null;
  const hasPendingEdit     = booking.editRequestStatus === "pending";
  const hasPendingCancel   = booking.cancelRequestStatus === "pending";
  const hasRescheduleProposal = booking.status === "rescheduled" && !!booking.rescheduleDate;
  const ownerResponded     = booking.rescheduleStatus === "confirmed" || booking.rescheduleStatus === "declined";
  const showPaySection     = booking.requiresDownPayment && booking.price > 0;

  // ── Policy snapshot: use the value stamped on the booking at creation time.
  //    Fall back to the provider's live policy only for bookings created before
  //    the snapshot feature was added. ───────────────────────────────────────
  const depositPct     = booking.depositPercentage     ?? fallbackDepositPct;
  const deadlineHours  = booking.downPaymentDeadlineHours ?? fallbackDeadlineHours;
  const deadlineLabel  = formatDeadlineHours(deadlineHours);
  const depositPctLabel = `${depositPct}%`;

  // ── Amounts computed from the snapshotted percentage ─────────────────────
  const downAmt   = booking.price * (depositPct / 100);
  const remaining = booking.price - downAmt;


  const cell: React.CSSProperties = {
    background: "white", border: "1px solid var(--border)",
    borderRadius: 10, padding: "10px 14px",
  };
  const cellLabel: React.CSSProperties = {
    fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.06em", color: "var(--fur-slate-light)", marginBottom: 4,
  };

  return (
    <tr>
      <td colSpan={7} style={{ padding: 0, borderBottom: isLast ? "none" : "2px solid var(--fur-teal)" }}>
        <div style={{ background: "var(--fur-cream)", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* ══ LEFT COLUMN ══ */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={cell}>
                  <p style={cellLabel}>Owner</p>
                  <p style={{ fontSize: "0.88rem", fontWeight: 400, color: "var(--fur-slate)", marginBottom: 2 }}>{booking.ownerName}</p>
                  {booking.ownerEmail && <p style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--fur-slate-light)" }}>{booking.ownerEmail}</p>}
                  {booking.ownerPhone && <p style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--fur-slate-light)" }}>{booking.ownerPhone}</p>}
                </div>
                <div style={cell}>
                  <p style={cellLabel}>Pet</p>
                  <p style={{ fontSize: "0.88rem", fontWeight: 400, color: "var(--fur-slate)", marginBottom: 2 }}>{booking.petName}</p>
                  <p style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--fur-slate-light)", textTransform: "capitalize" }}>{booking.petType} · {booking.petBreed}</p>
                </div>
              </div>

              {booking.notes && (
                <div style={cell}>
                  <p style={cellLabel}>Owner Notes</p>
                  <p style={{ fontSize: "0.82rem", fontWeight: 400, color: "var(--fur-slate)", lineHeight: 1.55 }}>{booking.notes}</p>
                </div>
              )}

              {booking.providerNotes && (
                <div style={{ background: "var(--fur-teal-light)", border: "1px solid var(--fur-teal)", borderRadius: 10, padding: "10px 14px" }}>
                  <p style={{ ...cellLabel, color: "var(--fur-teal-dark)" }}>Your Notes</p>
                  <p style={{ fontSize: "0.82rem", fontWeight: 400, color: "var(--fur-slate)", lineHeight: 1.55 }}>{booking.providerNotes}</p>
                </div>
              )}

              {isCompleted && typeof booking.rating === "number" && booking.rating > 0 && (
                <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #FDE68A" }}>
                  <div style={{ background: "#FFFBEB", borderBottom: "1px solid #FDE68A", padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#92400E" }}>Client Review</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <StarRow rating={booking.rating} />
                      <span style={{ fontSize: "0.82rem", fontWeight: 400, color: "#92400E" }}>{booking.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div style={{ background: "#FFFBEB", padding: "10px 14px" }}>
                    {booking.reviewComment
                      ? <p style={{ fontSize: "0.82rem", fontWeight: 400, color: "#92400E", fontStyle: "italic", lineHeight: 1.55 }}>"{booking.reviewComment}"</p>
                      : <p style={{ fontSize: "0.82rem", fontWeight: 400, color: "#B45309", fontStyle: "italic" }}>Rating only — no written comment.</p>
                    }
                    {booking.reviewDate && (
                      <p style={{ fontSize: "0.75rem", fontWeight: 400, color: "#B45309", marginTop: 4 }}>
                        {new Date(booking.reviewDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {hasRescheduleProposal && !ownerResponded && (
                <div style={{ background: "#F5F3FF", border: "1px solid #C4B5FD", borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <RescheduleProposalIcon />
                    <p style={{ fontSize: "0.82rem", fontWeight: 400, color: "#5B21B6" }}>Reschedule proposal sent</p>
                  </div>
                  <p style={{ fontSize: "0.78rem", fontWeight: 400, color: "#6D28D9" }}>
                    Proposed: {formatBookingDateTime(booking.rescheduleDate!, booking.rescheduleTime!)}
                  </p>
                  <p style={{ fontSize: "0.75rem", fontWeight: 400, color: "#7C3AED", marginTop: 3 }}>Awaiting owner response</p>
                </div>
              )}

              {hasPendingEdit && (
                <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <EditApproveIcon />
                    <p style={{ fontSize: "0.82rem", fontWeight: 400, color: "#92400E" }}>Owner requested to edit this booking</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => onApproveEdit(booking.id)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", background: "#059669", color: "white", border: "none", borderRadius: 8, fontSize: "0.82rem", fontWeight: 400, cursor: "pointer", fontFamily: "inherit" }}>
                      <AcceptIcon /> Approve Edit
                    </button>
                    <button onClick={() => onRejectEdit(booking.id)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", background: "var(--fur-rose-light)", color: "var(--fur-rose)", border: "1px solid #FCA5A5", borderRadius: 8, fontSize: "0.82rem", fontWeight: 400, cursor: "pointer", fontFamily: "inherit" }}>
                      <RejectIcon /> Reject Edit
                    </button>
                  </div>
                </div>
              )}

              {hasPendingCancel && (
                <div style={{ background: "var(--fur-rose-light)", border: "1px solid #FCA5A5", borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <CancelIcon />
                    <p style={{ fontSize: "0.82rem", fontWeight: 400, color: "var(--fur-rose)" }}>Owner requested to cancel this booking</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => onApproveCancel(booking.id)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", background: "var(--fur-rose)", color: "white", border: "none", borderRadius: 8, fontSize: "0.82rem", fontWeight: 400, cursor: "pointer", fontFamily: "inherit" }}>
                      <AcceptIcon /> Approve Cancel
                    </button>
                    <button onClick={() => onRejectCancel(booking.id)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", background: "white", color: "var(--fur-slate-mid)", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.82rem", fontWeight: 400, cursor: "pointer", fontFamily: "inherit" }}>
                      Keep Booking
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ══ RIGHT COLUMN ══ */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {showPaySection && (
                <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--fur-teal)" }}>
                  <div style={{ background: "var(--fur-teal)", padding: "9px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                    <PaymentIcon />
                    <p style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "white" }}>Payment Summary</p>
                  </div>
                  <div style={{ background: "var(--fur-teal-light)", padding: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 400, color: "var(--fur-slate)" }}>Total Service Fee</span>
                      <span style={{ fontSize: "1rem", fontWeight: 400, color: "var(--fur-slate)" }}>{formatCurrency(booking.price)}</span>
                    </div>
                    <div style={{
                      background: booking.downPaymentPaid ? "#D1FAE5" : isPaymentSubmitted ? "#DBEAFE" : "#FEF3C7",
                      border: `1px solid ${booking.downPaymentPaid ? "#6EE7B7" : isPaymentSubmitted ? "#BFDBFE" : "#FCD34D"}`,
                      borderRadius: 8, padding: "10px 12px", marginBottom: 12,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          {/* Shows the snapshotted deposit percentage from the booking */}
                          <p style={{ fontSize: "0.82rem", fontWeight: 400, color: booking.downPaymentPaid ? "#065F46" : isPaymentSubmitted ? "#1E40AF" : "#92400E" }}>
                            Down Payment ({depositPctLabel})
                          </p>
                          {booking.downPaymentPaid && booking.downPaymentPaidAt && (
                            <p style={{ fontSize: "0.72rem", fontWeight: 400, color: "#059669", marginTop: 2 }}>
                              Paid · {new Date(booking.downPaymentPaidAt).toLocaleString()}
                            </p>
                          )}
                          {!booking.downPaymentPaid && isPaymentSubmitted && (
                            <p style={{ fontSize: "0.72rem", fontWeight: 400, color: "#1D4ED8", marginTop: 2 }}>Owner marked as paid — verify below</p>
                          )}
                          {!booking.downPaymentPaid && isAwaitingPayment && (
                            <>
                              <p style={{ fontSize: "0.72rem", fontWeight: 400, color: dpExpired ? "var(--fur-rose)" : "#D97706", marginTop: 2 }}>
                                {dpExpired
                                  ? "Deadline passed"
                                  : `Due in ${Math.ceil(dpHoursLeft ?? 0)} hrs`}
                              </p>
                              {/* Shows the snapshotted deadline from the booking */}
                              <p style={{ fontSize: "0.72rem", fontWeight: 400, color: "var(--fur-slate-light)", marginTop: 1 }}>
                                Deadline: {deadlineLabel} from booking
                              </p>
                            </>
                          )}
                          {!booking.downPaymentPaid && isConfirmed && (
                            <p style={{ fontSize: "0.72rem", fontWeight: 400, color: "#92400E", marginTop: 2 }}>Awaiting payment from owner</p>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0, marginLeft: 12 }}>
                          {booking.downPaymentPaid && (
                            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.72rem", fontWeight: 400, color: "#059669" }}>
                              <CheckIcon /> Paid
                            </span>
                          )}
                          {/* Computed from the snapshotted percentage */}
                          <span style={{ fontSize: "0.9rem", fontWeight: 400, color: booking.downPaymentPaid ? "#065F46" : isPaymentSubmitted ? "#1E40AF" : "#92400E" }}>
                            {formatCurrency(downAmt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed var(--fur-teal)", paddingTop: 12 }}>
                      <div>
                        <p style={{ fontSize: "0.82rem", fontWeight: 400, color: "var(--fur-teal-dark)" }}>Remaining Balance</p>
                        <p style={{ fontSize: "0.72rem", fontWeight: 400, color: "var(--fur-slate-light)", marginTop: 1 }}>
                          {booking.downPaymentPaid ? "Collect on appointment day" : "Full amount still pending"}
                        </p>
                      </div>
                      {/* Computed from the snapshotted percentage */}
                      <span style={{ fontSize: "1.1rem", fontWeight: 400, color: "var(--fur-teal-dark)" }}>{formatCurrency(remaining)}</span>
                    </div>
                  </div>
                </div>
              )}

              {isPaymentSubmitted && (
                <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <ClockIcon />
                    <p style={{ fontSize: "0.82rem", fontWeight: 400, color: "#1E40AF" }}>
                      Owner marked down payment as paid — verify and confirm
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => onConfirmPayment(booking.id)} disabled={isConfirming}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 14px", background: "#059669", color: "white", border: "none", borderRadius: 8, fontSize: "0.82rem", fontWeight: 400, cursor: isConfirming ? "not-allowed" : "pointer", opacity: isConfirming ? 0.6 : 1, fontFamily: "inherit" }}>
                      <CheckIcon /> {isConfirming ? "Confirming…" : "Confirm Payment Received"}
                    </button>
                    <button onClick={() => onOpenModal(booking, "reject")} disabled={isConfirming}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 14px", background: "var(--fur-rose-light)", color: "var(--fur-rose)", border: "1px solid #FCA5A5", borderRadius: 8, fontSize: "0.82rem", fontWeight: 400, cursor: isConfirming ? "not-allowed" : "pointer", opacity: isConfirming ? 0.6 : 1, fontFamily: "inherit" }}>
                      <RejectIcon /> Not Received
                    </button>
                  </div>
                  {hasPayError && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem", fontWeight: 400, marginTop: 8, padding: "6px 10px", borderRadius: 6, background: "var(--fur-rose-light)", color: "var(--fur-rose)", border: "1px solid #FCA5A5" }}>
                      <AlertIcon /> Failed to confirm. Check your connection and try again.
                    </div>
                  )}
                </div>
              )}

              {isAwaitingPayment && (
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  background: dpExpired ? "var(--fur-rose-light)" : "#FFF7ED",
                  border: `1px solid ${dpExpired ? "#FCA5A5" : "#FED7AA"}`,
                  borderRadius: 10, padding: "12px 14px",
                }}>
                  <span style={{ marginTop: 1, color: dpExpired ? "var(--fur-rose)" : "#D97706", flexShrink: 0 }}><ClockIcon /></span>
                  <div>
                    <p style={{ fontSize: "0.82rem", fontWeight: 400, color: dpExpired ? "var(--fur-rose)" : "#D97706" }}>
                      {dpExpired
                        ? "Payment deadline passed — booking will auto-decline"
                        : `Payment due in ${Math.ceil(dpHoursLeft ?? 0)} hours`}
                    </p>
                    {!dpExpired && (
                      <p style={{ fontSize: "0.72rem", fontWeight: 400, color: "#92400E", marginTop: 3 }}>
                        Owner has {deadlineLabel} from booking to pay {formatCurrency(downAmt)}.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", paddingTop: 4, marginTop: "auto" }}>
                {booking.status === "pending" && (<>
                  <button onClick={() => onOpenModal(booking, "accept")} style={btnStyle("teal")}><AcceptIcon /> Accept</button>
                  <button onClick={() => onOpenModal(booking, "reschedule")} style={btnStyle("purple")}><RescheduleIcon /> Reschedule</button>
                  <button onClick={() => onOpenModal(booking, "reject")} style={btnStyle("rose")}><RejectIcon /> Reject</button>
                </>)}
                {isConfirmed && (<>
                  <button onClick={() => onOpenModal(booking, "complete")} style={btnStyle("teal")}><CompleteIcon /> Complete</button>
                  <button onClick={() => onOpenModal(booking, "reschedule")} style={btnStyle("purple")}><RescheduleIcon /> Reschedule</button>
                  <button onClick={() => onOpenModal(booking, "reject")} style={btnStyle("rose")}><CancelIcon /> Cancel</button>
                </>)}
                {isAwaitingPayment && (
                  <button onClick={() => onOpenModal(booking, "reject")} style={btnStyle("rose")}><DeclineIcon /> Decline Booking</button>
                )}
                {booking.status === "rescheduled" && (<>
                  <button onClick={() => onOpenModal(booking, "reschedule")} style={btnStyle("purple")}><RescheduleIcon /> Change Proposal</button>
                  <button onClick={() => onOpenModal(booking, "reject")} style={btnStyle("rose")}><CancelIcon /> Cancel</button>
                </>)}
                {(isCompleted || booking.status === "cancelled" || booking.status === "declined") && (
                  <p style={{ fontSize: "0.82rem", fontWeight: 400, fontStyle: "italic", color: "var(--fur-slate-light)" }}>No further actions</p>
                )}
                {booking.petId && (<>
                  <div style={{ width: 1, height: 26, background: "var(--border)", margin: "0 2px", flexShrink: 0 }} />
                  <button onClick={() => onOpenPetRecord(booking)} style={{ ...btnStyle("ghost"), background: "#EDE9FE", color: "#5B21B6", border: "1px solid #C4B5FD" }}>
                    <PetIcon /> Pet Record
                  </button>
                </>)}
              </div>

            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

/* ─── Main Page ──────────────────────────────────────────────────────────── */
const ManageBookingsPage: React.FC = () => {
  const {
    user, bookings, services, policy,
    acceptBooking, rejectBooking, rescheduleBooking, completeBooking,
    updateBooking, confirmPaymentReceived,
  } = useProviderContext();

  const [filters, setFilters] = useState({ status: "all", month: "all", serviceId: "all", searchQuery: "" });
  const [selectedBooking, setSelectedBooking] = useState<ProviderBooking | null>(null);
  const [action, setAction] = useState<ActionType | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [petRecordBooking, setPetRecordBooking] = useState<ProviderBooking | null>(null);
  const [petRecordTab, setPetRecordTab] = useState<"vaccinations" | "history">("vaccinations");
  const [petVaccinations, setPetVaccinations] = useState<Vaccination[]>([]);
  const [petHistory, setPetHistory] = useState<MedicalHistory[]>([]);
  const [petRecordLoading, setPetRecordLoading] = useState(false);
  const [petRecordError, setPetRecordError] = useState<string | null>(null);
  const [addingVax, setAddingVax] = useState(false);
  const [addingHist, setAddingHist] = useState(false);
  const [vaxPage, setVaxPage] = useState(1);
  const [histPage, setHistPage] = useState(1);
  const RECORDS_PER_PAGE = 5;
  const [vaxForm, setVaxForm] = useState({ name: "", dateGiven: "", nextDueDate: "", notes: "" });
  const [histForm, setHistForm] = useState({ diagnosis: "", treatment: "", prescription: "", notes: "", date: new Date().toISOString().split("T")[0] });
  const [saving, setSaving] = useState(false);

  // ── Live policy values used as fallback for bookings that predate the
  //    policy-snapshot feature (i.e. don't have depositPercentage on them). ──
  const liveDepositPct      = policy?.depositPercentage      ?? 0;
  const liveDeadlineHours   = policy?.downPaymentDeadlineHours ?? 24;

  const openPetRecord = async (booking: ProviderBooking) => {
    if (!booking.petId) { setPetRecordError("Pet ID not found for this booking."); setPetRecordBooking(booking); return; }
    setPetRecordBooking(booking); setPetRecordTab("vaccinations"); setVaxPage(1); setHistPage(1);
    setPetRecordLoading(true); setPetRecordError(null);
    try {
      const [vaxRes, histRes] = await Promise.all([
        fetch(`/api/pets/${booking.petId}/vaccinations`),
        fetch(`/api/pets/${booking.petId}/medical-history`),
      ]);
      const [vaxJson, histJson] = await Promise.all([vaxRes.json(), histRes.json()]);
      if (!vaxRes.ok) throw new Error(vaxJson.error || "Failed to load vaccinations.");
      if (!histRes.ok) throw new Error(histJson.error || "Failed to load medical history.");

      // Map snake_case DB columns → camelCase app types
      const vax: Vaccination[] = (vaxJson.data ?? []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        petId: r.pet_id as string,
        name: r.name as string,
        dateGiven: r.date_given as string,
        nextDueDate: r.next_due_date as string | undefined,
        vetName: r.vet_name as string | undefined,
        notes: r.notes as string | undefined,
        addedBy: (r.added_by ?? "owner") as "owner" | "provider",
        isVerified: (r.is_verified ?? false) as boolean,
        providerName: r.provider_name as string | undefined,
      }));
      const hist: MedicalHistory[] = (histJson.data ?? []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        petId: r.pet_id as string,
        diagnosis: r.diagnosis as string,
        treatment: r.treatment as string | undefined,
        prescription: r.prescription as string | undefined,
        notes: r.notes as string | undefined,
        date: r.date as string,
        addedBy: (r.added_by ?? "owner") as "owner" | "provider",
        providerName: r.provider_name as string | undefined,
      }));

      setPetVaccinations(vax);
      setPetHistory(hist);
    } catch (err) {
      setPetRecordError(err instanceof Error ? err.message : "Failed to load pet records.");
    } finally { setPetRecordLoading(false); }
  };

  const closePetRecord = () => {
    setPetRecordBooking(null); setPetVaccinations([]); setPetHistory([]);
    setPetRecordError(null); setAddingVax(false); setAddingHist(false);
    setVaxForm({ name: "", dateGiven: "", nextDueDate: "", notes: "" });
    setHistForm({ diagnosis: "", treatment: "", prescription: "", notes: "", date: new Date().toISOString().split("T")[0] });
  };

  const handleProviderAddVax = async () => {
    if (!petRecordBooking?.petId || !vaxForm.name || !vaxForm.dateGiven) return;
    setSaving(true);
    try {
      const created = await providerInsertVaccination(petRecordBooking.petId, user.id, user.name, {
        name: vaxForm.name, dateGiven: vaxForm.dateGiven,
        nextDueDate: vaxForm.nextDueDate || undefined, notes: vaxForm.notes || undefined,
      });
      setPetVaccinations((prev) => [created, ...prev]);
      setVaxForm({ name: "", dateGiven: "", nextDueDate: "", notes: "" }); setAddingVax(false);
    } catch (err) { setPetRecordError(err instanceof Error ? err.message : "Failed to save vaccination."); }
    finally { setSaving(false); }
  };

  const handleProviderAddHistory = async () => {
    if (!petRecordBooking?.petId || !histForm.diagnosis || !histForm.date) return;
    setSaving(true);
    try {
      const created = await providerInsertMedicalHistory(petRecordBooking.petId, user.name, {
        diagnosis: histForm.diagnosis, treatment: histForm.treatment || undefined,
        prescription: histForm.prescription || undefined, notes: histForm.notes || undefined, date: histForm.date,
      });
      setPetHistory((prev) => [created, ...prev]);
      setHistForm({ diagnosis: "", treatment: "", prescription: "", notes: "", date: new Date().toISOString().split("T")[0] }); setAddingHist(false);
    } catch (err) { setPetRecordError(err instanceof Error ? err.message : "Failed to save record."); }
    finally { setSaving(false); }
  };

  const filtered = useMemo(() => filterAndSort(bookings, filters), [bookings, filters]);

  const ROWS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pagedBookings = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);
  const openModal = (booking: ProviderBooking, a: ActionType) => { setSelectedBooking(booking); setAction(a); };
  const closeModal = () => { setSelectedBooking(null); setAction(null); };
  const handleApproveEdit   = (id: string) => updateBooking(id, { editRequestStatus: "approved" });
  const handleRejectEdit    = (id: string) => updateBooking(id, { editRequestStatus: "rejected" });
  const handleApproveCancel = (id: string) => updateBooking(id, { cancelRequestStatus: "approved", status: "cancelled" });
  const handleRejectCancel  = (id: string) => updateBooking(id, { cancelRequestStatus: "rejected" });
  const handleConfirmPayment = async (bookingId: string) => {
    setConfirmingPaymentId(bookingId); setPaymentError(null);
    try { await confirmPaymentReceived(bookingId); }
    catch { setPaymentError(bookingId); }
    finally { setConfirmingPaymentId(null); }
  };

  const counts = useMemo(() => ({
    all:         bookings.length,
    pending:     bookings.filter(b => ["pending","awaiting_downpayment","payment_submitted"].includes(b.status)).length,
    confirmed:   bookings.filter(b => b.status === "confirmed").length,
    completed:   bookings.filter(b => b.status === "completed").length,
    cancelled:   bookings.filter(b => b.status === "cancelled").length,
    declined:    bookings.filter(b => b.status === "declined").length,
    rescheduled: bookings.filter(b => b.status === "rescheduled").length,
  }), [bookings]);

  const pendingRequests    = useMemo(() => bookings.filter(b => b.editRequestStatus === "pending" || b.cancelRequestStatus === "pending").length, [bookings]);
  const pendingReschedules = useMemo(() => bookings.filter(b => b.status === "rescheduled" && b.rescheduleStatus === "pending").length, [bookings]);
  const awaitingPayment    = useMemo(() => bookings.filter(b => b.status === "awaiting_downpayment" || b.status === "payment_submitted").length, [bookings]);

  const STATUS_TABS = [
    { value: "all",         label: "All",         count: counts.all },
    { value: "pending",     label: "Pending",      count: counts.pending },
    { value: "confirmed",   label: "Confirmed",    count: counts.confirmed },
    { value: "rescheduled", label: "Rescheduled",  count: counts.rescheduled },
    { value: "completed",   label: "Completed",    count: counts.completed },
    { value: "cancelled",   label: "Cancelled",    count: counts.cancelled },
    { value: "declined",    label: "Declined",     count: counts.declined },
  ];

  const setFilter = (key: string, val: string) => { setFilters(f => ({ ...f, [key]: val })); setCurrentPage(1); };
  const hasActiveFilters = filters.month !== "all" || filters.serviceId !== "all" || filters.searchQuery !== "";
  const COL = ["3%", "23%", "15%", "14%", "11%", "14%", "20%"];

  const thStyle: React.CSSProperties = {
    padding: "0.65rem 1.25rem",
    textAlign: "left",
    fontSize: "0.7rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--fur-slate-mid)",
    whiteSpace: "nowrap",
    borderBottom: "1.5px solid var(--border)",
  };

  return (
    <ProviderLayout>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* ── Page Header ── */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingBottom: 16, marginBottom: 16, borderBottom: "1px solid var(--border)" }}>
          <div>
            <h1 style={{ fontSize: "1.65rem", fontWeight: 400, color: "var(--fur-slate)", marginBottom: 3 }}>
              Manage Bookings
            </h1>
            <p style={{ fontSize: "0.82rem", fontWeight: 400, color: "var(--fur-slate-light)" }}>
              {bookings.length} total booking{bookings.length !== 1 ? "s" : ""} · {counts.pending} pending · {counts.confirmed} confirmed
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => setFilters({ status: "all", month: "all", serviceId: "all", searchQuery: "" })}
              style={{ fontSize: "0.82rem", fontWeight: 400, padding: "5px 14px", borderRadius: 8, background: "var(--fur-mist)", color: "var(--fur-slate-mid)", border: "1px solid var(--border)", cursor: "pointer", fontFamily: "inherit" }}>
              Clear filters
            </button>
          )}
        </div>

        {/* ── Alert banners ── */}
        {(awaitingPayment > 0 || pendingRequests > 0 || pendingReschedules > 0) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
            {awaitingPayment > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, background: "#FFF7ED", border: "1px solid #FED7AA", color: "#9A3412", fontSize: "0.82rem", fontWeight: 400 }}>
                <PaymentIcon />
                <span><strong style={{ fontWeight: 600 }}>{awaitingPayment}</strong> booking{awaitingPayment > 1 ? "s" : ""} awaiting down payment verification</span>
              </div>
            )}
            {pendingRequests > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, background: "#FFFBEB", border: "1px solid #FCD34D", color: "#92400E", fontSize: "0.82rem", fontWeight: 400 }}>
                <BellIcon />
                <span><strong style={{ fontWeight: 600 }}>{pendingRequests}</strong> pending edit/cancel request{pendingRequests > 1 ? "s" : ""} from owner</span>
              </div>
            )}
            {pendingReschedules > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, background: "#F5F3FF", border: "1px solid #C4B5FD", color: "#5B21B6", fontSize: "0.82rem", fontWeight: 400 }}>
                <RescheduleIcon />
                <span><strong style={{ fontWeight: 600 }}>{pendingReschedules}</strong> reschedule proposal{pendingReschedules > 1 ? "s" : ""} awaiting owner response</span>
              </div>
            )}
          </div>
        )}

        {/* ── Status Tabs ── */}
        <div style={{ display: "flex", background: "white", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 14, overflowX: "auto" }}>
          {STATUS_TABS.map((tab) => {
            const active = filters.status === tab.value;
            return (
              <button key={tab.value}
                onClick={() => setFilter("status", tab.value)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "10px 16px", fontSize: "0.85rem", fontWeight: 400,
                  whiteSpace: "nowrap", flexShrink: 0, border: "none",
                  borderBottom: active ? "2.5px solid var(--fur-teal)" : "2.5px solid transparent",
                  background: active ? "var(--fur-teal-light)" : "white",
                  color: active ? "var(--fur-teal)" : "var(--fur-slate-light)",
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                }}>
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    padding: "1px 7px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 400,
                    background: tab.value === "pending" ? "#FEF3C7" : active ? "rgba(0,0,0,0.07)" : "var(--fur-mist)",
                    color: tab.value === "pending" ? "#92400E" : active ? "var(--fur-teal-dark)" : "var(--fur-slate-mid)",
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Filter Row ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ position: "relative", flex: "1 1 0", minWidth: 0 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--fur-slate-light)", display: "flex", pointerEvents: "none" }}>
              <SearchIcon />
            </span>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilter("searchQuery", e.target.value)}
              placeholder="Search by owner, pet, or service…"
              style={{
                width: "100%", height: 40, paddingLeft: 38, paddingRight: 12,
                fontSize: "0.85rem", fontFamily: "inherit", fontWeight: 400,
                border: "1.5px solid var(--border)", borderRadius: 10,
                background: "white", color: "var(--fur-slate)", outline: "none",
              }}
            />
          </div>
          <div style={{ position: "relative", flexShrink: 0, width: 148 }}>
            <select value={filters.month} onChange={(e) => setFilter("month", e.target.value)}
              style={{ height: 40, width: "100%", paddingLeft: 10, paddingRight: 32, fontSize: "0.85rem", fontFamily: "inherit", fontWeight: 400, border: "1.5px solid var(--border)", borderRadius: 10, background: "white", color: "#374151", outline: "none", cursor: "pointer", appearance: "none", WebkitAppearance: "none" }}>
              <option value="all">All months</option>
              {MONTHS.map((m, i) => <option key={i} value={String(i)}>{m}</option>)}
            </select>
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9CA3AF", display: "flex" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            </span>
          </div>
          <div style={{ position: "relative", flexShrink: 0, width: 170 }}>
            <select value={filters.serviceId} onChange={(e) => setFilter("serviceId", e.target.value)}
              style={{ height: 40, width: "100%", paddingLeft: 10, paddingRight: 32, fontSize: "0.85rem", fontFamily: "inherit", fontWeight: 400, border: "1.5px solid var(--border)", borderRadius: 10, background: "white", color: "#374151", outline: "none", cursor: "pointer", appearance: "none", WebkitAppearance: "none" }}>
              <option value="all">All services</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9CA3AF", display: "flex" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            </span>
          </div>
        </div>

        {hasActiveFilters && (
          <p style={{ fontSize: "0.82rem", fontWeight: 400, color: "var(--fur-slate-light)", marginBottom: 10 }}>
            Showing {filtered.length} of {bookings.length} bookings
          </p>
        )}

        {/* ── Table or empty ── */}
        {filtered.length === 0 ? (
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 14, padding: "4rem", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--fur-mist)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "var(--fur-slate-light)" }}>
              <InboxIcon />
            </div>
            <p style={{ fontWeight: 400, fontSize: "0.95rem", color: "var(--fur-slate)", marginBottom: 4 }}>No bookings found</p>
            <p style={{ fontSize: "0.82rem", fontWeight: 400, color: "var(--fur-slate-light)" }}>Try adjusting your filters or status tab</p>
          </div>
        ) : (
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                <colgroup>{COL.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
                <thead>
                  <tr style={{ background: "var(--fur-cream)" }}>
                    <th style={{ ...thStyle, padding: "0.65rem 0 0.65rem 1.25rem" }} />
                    {["Service / Pet", "Owner", "Date & Time", "Price", "Status", "Flags"].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedBookings.map((booking, idx) => {
                    const isExpanded         = expandedId === booking.id;
                    const isLast             = idx === pagedBookings.length - 1;
                    const effectiveDate      = booking.rescheduleDate || booking.date;
                    const effectiveTime      = booking.rescheduleTime || booking.time;
                    const isPaymentSubmitted = booking.status === "payment_submitted";
                    const isAwaitingPayment  = booking.status === "awaiting_downpayment";
                    const dpExpired          = isDownPaymentExpired(booking);
                    const dpHoursLeft        = isAwaitingPayment ? downPaymentHoursRemaining(booking) : null;
                    const emoji              = getServiceEmoji(booking.serviceName);

                    // Use snapshotted value; fall back to live policy for old bookings
                    const rowDepositPct = booking.depositPercentage ?? liveDepositPct;

                    const flags: { label: string; bg: string; color: string }[] = [];
                    if (booking.editRequestStatus === "pending")
                      flags.push({ label: "Edit Req", bg: "#FEF3C7", color: "#92400E" });
                    if (booking.cancelRequestStatus === "pending")
                      flags.push({ label: "Cancel Req", bg: "#FEE2E2", color: "#991B1B" });
                    if (isPaymentSubmitted)
                      flags.push({ label: "Payment", bg: "#DBEAFE", color: "#1E40AF" });
                    if (isAwaitingPayment && !dpExpired)
                      flags.push({ label: `${Math.ceil(dpHoursLeft ?? 0)}h left`, bg: "#FEF3C7", color: "#92400E" });
                    if (isAwaitingPayment && dpExpired)
                      flags.push({ label: "Overdue", bg: "#FEE2E2", color: "#991B1B" });
                    if (booking.status === "rescheduled" && booking.rescheduleStatus !== "confirmed" && booking.rescheduleStatus !== "declined")
                      flags.push({ label: "Awaiting Owner", bg: "#EDE9FE", color: "#5B21B6" });
                    if (booking.status === "completed" && typeof booking.rating === "number" && booking.rating > 0)
                      flags.push({ label: `${booking.rating.toFixed(1)} stars`, bg: "#FFFBEB", color: "#92400E" });

                    return (
                      <React.Fragment key={booking.id}>
                        <tr
                          onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                          style={{
                            borderBottom: isExpanded ? "none" : isLast ? "none" : "1px solid var(--border)",
                            background: "white", cursor: "pointer", transition: "background 0.1s",
                          }}
                          onMouseEnter={e => { if (!isExpanded) (e.currentTarget as HTMLTableRowElement).style.background = "var(--fur-cream)"; }}
                          onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLTableRowElement).style.background = "white"; }}
                        >
                          <td style={{ padding: "0.9rem 0 0.9rem 1.25rem", verticalAlign: "middle" }}>
                            <span style={{ color: isExpanded ? "var(--fur-teal)" : "var(--fur-slate-light)", display: "flex" }}>
                              {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                            </span>
                          </td>

                          {/* Service & Pet */}
                          <td style={{ padding: "0.9rem 1.25rem", verticalAlign: "middle", minWidth: 140 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: "var(--fur-cream)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.95rem" }}>
                                {emoji}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--fur-slate)", marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {booking.serviceName}
                                </p>
                                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--fur-slate-light)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {booking.petName} · {booking.petType}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Owner */}
                          <td style={{ padding: "0.9rem 1.25rem", verticalAlign: "middle", minWidth: 120 }}>
                            <p style={{ fontSize: "0.88rem", fontWeight: 400, color: "var(--fur-slate)", marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {booking.ownerName}
                            </p>
                            {booking.ownerEmail && (
                              <p style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--fur-slate-light)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {booking.ownerEmail}
                              </p>
                            )}
                          </td>

                          {/* Date & Time */}
                          <td style={{ padding: "0.9rem 1.25rem", verticalAlign: "middle", minWidth: 140, whiteSpace: "nowrap" }}>
                            <p style={{ fontSize: "0.88rem", fontWeight: 400, color: "var(--fur-slate)", marginBottom: 1 }}>
                              {new Date(effectiveDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                            <p style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--fur-slate-light)" }}>{effectiveTime}</p>
                          </td>

                          {/* Price — shows deposit breakdown using snapshotted pct */}
                          <td style={{ padding: "0.9rem 1.25rem", verticalAlign: "middle", minWidth: 90 }}>
                            <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--fur-slate)", marginBottom: 1 }}>
                              {formatCurrency(booking.price)}
                            </p>
                            {booking.requiresDownPayment && (
                              <p style={{ fontSize: "0.75rem", fontWeight: 400, color: booking.downPaymentPaid ? "#059669" : "var(--fur-slate-light)" }}>
                                {booking.downPaymentPaid
                                  ? "DP paid"
                                  : `DP (${rowDepositPct}%): ${formatCurrency(booking.price * (rowDepositPct / 100))}`
                                }
                              </p>
                            )}
                          </td>

                          {/* Status */}
                          <td style={{ padding: "0.9rem 1.25rem", verticalAlign: "middle", minWidth: 120 }}>
                            <StatusBadge status={booking.status} />
                          </td>

                          {/* Flags */}
                          <td style={{ padding: "0.9rem 1.25rem", verticalAlign: "middle", minWidth: 160 }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                              {flags.length === 0
                                ? <span style={{ fontSize: "0.88rem", fontWeight: 400, color: "var(--fur-slate-light)" }}>—</span>
                                : flags.map((f, fi) => (
                                  <span key={fi} style={{
                                    display: "inline-flex", alignItems: "center",
                                    background: f.bg, color: f.color,
                                    fontSize: "0.75rem", fontWeight: 400,
                                    padding: "3px 10px", borderRadius: 9999, whiteSpace: "nowrap",
                                  }}>
                                    {f.label}
                                  </span>
                                ))
                              }
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <BookingDetailPanel
                            booking={booking} isLast={isLast}
                            onOpenModal={openModal}
                            onConfirmPayment={handleConfirmPayment}
                            isConfirming={confirmingPaymentId === booking.id}
                            hasPayError={paymentError === booking.id}
                            onApproveEdit={handleApproveEdit} onRejectEdit={handleRejectEdit}
                            onApproveCancel={handleApproveCancel} onRejectCancel={handleRejectCancel}
                            onOpenPetRecord={openPetRecord}
                            fallbackDepositPct={liveDepositPct}
                            fallbackDeadlineHours={liveDeadlineHours}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
                <p style={{ fontSize: "0.78rem", color: "var(--fur-slate-light)", fontWeight: 400 }}>
                  Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--border)", background: "white", color: "var(--fur-slate-mid)", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce<(number | "...")[]>((acc, p, i, arr) => {
                      if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) => item === "..." ? (
                      <span key={`e-${idx}`} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", color: "var(--fur-slate-light)" }}>…</span>
                    ) : (
                      <button key={item} onClick={() => setCurrentPage(item as number)}
                        style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                          background: currentPage === item ? "var(--fur-teal)" : "white",
                          color: currentPage === item ? "white" : "var(--fur-slate-mid)",
                          borderColor: currentPage === item ? "var(--fur-teal)" : "var(--border)",
                        }}>
                        {item}
                      </button>
                    ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--border)", background: "white", color: "var(--fur-slate-mid)", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <BookingActionModal
        booking={selectedBooking} action={action}
        isOpen={!!selectedBooking && !!action} onClose={closeModal}
        onAccept={acceptBooking} onReject={rejectBooking}
        onReschedule={rescheduleBooking} onComplete={completeBooking}
      />

      {/* ── Pet Record Modal ── */}
      {petRecordBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" style={{ background: "rgba(26,35,50,0.45)", backdropFilter: "blur(4px)" }} onClick={closePetRecord} />
          <div className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: "90vh" }}>

            <div className="flex items-center gap-4 px-6 py-5 shrink-0" style={{ background: "linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
                style={{ background: "rgba(255,255,255,0.2)", color: "white", fontWeight: 400, backdropFilter: "blur(4px)" }}>
                {petRecordBooking.petName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 style={{ fontWeight: 400, fontSize: "1.1rem", color: "white" }}>{petRecordBooking.petName}</h2>
                <p style={{ fontSize: "0.82rem", fontWeight: 400, textTransform: "capitalize", color: "rgba(255,255,255,0.75)" }}>
                  {petRecordBooking.petType} · {petRecordBooking.petBreed} · Owner: {petRecordBooking.ownerName}
                </p>
              </div>
              <button onClick={closePetRecord} className="p-2 rounded-xl"
                style={{ color: "rgba(255,255,255,0.8)", background: "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="flex border-b shrink-0" style={{ background: "white", borderColor: "var(--border)" }}>
              {([
                { key: "vaccinations" as const, label: `Vaccinations (${petVaccinations.length})` },
                { key: "history" as const,       label: `Medical History (${petHistory.length})` },
              ]).map(({ key, label }) => (
                <button key={key} onClick={() => { setPetRecordTab(key); setVaxPage(1); setHistPage(1); }}
                  className="px-6 py-3 border-b-2 transition-colors"
                  style={{
                    fontSize: "0.85rem", fontWeight: 400, fontFamily: "inherit",
                    ...(petRecordTab === key
                      ? { borderColor: "#7C3AED", color: "#5B21B6" }
                      : { borderColor: "transparent", color: "var(--fur-slate-light)" })
                  }}>
                  {label}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto flex-1 p-6" style={{ background: "white" }}>
              {petRecordError && (
                <div className="mb-4 px-4 py-3 rounded-xl border"
                  style={{ background: "#FEF2F2", borderColor: "#FCA5A5", color: "#991B1B", fontSize: "0.82rem", fontWeight: 400 }}>
                  {petRecordError}
                </div>
              )}
              {petRecordLoading ? (
                <p style={{ fontSize: "0.82rem", fontWeight: 400, textAlign: "center", padding: "32px 0", color: "var(--fur-slate-light)" }}>Loading records...</p>
              ) : petRecordTab === "vaccinations" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p style={{ fontSize: "0.82rem", fontWeight: 400, color: "var(--fur-slate-light)" }}>{petVaccinations.length} record{petVaccinations.length !== 1 ? "s" : ""}</p>
                    <button onClick={() => { setAddingVax(!addingVax); setPetRecordError(null); }}
                      className="px-4 py-2 rounded-xl text-white transition-colors"
                      style={{ background: "#7C3AED", fontSize: "0.82rem", fontWeight: 400, fontFamily: "inherit" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#6D28D9")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#7C3AED")}>
                      {addingVax ? "Cancel" : "+ Add Vaccination"}
                    </button>
                  </div>
                  {addingVax && (
                    <div className="rounded-xl border p-4 space-y-3" style={{ background: "var(--fur-cream)", borderColor: "var(--border)" }}>
                      <p style={{ fontSize: "0.88rem", fontWeight: 400, color: "var(--fur-slate)" }}>New Vaccination Record (Verified)</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fur-slate-mid)" }}>Vaccine Name *</label>
                          <input type="text" value={vaxForm.name} onChange={e => setVaxForm({ ...vaxForm, name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-xl" style={{ borderColor: "var(--border)", color: "var(--fur-slate)", fontSize: "0.85rem", fontWeight: 400, fontFamily: "inherit" }} placeholder="e.g., Rabies" />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fur-slate-mid)" }}>Date Given *</label>
                          <input type="date" value={vaxForm.dateGiven} onChange={e => setVaxForm({ ...vaxForm, dateGiven: e.target.value })}
                            className="w-full px-3 py-2 border rounded-xl" style={{ borderColor: "var(--border)", color: "var(--fur-slate)", fontSize: "0.85rem", fontFamily: "inherit" }} />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fur-slate-mid)" }}>Next Due Date</label>
                          <input type="date" value={vaxForm.nextDueDate} onChange={e => setVaxForm({ ...vaxForm, nextDueDate: e.target.value })}
                            className="w-full px-3 py-2 border rounded-xl" style={{ borderColor: "var(--border)", color: "var(--fur-slate)", fontSize: "0.85rem", fontFamily: "inherit" }} />
                        </div>
                        <div className="col-span-2">
                          <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fur-slate-mid)" }}>Notes</label>
                          <input type="text" value={vaxForm.notes} onChange={e => setVaxForm({ ...vaxForm, notes: e.target.value })}
                            className="w-full px-3 py-2 border rounded-xl" style={{ borderColor: "var(--border)", color: "var(--fur-slate)", fontSize: "0.85rem", fontFamily: "inherit" }} placeholder="Any notes" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setAddingVax(false)} className="px-4 py-2 rounded-xl border"
                          style={{ borderColor: "var(--border)", color: "var(--fur-slate)", fontSize: "0.82rem", fontWeight: 400, fontFamily: "inherit" }}>Cancel</button>
                        <button onClick={handleProviderAddVax} disabled={!vaxForm.name || !vaxForm.dateGiven || saving}
                          className="px-4 py-2 rounded-xl text-white disabled:opacity-50"
                          style={{ background: "#7C3AED", fontSize: "0.82rem", fontWeight: 400, fontFamily: "inherit" }}>
                          {saving ? "Saving..." : "Save Record"}
                        </button>
                      </div>
                    </div>
                  )}
                  {petVaccinations.length === 0 && !addingVax
                    ? <p style={{ fontSize: "0.82rem", fontWeight: 400, textAlign: "center", padding: "24px 0", color: "var(--fur-slate-light)" }}>No vaccination records yet.</p>
                    : (() => {
                        const vaxTotalPages = Math.max(1, Math.ceil(petVaccinations.length / RECORDS_PER_PAGE));
                        const pagedVax = petVaccinations.slice((vaxPage - 1) * RECORDS_PER_PAGE, vaxPage * RECORDS_PER_PAGE);
                        return (
                          <>
                            <div className="space-y-2">
                              {pagedVax.map((v) => (
                                <div key={v.id} className="rounded-xl border p-4 flex items-start gap-3" style={{ background: "white", borderColor: "var(--border)" }}>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <p style={{ fontSize: "0.88rem", fontWeight: 400, color: "var(--fur-slate)" }}>{v.name}</p>
                                      {v.isVerified && (
                                        <span style={{ fontSize: "0.68rem", fontWeight: 400, padding: "2px 7px", borderRadius: 9999, display: "inline-flex", alignItems: "center", gap: 3, background: "#DBEAFE", color: "#1E40AF" }}>
                                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                          Verified
                                        </span>
                                      )}
                                    </div>
                                    <p style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--fur-slate-light)" }}>
                                      Given: {new Date(v.dateGiven).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                                      {v.nextDueDate && ` · Next: ${new Date(v.nextDueDate).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}`}
                                    </p>
                                    {v.providerName && <p style={{ fontSize: "0.75rem", fontWeight: 400, marginTop: 2, color: "var(--fur-slate-light)" }}>by {v.providerName}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                            {vaxTotalPages > 1 && (
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }}>
                                <p style={{ fontSize: "0.75rem", color: "var(--fur-slate-light)" }}>
                                  {(vaxPage - 1) * RECORDS_PER_PAGE + 1}–{Math.min(vaxPage * RECORDS_PER_PAGE, petVaccinations.length)} of {petVaccinations.length}
                                </p>
                                <div style={{ display: "flex", gap: 4 }}>
                                  <button onClick={() => setVaxPage(p => Math.max(1, p - 1))} disabled={vaxPage === 1}
                                    style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--border)", background: "white", cursor: vaxPage === 1 ? "not-allowed" : "pointer", opacity: vaxPage === 1 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                                  </button>
                                  <button onClick={() => setVaxPage(p => Math.min(vaxTotalPages, p + 1))} disabled={vaxPage === vaxTotalPages}
                                    style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--border)", background: "white", cursor: vaxPage === vaxTotalPages ? "not-allowed" : "pointer", opacity: vaxPage === vaxTotalPages ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()
                  }
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p style={{ fontSize: "0.82rem", fontWeight: 400, color: "var(--fur-slate-light)" }}>{petHistory.length} record{petHistory.length !== 1 ? "s" : ""}</p>
                    <button onClick={() => { setAddingHist(!addingHist); setPetRecordError(null); }}
                      className="px-4 py-2 rounded-xl text-white transition-colors"
                      style={{ background: "#7C3AED", fontSize: "0.82rem", fontWeight: 400, fontFamily: "inherit" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#6D28D9")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#7C3AED")}>
                      {addingHist ? "Cancel" : "+ Add Record"}
                    </button>
                  </div>
                  {addingHist && (
                    <div className="rounded-xl border p-4 space-y-3" style={{ background: "var(--fur-cream)", borderColor: "var(--border)" }}>
                      <p style={{ fontSize: "0.88rem", fontWeight: 400, color: "var(--fur-slate)" }}>New Medical Record</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fur-slate-mid)" }}>Diagnosis *</label>
                          <input type="text" value={histForm.diagnosis} onChange={e => setHistForm({ ...histForm, diagnosis: e.target.value })}
                            className="w-full px-3 py-2 border rounded-xl" style={{ borderColor: "var(--border)", color: "var(--fur-slate)", fontSize: "0.85rem", fontFamily: "inherit" }} placeholder="e.g., Skin Allergy" />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fur-slate-mid)" }}>Date *</label>
                          <input type="date" value={histForm.date} onChange={e => setHistForm({ ...histForm, date: e.target.value })}
                            className="w-full px-3 py-2 border rounded-xl" style={{ borderColor: "var(--border)", color: "var(--fur-slate)", fontSize: "0.85rem", fontFamily: "inherit" }} />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fur-slate-mid)" }}>Treatment</label>
                          <input type="text" value={histForm.treatment} onChange={e => setHistForm({ ...histForm, treatment: e.target.value })}
                            className="w-full px-3 py-2 border rounded-xl" style={{ borderColor: "var(--border)", color: "var(--fur-slate)", fontSize: "0.85rem", fontFamily: "inherit" }} placeholder="e.g., Antihistamine" />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fur-slate-mid)" }}>Prescription</label>
                          <input type="text" value={histForm.prescription} onChange={e => setHistForm({ ...histForm, prescription: e.target.value })}
                            className="w-full px-3 py-2 border rounded-xl" style={{ borderColor: "var(--border)", color: "var(--fur-slate)", fontSize: "0.85rem", fontFamily: "inherit" }} placeholder="e.g., Cetirizine 5mg" />
                        </div>
                        <div className="col-span-2">
                          <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fur-slate-mid)" }}>Notes</label>
                          <input type="text" value={histForm.notes} onChange={e => setHistForm({ ...histForm, notes: e.target.value })}
                            className="w-full px-3 py-2 border rounded-xl" style={{ borderColor: "var(--border)", color: "var(--fur-slate)", fontSize: "0.85rem", fontFamily: "inherit" }} placeholder="Any additional notes" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setAddingHist(false)} className="px-4 py-2 rounded-xl border"
                          style={{ borderColor: "var(--border)", color: "var(--fur-slate)", fontSize: "0.82rem", fontWeight: 400, fontFamily: "inherit" }}>Cancel</button>
                        <button onClick={handleProviderAddHistory} disabled={!histForm.diagnosis || !histForm.date || saving}
                          className="px-4 py-2 rounded-xl text-white disabled:opacity-50"
                          style={{ background: "#7C3AED", fontSize: "0.82rem", fontWeight: 400, fontFamily: "inherit" }}>
                          {saving ? "Saving..." : "Save Record"}
                        </button>
                      </div>
                    </div>
                  )}
                  {petHistory.length === 0 && !addingHist
                    ? <p style={{ fontSize: "0.82rem", fontWeight: 400, textAlign: "center", padding: "24px 0", color: "var(--fur-slate-light)" }}>No medical history yet.</p>
                    : (() => {
                        const histTotalPages = Math.max(1, Math.ceil(petHistory.length / RECORDS_PER_PAGE));
                        const pagedHist = petHistory.slice((histPage - 1) * RECORDS_PER_PAGE, histPage * RECORDS_PER_PAGE);
                        return (
                          <>
                            <div className="space-y-2">
                              {pagedHist.map((h) => (
                                <div key={h.id} className="rounded-xl border p-4" style={{ background: "white", borderColor: "var(--border)" }}>
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <p style={{ fontSize: "0.88rem", fontWeight: 400, color: "var(--fur-slate)" }}>{h.diagnosis}</p>
                                    {h.addedBy === "provider" && (
                                      <span style={{ fontSize: "0.68rem", fontWeight: 400, padding: "2px 7px", borderRadius: 9999, display: "inline-flex", alignItems: "center", gap: 3, background: "#DBEAFE", color: "#1E40AF" }}>
                                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                        Verified
                                      </span>
                                    )}
                                    <span style={{ fontSize: "0.75rem", fontWeight: 400, marginLeft: "auto", color: "var(--fur-slate-light)" }}>
                                      {new Date(h.date).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                                    </span>
                                  </div>
                                  {h.providerName && <p style={{ fontSize: "0.75rem", fontWeight: 400, marginBottom: 6, color: "var(--fur-slate-light)" }}>by {h.providerName}</p>}
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {h.treatment && <span style={{ fontSize: "0.75rem", fontWeight: 400, padding: "3px 8px", borderRadius: 8, background: "var(--fur-cream)", color: "var(--fur-slate)" }}>Treatment: {h.treatment}</span>}
                                    {h.prescription && <span style={{ fontSize: "0.75rem", fontWeight: 400, padding: "3px 8px", borderRadius: 8, background: "var(--fur-cream)", color: "var(--fur-slate)" }}>Rx: {h.prescription}</span>}
                                    {h.notes && <span style={{ fontSize: "0.75rem", fontWeight: 400, padding: "3px 8px", borderRadius: 8, background: "var(--fur-cream)", color: "var(--fur-slate)" }}>Notes: {h.notes}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                            {histTotalPages > 1 && (
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }}>
                                <p style={{ fontSize: "0.75rem", color: "var(--fur-slate-light)" }}>
                                  {(histPage - 1) * RECORDS_PER_PAGE + 1}–{Math.min(histPage * RECORDS_PER_PAGE, petHistory.length)} of {petHistory.length}
                                </p>
                                <div style={{ display: "flex", gap: 4 }}>
                                  <button onClick={() => setHistPage(p => Math.max(1, p - 1))} disabled={histPage === 1}
                                    style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--border)", background: "white", cursor: histPage === 1 ? "not-allowed" : "pointer", opacity: histPage === 1 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                                  </button>
                                  <button onClick={() => setHistPage(p => Math.min(histTotalPages, p + 1))} disabled={histPage === histTotalPages}
                                    style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--border)", background: "white", cursor: histPage === histTotalPages ? "not-allowed" : "pointer", opacity: histPage === histTotalPages ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ProviderLayout>
  );
};

export default ManageBookingsPage;