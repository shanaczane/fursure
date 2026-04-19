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
  providerUpdateVaccination,
  providerDeleteVaccination,
  providerUpdateMedicalHistory,
  providerDeleteMedicalHistory,
} from "@/app/lib/api";
import { storeVaxRecordedEvent } from "@/app/contexts/AppContext";
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
// ─── NEW: Syringe icon for "Record Vaccination" CTA ───────────────────────────
const SyringeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="21" x2="9" y2="15"/>
    <path d="M21 3l-3 3"/>
    <path d="M15 3l6 6"/>
    <path d="M9 9l6 6"/>
    <path d="M13 5l6 6"/>
    <path d="M5 13l-2 6 6-2z"/>
  </svg>
);
// ─── NEW: Shield-check icon for "Recorded" badge ──────────────────────────────
const ShieldCheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
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
  cancelled:            { bg: "#FEE2E2", color: "#991B1B" },
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
      fontSize: "0.78rem", fontWeight: 500,
      padding: "4px 10px", borderRadius: 9999,
      whiteSpace: "nowrap", letterSpacing: "0.01em",
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
};

/* ─── Shared text style tokens ───────────────────────────────────────────── */
const T = {
  primary: { fontSize: "0.875rem", fontWeight: 500, color: "var(--fur-slate)" } as React.CSSProperties,
  secondary: { fontSize: "0.75rem", fontWeight: 400, color: "var(--fur-slate-light)" } as React.CSSProperties,
  label: {
    fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase" as const,
    letterSpacing: "0.07em", color: "var(--fur-slate-mid)", marginBottom: 4,
  } as React.CSSProperties,
  body: { fontSize: "0.85rem", fontWeight: 400, color: "var(--fur-slate)", lineHeight: 1.6 } as React.CSSProperties,
  muted: { fontSize: "0.82rem", fontWeight: 400, fontStyle: "italic", color: "var(--fur-slate-light)" } as React.CSSProperties,
  amount: { fontSize: "0.9rem", fontWeight: 600, color: "var(--fur-slate)" } as React.CSSProperties,
  cellPrimary: { fontSize: "0.875rem", fontWeight: 700, color: "var(--fur-slate)" } as React.CSSProperties,
  cellSecondary: { fontSize: "0.75rem", fontWeight: 500, color: "var(--fur-slate-light)" } as React.CSSProperties,
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
    fontSize: "0.82rem", fontWeight: 500,
    cursor: "pointer", fontFamily: "inherit",
    whiteSpace: "nowrap" as const,
    display: "inline-flex", alignItems: "center", gap: 6,
    letterSpacing: "0.01em",
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

  const depositPct     = booking.depositPercentage     ?? fallbackDepositPct;
  const deadlineHours  = booking.downPaymentDeadlineHours ?? fallbackDeadlineHours;
  const deadlineLabel  = formatDeadlineHours(deadlineHours);
  const depositPctLabel = `${depositPct}%`;

  const downAmt   = booking.price * (depositPct / 100);
  const remaining = booking.price - downAmt;

  const cell: React.CSSProperties = {
    background: "white", border: "1px solid var(--border)",
    borderRadius: 10, padding: "10px 14px",
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
                  <p style={T.label}>Owner</p>
                  <p style={{ ...T.primary, marginBottom: 2 }}>{booking.ownerName}</p>
                  {booking.ownerEmail && <p style={T.secondary}>{booking.ownerEmail}</p>}
                  {booking.ownerPhone && <p style={T.secondary}>{booking.ownerPhone}</p>}
                </div>
                <div style={cell}>
                  <p style={T.label}>Pet</p>
                  <p style={{ ...T.primary, marginBottom: 2 }}>{booking.petName}</p>
                  <p style={{ ...T.secondary, textTransform: "capitalize" }}>{booking.petType} · {booking.petBreed}</p>
                </div>
              </div>

              {booking.notes && (
                <div style={cell}>
                  <p style={T.label}>Owner Notes</p>
                  <p style={T.body}>{booking.notes}</p>
                </div>
              )}

              {booking.providerNotes && (
                <div style={{ background: "var(--fur-teal-light)", border: "1px solid var(--fur-teal)", borderRadius: 10, padding: "10px 14px" }}>
                  <p style={{ ...T.label, color: "var(--fur-teal-dark)" }}>Your Notes</p>
                  <p style={T.body}>{booking.providerNotes}</p>
                </div>
              )}

              {isCompleted && typeof booking.rating === "number" && booking.rating > 0 && (
                <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #FDE68A" }}>
                  <div style={{ background: "#FFFBEB", borderBottom: "1px solid #FDE68A", padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ ...T.label, color: "#92400E", marginBottom: 0 }}>Client Review</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <StarRow rating={booking.rating} />
                      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#92400E" }}>{booking.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div style={{ background: "#FFFBEB", padding: "10px 14px" }}>
                    {booking.reviewComment
                      ? <p style={{ fontSize: "0.82rem", fontWeight: 400, color: "#92400E", fontStyle: "italic", lineHeight: 1.6 }}>"{booking.reviewComment}"</p>
                      : <p style={{ fontSize: "0.82rem", fontWeight: 400, color: "#B45309", fontStyle: "italic" }}>Rating only — no written comment.</p>
                    }
                    {booking.reviewDate && (
                      <p style={{ ...T.secondary, marginTop: 4, color: "#B45309" }}>
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
                    <p style={{ ...T.primary, color: "#5B21B6" }}>Reschedule proposal sent</p>
                  </div>
                  <p style={{ ...T.secondary, color: "#6D28D9" }}>
                    Proposed: {formatBookingDateTime(booking.rescheduleDate!, booking.rescheduleTime!)}
                  </p>
                  <p style={{ ...T.secondary, color: "#7C3AED", marginTop: 3 }}>Awaiting owner response</p>
                </div>
              )}

              {hasPendingEdit && (
                <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <EditApproveIcon />
                    <p style={{ ...T.primary, color: "#92400E" }}>Owner requested to edit this booking</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => onApproveEdit(booking.id)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", background: "#059669", color: "white", border: "none", borderRadius: 8, fontSize: "0.82rem", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                      <AcceptIcon /> Approve Edit
                    </button>
                    <button onClick={() => onRejectEdit(booking.id)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", background: "var(--fur-rose-light)", color: "var(--fur-rose)", border: "1px solid #FCA5A5", borderRadius: 8, fontSize: "0.82rem", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                      <RejectIcon /> Reject Edit
                    </button>
                  </div>
                </div>
              )}

              {hasPendingCancel && (
                <div style={{ background: "var(--fur-rose-light)", border: "1px solid #FCA5A5", borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <CancelIcon />
                    <p style={{ ...T.primary, color: "var(--fur-rose)" }}>Owner requested to cancel this booking</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => onApproveCancel(booking.id)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", background: "var(--fur-rose)", color: "white", border: "none", borderRadius: 8, fontSize: "0.82rem", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                      <AcceptIcon /> Approve Cancel
                    </button>
                    <button onClick={() => onRejectCancel(booking.id)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", background: "white", color: "var(--fur-slate-mid)", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.82rem", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
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
                    <p style={{ ...T.label, color: "white", marginBottom: 0 }}>Payment Summary</p>
                  </div>
                  <div style={{ background: "var(--fur-teal-light)", padding: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={T.body}>Total Service Fee</span>
                      <span style={T.amount}>{formatCurrency(booking.price)}</span>
                    </div>
                    <div style={{
                      background: booking.downPaymentPaid ? "#D1FAE5" : isPaymentSubmitted ? "#DBEAFE" : "#FEF3C7",
                      border: `1px solid ${booking.downPaymentPaid ? "#6EE7B7" : isPaymentSubmitted ? "#BFDBFE" : "#FCD34D"}`,
                      borderRadius: 8, padding: "10px 12px", marginBottom: 12,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <p style={{ fontSize: "0.85rem", fontWeight: 500, color: booking.downPaymentPaid ? "#065F46" : isPaymentSubmitted ? "#1E40AF" : "#92400E" }}>
                            Down Payment ({depositPctLabel})
                          </p>
                          {booking.downPaymentPaid && booking.downPaymentPaidAt && (
                            <p style={{ ...T.secondary, color: "#059669", marginTop: 2 }}>
                              Paid · {new Date(booking.downPaymentPaidAt).toLocaleString()}
                            </p>
                          )}
                          {!booking.downPaymentPaid && isPaymentSubmitted && (
                            <p style={{ ...T.secondary, color: "#1D4ED8", marginTop: 2 }}>Owner marked as paid — verify below</p>
                          )}
                          {!booking.downPaymentPaid && isAwaitingPayment && (
                            <>
                              <p style={{ ...T.secondary, color: dpExpired ? "var(--fur-rose)" : "#D97706", marginTop: 2 }}>
                                {dpExpired
                                  ? "Deadline passed"
                                  : `Due in ${Math.ceil(dpHoursLeft ?? 0)} hrs`}
                              </p>
                              <p style={{ ...T.secondary, marginTop: 1 }}>
                                Deadline: {deadlineLabel} from booking
                              </p>
                            </>
                          )}
                          {!booking.downPaymentPaid && isConfirmed && (
                            <p style={{ ...T.secondary, color: "#92400E", marginTop: 2 }}>Awaiting payment from owner</p>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0, marginLeft: 12 }}>
                          {booking.downPaymentPaid && (
                            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.72rem", fontWeight: 500, color: "#059669" }}>
                              <CheckIcon /> Paid
                            </span>
                          )}
                          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: booking.downPaymentPaid ? "#065F46" : isPaymentSubmitted ? "#1E40AF" : "#92400E" }}>
                            {formatCurrency(downAmt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed var(--fur-teal)", paddingTop: 12 }}>
                      <div>
                        <p style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--fur-teal-dark)" }}>Remaining Balance</p>
                        <p style={{ ...T.secondary, marginTop: 1 }}>
                          {booking.downPaymentPaid ? "Collect on appointment day" : "Full amount still pending"}
                        </p>
                      </div>
                      <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--fur-teal-dark)" }}>{formatCurrency(remaining)}</span>
                    </div>
                  </div>
                </div>
              )}

              {isPaymentSubmitted && (
                <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <ClockIcon />
                    <p style={{ ...T.primary, color: "#1E40AF" }}>
                      Owner marked down payment as paid — verify and confirm
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => onConfirmPayment(booking.id)} disabled={isConfirming}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 14px", background: "#059669", color: "white", border: "none", borderRadius: 8, fontSize: "0.82rem", fontWeight: 500, cursor: isConfirming ? "not-allowed" : "pointer", opacity: isConfirming ? 0.6 : 1, fontFamily: "inherit" }}>
                      <CheckIcon /> {isConfirming ? "Confirming…" : "Confirm Payment Received"}
                    </button>
                    <button onClick={() => onOpenModal(booking, "reject")} disabled={isConfirming}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 14px", background: "var(--fur-rose-light)", color: "var(--fur-rose)", border: "1px solid #FCA5A5", borderRadius: 8, fontSize: "0.82rem", fontWeight: 500, cursor: isConfirming ? "not-allowed" : "pointer", opacity: isConfirming ? 0.6 : 1, fontFamily: "inherit" }}>
                      <RejectIcon /> Not Received
                    </button>
                  </div>
                  {hasPayError && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem", fontWeight: 500, marginTop: 8, padding: "6px 10px", borderRadius: 6, background: "var(--fur-rose-light)", color: "var(--fur-rose)", border: "1px solid #FCA5A5" }}>
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
                    <p style={{ fontSize: "0.85rem", fontWeight: 500, color: dpExpired ? "var(--fur-rose)" : "#D97706" }}>
                      {dpExpired
                        ? "Payment deadline passed — booking will auto-decline"
                        : `Payment due in ${Math.ceil(dpHoursLeft ?? 0)} hours`}
                    </p>
                    {!dpExpired && (
                      <p style={{ ...T.secondary, color: "#92400E", marginTop: 3 }}>
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
                  <p style={T.muted}>No further actions</p>
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
  const [editingVaxId, setEditingVaxId] = useState<string | null>(null);
  const [editVaxForm, setEditVaxForm] = useState({ name: "", dateGiven: "", nextDueDate: "", notes: "" });
  const [editingHistId, setEditingHistId] = useState<string | null>(null);
  const [editHistForm, setEditHistForm] = useState({ diagnosis: "", treatment: "", prescription: "", notes: "", date: "" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── NEW: "Record Vaccination" inline form state for overdue entries ─────────
  // recordingVaxId = the existing vaccination record ID being updated as "given"
  const [recordingVaxId, setRecordingVaxId] = useState<string | null>(null);
  const [recordVaxForm, setRecordVaxForm] = useState({
    dateGiven: new Date().toISOString().split("T")[0],
    nextDueDate: "",
    notes: "",
  });
  const [recordVaxSuccess, setRecordVaxSuccess] = useState<string | null>(null); // vaccineName after success

  const liveDepositPct      = policy?.depositPercentage      ?? 0;
  const liveDeadlineHours   = policy?.downPaymentDeadlineHours ?? 24;

  const openPetRecord = async (booking: ProviderBooking) => {
    if (!booking.petId) { setPetRecordError("Pet ID not found for this booking."); setPetRecordBooking(booking); return; }
    setPetRecordBooking(booking); setPetRecordTab("vaccinations"); setVaxPage(1); setHistPage(1);
    setPetRecordLoading(true); setPetRecordError(null);
    setRecordingVaxId(null); setRecordVaxSuccess(null);
    try {
      const [vaxRes, histRes] = await Promise.all([
        fetch(`/api/pets/${booking.petId}/vaccinations`),
        fetch(`/api/pets/${booking.petId}/medical-history`),
      ]);
      const [vaxJson, histJson] = await Promise.all([vaxRes.json(), histRes.json()]);
      if (!vaxRes.ok) throw new Error(vaxJson.error || "Failed to load vaccinations.");
      if (!histRes.ok) throw new Error(histJson.error || "Failed to load medical history.");

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
    setEditingVaxId(null); setEditingHistId(null); setDeletingId(null);
    setRecordingVaxId(null); setRecordVaxSuccess(null);
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

  const handleProviderEditVax = async () => {
    if (!petRecordBooking?.petId || !editingVaxId || !editVaxForm.name || !editVaxForm.dateGiven) return;
    setSaving(true);
    try {
      await providerUpdateVaccination(petRecordBooking.petId, editingVaxId, {
        name: editVaxForm.name, dateGiven: editVaxForm.dateGiven,
        nextDueDate: editVaxForm.nextDueDate || undefined, notes: editVaxForm.notes || undefined,
      });
      setPetVaccinations(prev => prev.map(v => v.id === editingVaxId
        ? { ...v, name: editVaxForm.name, dateGiven: editVaxForm.dateGiven, nextDueDate: editVaxForm.nextDueDate || undefined, notes: editVaxForm.notes || undefined }
        : v));
      setEditingVaxId(null);
    } catch (err) { setPetRecordError(err instanceof Error ? err.message : "Failed to update vaccination."); }
    finally { setSaving(false); }
  };

  const handleProviderDeleteVax = async (recordId: string) => {
    if (!petRecordBooking?.petId) return;
    setSaving(true);
    try {
      await providerDeleteVaccination(petRecordBooking.petId, recordId);
      setPetVaccinations(prev => prev.filter(v => v.id !== recordId));
      setDeletingId(null);
    } catch (err) { setPetRecordError(err instanceof Error ? err.message : "Failed to delete vaccination."); }
    finally { setSaving(false); }
  };

  const handleProviderEditHist = async () => {
    if (!petRecordBooking?.petId || !editingHistId || !editHistForm.diagnosis || !editHistForm.date) return;
    setSaving(true);
    try {
      await providerUpdateMedicalHistory(petRecordBooking.petId, editingHistId, {
        diagnosis: editHistForm.diagnosis, treatment: editHistForm.treatment || undefined,
        prescription: editHistForm.prescription || undefined, notes: editHistForm.notes || undefined, date: editHistForm.date,
      });
      setPetHistory(prev => prev.map(h => h.id === editingHistId
        ? { ...h, diagnosis: editHistForm.diagnosis, treatment: editHistForm.treatment || undefined, prescription: editHistForm.prescription || undefined, notes: editHistForm.notes || undefined, date: editHistForm.date }
        : h));
      setEditingHistId(null);
    } catch (err) { setPetRecordError(err instanceof Error ? err.message : "Failed to update record."); }
    finally { setSaving(false); }
  };

  const handleProviderDeleteHist = async (recordId: string) => {
    if (!petRecordBooking?.petId) return;
    setSaving(true);
    try {
      await providerDeleteMedicalHistory(petRecordBooking.petId, recordId);
      setPetHistory(prev => prev.filter(h => h.id !== recordId));
      setDeletingId(null);
    } catch (err) { setPetRecordError(err instanceof Error ? err.message : "Failed to delete record."); }
    finally { setSaving(false); }
  };

  // ── NEW: Handle "Record Vaccination" for an overdue entry ────────────────────
  // Strategy: update the existing overdue record's dateGiven + nextDueDate +
  // mark it verified by the provider, then persist a localStorage event so
  // the owner's notification panel reflects the change immediately.
  const handleRecordOverdueVaccination = async (v: Vaccination) => {
    if (!petRecordBooking?.petId || !recordVaxForm.dateGiven) return;
    setSaving(true);
    setPetRecordError(null);
    try {
      await providerUpdateVaccination(petRecordBooking.petId, v.id, {
        name: v.name,
        dateGiven: recordVaxForm.dateGiven,
        nextDueDate: recordVaxForm.nextDueDate || undefined,
        notes: recordVaxForm.notes || undefined,
      });

      // Update local state: mark verified, update dates
      setPetVaccinations(prev => prev.map(existing =>
        existing.id === v.id
          ? {
              ...existing,
              dateGiven: recordVaxForm.dateGiven,
              nextDueDate: recordVaxForm.nextDueDate || undefined,
              notes: recordVaxForm.notes || undefined,
              isVerified: true,
              addedBy: "provider" as const,
              providerName: user.name,
            }
          : existing
      ));

      // Persist notification event for the owner's dashboard
      storeVaxRecordedEvent({
        petId: petRecordBooking.petId,
        petName: petRecordBooking.petName,
        vaccineName: v.name,
        dateGiven: recordVaxForm.dateGiven,
        nextDueDate: recordVaxForm.nextDueDate || undefined,
        providerName: user.name,
        recordedAt: new Date().toISOString(),
      });

      setRecordVaxSuccess(v.name);
      setRecordingVaxId(null);
      setRecordVaxForm({ dateGiven: new Date().toISOString().split("T")[0], nextDueDate: "", notes: "" });
    } catch (err) {
      setPetRecordError(err instanceof Error ? err.message : "Failed to record vaccination.");
    } finally {
      setSaving(false);
    }
  };

  // Helper: is a vaccination considered overdue?
  const isVaxOverdue = (v: Vaccination) => {
    if (!v.nextDueDate) return false;
    return new Date(v.nextDueDate) < new Date();
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
    fontWeight: 700,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: "var(--fur-slate-mid)",
    whiteSpace: "nowrap",
    borderBottom: "1.5px solid var(--border)",
  };

  /* ── Shared form input style ── */
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    border: "1.5px solid var(--border)",
    borderRadius: 10,
    fontSize: "0.85rem",
    fontFamily: "inherit",
    fontWeight: 400,
    color: "var(--fur-slate)",
    outline: "none",
    background: "white",
  };

  const formLabelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.68rem",
    fontWeight: 700,
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    color: "var(--fur-slate-mid)",
  };

  return (
    <ProviderLayout>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* ── Page Header ── */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingBottom: 16, marginBottom: 16, borderBottom: "1px solid var(--border)" }}>
          <div>
            <h1 style={{ fontSize: "1.65rem", fontWeight: 700, color: "var(--fur-slate)", marginBottom: 4, letterSpacing: "-0.02em" }}>
              Manage Bookings
            </h1>
            <p style={T.secondary}>
              {bookings.length} total booking{bookings.length !== 1 ? "s" : ""} · {counts.pending} pending · {counts.confirmed} confirmed
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => setFilters({ status: "all", month: "all", serviceId: "all", searchQuery: "" })}
              style={{ fontSize: "0.82rem", fontWeight: 500, padding: "5px 14px", borderRadius: 8, background: "var(--fur-mist)", color: "var(--fur-slate-mid)", border: "1px solid var(--border)", cursor: "pointer", fontFamily: "inherit" }}>
              Clear filters
            </button>
          )}
        </div>

        {/* ── Alert banners ── */}
        {(awaitingPayment > 0 || pendingRequests > 0 || pendingReschedules > 0) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
            {awaitingPayment > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, background: "#FFF7ED", border: "1px solid #FED7AA", color: "#9A3412", fontSize: "0.82rem", fontWeight: 500 }}>
                <PaymentIcon />
                <span><strong style={{ fontWeight: 700 }}>{awaitingPayment}</strong> booking{awaitingPayment > 1 ? "s" : ""} awaiting down payment verification</span>
              </div>
            )}
            {pendingRequests > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, background: "#FFFBEB", border: "1px solid #FCD34D", color: "#92400E", fontSize: "0.82rem", fontWeight: 500 }}>
                <BellIcon />
                <span><strong style={{ fontWeight: 700 }}>{pendingRequests}</strong> pending edit/cancel request{pendingRequests > 1 ? "s" : ""} from owner</span>
              </div>
            )}
            {pendingReschedules > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, background: "#F5F3FF", border: "1px solid #C4B5FD", color: "#5B21B6", fontSize: "0.82rem", fontWeight: 500 }}>
                <RescheduleIcon />
                <span><strong style={{ fontWeight: 700 }}>{pendingReschedules}</strong> reschedule proposal{pendingReschedules > 1 ? "s" : ""} awaiting owner response</span>
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
                  padding: "10px 16px", fontSize: "0.85rem", fontWeight: active ? 600 : 500,
                  whiteSpace: "nowrap", flexShrink: 0, border: "none",
                  borderBottom: active ? "2.5px solid var(--fur-teal)" : "2.5px solid transparent",
                  background: active ? "var(--fur-teal-light)" : "white",
                  color: active ? "var(--fur-teal)" : "var(--fur-slate-light)",
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                }}>
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    padding: "1px 7px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600,
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
          <p style={{ ...T.secondary, marginBottom: 10 }}>
            Showing {filtered.length} of {bookings.length} bookings
          </p>
        )}

        {/* ── Table or empty ── */}
        {filtered.length === 0 ? (
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 14, padding: "4rem", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--fur-mist)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "var(--fur-slate-light)" }}>
              <InboxIcon />
            </div>
            <p style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--fur-slate)", marginBottom: 4 }}>No bookings found</p>
            <p style={T.secondary}>Try adjusting your filters or status tab</p>
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

                          <td style={{ padding: "0.9rem 1.25rem", verticalAlign: "middle", minWidth: 140 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: "var(--fur-cream)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.95rem" }}>
                                {emoji}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <p style={{ ...T.cellPrimary, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {booking.serviceName}
                                </p>
                                <p style={{ ...T.cellSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {booking.petName} · {booking.petType}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: "0.9rem 1.25rem", verticalAlign: "middle", minWidth: 120 }}>
                            <p style={{ ...T.primary, marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {booking.ownerName}
                            </p>
                            {booking.ownerEmail && (
                              <p style={{ ...T.secondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {booking.ownerEmail}
                              </p>
                            )}
                          </td>

                          <td style={{ padding: "0.9rem 1.25rem", verticalAlign: "middle", minWidth: 140, whiteSpace: "nowrap" }}>
                            <p style={{ ...T.primary, marginBottom: 1 }}>
                              {new Date(effectiveDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                            <p style={T.secondary}>{effectiveTime}</p>
                          </td>

                          <td style={{ padding: "0.9rem 1.25rem", verticalAlign: "middle", minWidth: 90 }}>
                            <p style={{ ...T.cellPrimary, marginBottom: 2 }}>
                              {formatCurrency(booking.price)}
                            </p>
                            {booking.requiresDownPayment && (
                              <p style={{ ...T.cellSecondary, color: booking.downPaymentPaid ? "#059669" : "var(--fur-slate-light)" }}>
                                {booking.downPaymentPaid
                                  ? "DP paid ✓"
                                  : `DP (${rowDepositPct}%): ${formatCurrency(booking.price * (rowDepositPct / 100))}`
                                }
                              </p>
                            )}
                          </td>

                          <td style={{ padding: "0.9rem 1.25rem", verticalAlign: "middle", minWidth: 120 }}>
                            <StatusBadge status={booking.status} />
                          </td>

                          <td style={{ padding: "0.9rem 1.25rem", verticalAlign: "middle", minWidth: 160 }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                              {flags.length === 0
                                ? <span style={T.secondary}>—</span>
                                : flags.map((f, fi) => (
                                  <span key={fi} style={{
                                    display: "inline-flex", alignItems: "center",
                                    background: f.bg, color: f.color,
                                    fontSize: "0.72rem", fontWeight: 600,
                                    padding: "3px 9px", borderRadius: 9999, whiteSpace: "nowrap",
                                    letterSpacing: "0.01em",
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
                <p style={T.secondary}>
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

            {/* Modal header */}
            <div className="flex items-center gap-4 px-6 py-5 shrink-0" style={{ background: "linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
                style={{ background: "rgba(255,255,255,0.2)", color: "white", fontWeight: 700, backdropFilter: "blur(4px)" }}>
                {petRecordBooking.petName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "white", letterSpacing: "-0.01em" }}>{petRecordBooking.petName}</h2>
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

            {/* Tabs */}
            <div className="flex border-b shrink-0" style={{ background: "white", borderColor: "var(--border)" }}>
              {([
                { key: "vaccinations" as const, label: `Vaccinations (${petVaccinations.length})` },
                { key: "history" as const,       label: `Medical History (${petHistory.length})` },
              ]).map(({ key, label }) => (
                <button key={key} onClick={() => { setPetRecordTab(key); setVaxPage(1); setHistPage(1); }}
                  className="px-6 py-3 border-b-2 transition-colors"
                  style={{
                    fontSize: "0.85rem", fontWeight: petRecordTab === key ? 600 : 500, fontFamily: "inherit",
                    ...(petRecordTab === key
                      ? { borderColor: "#7C3AED", color: "#5B21B6" }
                      : { borderColor: "transparent", color: "var(--fur-slate-light)" })
                  }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 p-6" style={{ background: "white" }}>
              {petRecordError && (
                <div className="mb-4 px-4 py-3 rounded-xl border"
                  style={{ background: "#FEF2F2", borderColor: "#FCA5A5", color: "#991B1B", fontSize: "0.82rem", fontWeight: 500 }}>
                  {petRecordError}
                </div>
              )}

              {/* ── Success banner after recording a vaccination ── */}
              {recordVaxSuccess && (
                <div className="mb-4 px-4 py-3 rounded-xl border flex items-center gap-3"
                  style={{ background: "#F0FDF4", borderColor: "#6EE7B7", color: "#065F46", fontSize: "0.82rem", fontWeight: 500 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ShieldCheckIcon />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, marginBottom: 1 }}>Vaccination recorded!</p>
                    <p style={{ fontWeight: 400 }}>
                      <strong>{recordVaxSuccess}</strong> has been marked as administered.
                      The pet owner will be notified.
                    </p>
                  </div>
                  <button onClick={() => setRecordVaxSuccess(null)} style={{ marginLeft: "auto", color: "#059669", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              )}

              {petRecordLoading ? (
                <p style={{ ...T.secondary, textAlign: "center", padding: "32px 0" }}>Loading records...</p>
              ) : petRecordTab === "vaccinations" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p style={T.secondary}>{petVaccinations.length} record{petVaccinations.length !== 1 ? "s" : ""}</p>
                    <button onClick={() => { setAddingVax(!addingVax); setPetRecordError(null); }}
                      className="px-4 py-2 rounded-xl text-white transition-colors"
                      style={{ background: "#7C3AED", fontSize: "0.82rem", fontWeight: 600, fontFamily: "inherit" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#6D28D9")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#7C3AED")}>
                      {addingVax ? "Cancel" : "+ Add Vaccination"}
                    </button>
                  </div>
                  {addingVax && (
                    <div className="rounded-xl border p-4 space-y-3" style={{ background: "var(--fur-cream)", borderColor: "var(--border)" }}>
                      <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--fur-slate)" }}>New Vaccination Record <span style={{ fontWeight: 400, color: "var(--fur-slate-light)" }}>(Verified)</span></p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label style={formLabelStyle}>Vaccine Name *</label>
                          <input type="text" value={vaxForm.name} onChange={e => setVaxForm({ ...vaxForm, name: e.target.value })}
                            style={inputStyle} placeholder="e.g., Rabies" />
                        </div>
                        <div>
                          <label style={formLabelStyle}>Date Given *</label>
                          <input type="date" value={vaxForm.dateGiven} onChange={e => setVaxForm({ ...vaxForm, dateGiven: e.target.value })}
                            style={inputStyle} />
                        </div>
                        <div>
                          <label style={formLabelStyle}>Next Due Date</label>
                          <input type="date" value={vaxForm.nextDueDate} onChange={e => setVaxForm({ ...vaxForm, nextDueDate: e.target.value })}
                            style={inputStyle} />
                        </div>
                        <div className="col-span-2">
                          <label style={formLabelStyle}>Notes</label>
                          <input type="text" value={vaxForm.notes} onChange={e => setVaxForm({ ...vaxForm, notes: e.target.value })}
                            style={inputStyle} placeholder="Any notes" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setAddingVax(false)}
                          style={{ padding: "6px 14px", borderRadius: 9, border: "1.5px solid var(--border)", background: "white", color: "var(--fur-slate)", fontSize: "0.82rem", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                        <button onClick={handleProviderAddVax} disabled={!vaxForm.name || !vaxForm.dateGiven || saving}
                          style={{ padding: "6px 14px", borderRadius: 9, background: "#7C3AED", color: "white", border: "none", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: (!vaxForm.name || !vaxForm.dateGiven || saving) ? 0.5 : 1 }}>
                          {saving ? "Saving..." : "Save Record"}
                        </button>
                      </div>
                    </div>
                  )}
                  {petVaccinations.length === 0 && !addingVax
                    ? <p style={{ ...T.secondary, textAlign: "center", padding: "24px 0" }}>No vaccination records yet.</p>
                    : (() => {
                        const vaxTotalPages = Math.max(1, Math.ceil(petVaccinations.length / RECORDS_PER_PAGE));
                        const pagedVax = petVaccinations.slice((vaxPage - 1) * RECORDS_PER_PAGE, vaxPage * RECORDS_PER_PAGE);
                        return (
                          <>
                            <div className="space-y-2">
                              {pagedVax.map((v) => {
                                const overdue = isVaxOverdue(v) && !v.isVerified;
                                const alreadyRecorded = v.isVerified && v.addedBy === "provider";
                                const isRecordingThis = recordingVaxId === v.id;

                                return (
                                  <div key={v.id} className="rounded-xl border" style={{
                                    background: overdue ? "#FFF5F5" : "white",
                                    borderColor: overdue ? "#FCA5A5" : "var(--border)",
                                    // highlight the entry being recorded
                                    ...(isRecordingThis ? { borderColor: "#7C3AED", background: "#F5F3FF" } : {}),
                                  }}>
                                    {editingVaxId === v.id ? (
                                      <div className="p-4 space-y-3">
                                        <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--fur-slate)" }}>Edit Vaccination Record</p>
                                        <div className="grid grid-cols-2 gap-3">
                                          <div className="col-span-2">
                                            <label style={formLabelStyle}>Vaccine Name *</label>
                                            <input type="text" value={editVaxForm.name} onChange={e => setEditVaxForm({ ...editVaxForm, name: e.target.value })} style={inputStyle} />
                                          </div>
                                          <div>
                                            <label style={formLabelStyle}>Date Given *</label>
                                            <input type="date" value={editVaxForm.dateGiven} onChange={e => setEditVaxForm({ ...editVaxForm, dateGiven: e.target.value })} style={inputStyle} />
                                          </div>
                                          <div>
                                            <label style={formLabelStyle}>Next Due Date</label>
                                            <input type="date" value={editVaxForm.nextDueDate} onChange={e => setEditVaxForm({ ...editVaxForm, nextDueDate: e.target.value })} style={inputStyle} />
                                          </div>
                                          <div className="col-span-2">
                                            <label style={formLabelStyle}>Notes</label>
                                            <input type="text" value={editVaxForm.notes} onChange={e => setEditVaxForm({ ...editVaxForm, notes: e.target.value })} style={inputStyle} />
                                          </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                          <button onClick={() => setEditingVaxId(null)}
                                            style={{ padding: "6px 14px", borderRadius: 9, border: "1.5px solid var(--border)", background: "white", color: "var(--fur-slate)", fontSize: "0.82rem", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                                          <button onClick={handleProviderEditVax} disabled={!editVaxForm.name || !editVaxForm.dateGiven || saving}
                                            style={{ padding: "6px 14px", borderRadius: 9, background: "#7C3AED", color: "white", border: "none", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: (!editVaxForm.name || !editVaxForm.dateGiven || saving) ? 0.5 : 1 }}>
                                            {saving ? "Saving..." : "Save Changes"}
                                          </button>
                                        </div>
                                      </div>
                                    ) : deletingId === v.id ? (
                                      <div className="p-4 flex items-center justify-between gap-3">
                                        <p style={{ fontSize: "0.85rem", fontWeight: 400, color: "var(--fur-slate)" }}>Delete <strong style={{ fontWeight: 600 }}>{v.name}</strong>? This cannot be undone.</p>
                                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                          <button onClick={() => setDeletingId(null)}
                                            style={{ padding: "5px 12px", borderRadius: 8, border: "1.5px solid var(--border)", background: "white", color: "var(--fur-slate)", fontSize: "0.78rem", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                                          <button onClick={() => handleProviderDeleteVax(v.id)} disabled={saving}
                                            style={{ padding: "5px 12px", borderRadius: 8, background: "#DC2626", color: "white", border: "none", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: saving ? 0.5 : 1 }}>
                                            {saving ? "Deleting..." : "Delete"}
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="p-4">
                                        {/* ── Row header ── */}
                                        <div className="flex items-start gap-3">
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                              <p style={{ fontSize: "0.88rem", fontWeight: 600, color: overdue ? "#991B1B" : "var(--fur-slate)" }}>{v.name}</p>

                                              {/* Overdue badge */}
                                              {overdue && (
                                                <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 7px", borderRadius: 9999, display: "inline-flex", alignItems: "center", gap: 3, background: "#FEE2E2", color: "#991B1B" }}>
                                                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                                  Overdue
                                                </span>
                                              )}

                                              {/* Verified / recorded badge */}
                                              {v.isVerified && (
                                                <span style={{ fontSize: "0.68rem", fontWeight: 600, padding: "2px 7px", borderRadius: 9999, display: "inline-flex", alignItems: "center", gap: 3, background: "#D1FAE5", color: "#065F46" }}>
                                                  <ShieldCheckIcon /> Recorded by provider
                                                </span>
                                              )}
                                            </div>
                                            <p style={T.secondary}>
                                              Given: {new Date(v.dateGiven).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                                              {v.nextDueDate && ` · Next: ${new Date(v.nextDueDate).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}`}
                                            </p>
                                            {v.providerName && <p style={{ ...T.secondary, marginTop: 2 }}>by {v.providerName}</p>}
                                          </div>

                                          {/* Action buttons */}
                                          <div style={{ display: "flex", gap: 4, flexShrink: 0, alignItems: "flex-start" }}>
                                            {/* ── NEW: "Record Vaccination" CTA for overdue entries ── */}
                                            {overdue && !isRecordingThis && (
                                              <button
                                                onClick={() => {
                                                  setRecordingVaxId(v.id);
                                                  setRecordVaxForm({ dateGiven: new Date().toISOString().split("T")[0], nextDueDate: "", notes: "" });
                                                  setAddingVax(false);
                                                  setPetRecordError(null);
                                                }}
                                                style={{
                                                  display: "inline-flex", alignItems: "center", gap: 5,
                                                  padding: "5px 10px", borderRadius: 8,
                                                  background: "#059669", color: "white",
                                                  border: "none", fontSize: "0.75rem", fontWeight: 600,
                                                  cursor: "pointer", fontFamily: "inherit",
                                                  whiteSpace: "nowrap",
                                                }}
                                                title="Record this vaccination as administered today"
                                              >
                                                <SyringeIcon /> Record Vaccination
                                              </button>
                                            )}
                                            {/* ── Cancel "Record" inline form ── */}
                                            {isRecordingThis && (
                                              <button
                                                onClick={() => setRecordingVaxId(null)}
                                                style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid var(--border)", background: "white", color: "var(--fur-slate)", fontSize: "0.75rem", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
                                              >
                                                Cancel
                                              </button>
                                            )}
                                            {/* Edit / Delete only for provider-added records not currently in record-mode */}
                                            {v.addedBy === "provider" && !isRecordingThis && (
                                              <>
                                                <button onClick={() => { setEditingVaxId(v.id); setEditVaxForm({ name: v.name, dateGiven: v.dateGiven, nextDueDate: v.nextDueDate ?? "", notes: v.notes ?? "" }); }}
                                                  title="Edit" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--border)", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fur-slate-mid)" }}>
                                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                </button>
                                                <button onClick={() => setDeletingId(v.id)}
                                                  title="Delete" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #FCA5A5", background: "#FEF2F2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#DC2626" }}>
                                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        </div>

                                        {/* ── NEW: Inline "Record Vaccination" form for overdue entries ── */}
                                        {isRecordingThis && (
                                          <div style={{
                                            marginTop: 12, padding: "12px 14px",
                                            background: "#F5F3FF", borderRadius: 10,
                                            border: "1px solid #C4B5FD",
                                          }}>
                                            <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#5B21B6", marginBottom: 10 }}>
                                              Record <strong>{v.name}</strong> as administered
                                            </p>
                                            <div className="grid grid-cols-2 gap-3">
                                              <div>
                                                <label style={{ ...formLabelStyle, color: "#5B21B6" }}>Date Administered *</label>
                                                <input
                                                  type="date"
                                                  value={recordVaxForm.dateGiven}
                                                  onChange={e => setRecordVaxForm({ ...recordVaxForm, dateGiven: e.target.value })}
                                                  style={inputStyle}
                                                />
                                              </div>
                                              <div>
                                                <label style={{ ...formLabelStyle, color: "#5B21B6" }}>Next Due Date</label>
                                                <input
                                                  type="date"
                                                  value={recordVaxForm.nextDueDate}
                                                  onChange={e => setRecordVaxForm({ ...recordVaxForm, nextDueDate: e.target.value })}
                                                  style={inputStyle}
                                                />
                                              </div>
                                              <div className="col-span-2">
                                                <label style={{ ...formLabelStyle, color: "#5B21B6" }}>Notes (optional)</label>
                                                <input
                                                  type="text"
                                                  value={recordVaxForm.notes}
                                                  onChange={e => setRecordVaxForm({ ...recordVaxForm, notes: e.target.value })}
                                                  style={inputStyle}
                                                  placeholder="e.g., administered at clinic, lot number, etc."
                                                />
                                              </div>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                                              <button
                                                onClick={() => setRecordingVaxId(null)}
                                                style={{ padding: "6px 14px", borderRadius: 9, border: "1.5px solid #C4B5FD", background: "white", color: "#5B21B6", fontSize: "0.82rem", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
                                              >
                                                Cancel
                                              </button>
                                              <button
                                                onClick={() => handleRecordOverdueVaccination(v)}
                                                disabled={!recordVaxForm.dateGiven || saving}
                                                style={{
                                                  padding: "6px 14px", borderRadius: 9,
                                                  background: "#059669", color: "white",
                                                  border: "none", fontSize: "0.82rem", fontWeight: 600,
                                                  cursor: (!recordVaxForm.dateGiven || saving) ? "not-allowed" : "pointer",
                                                  fontFamily: "inherit",
                                                  opacity: (!recordVaxForm.dateGiven || saving) ? 0.5 : 1,
                                                  display: "inline-flex", alignItems: "center", gap: 5,
                                                }}
                                              >
                                                <ShieldCheckIcon />
                                                {saving ? "Saving..." : "Confirm & Notify Owner"}
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {vaxTotalPages > 1 && (
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }}>
                                <p style={T.secondary}>
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
                /* ─── Medical History Tab ─── */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p style={T.secondary}>{petHistory.length} record{petHistory.length !== 1 ? "s" : ""}</p>
                    <button onClick={() => { setAddingHist(!addingHist); setPetRecordError(null); }}
                      className="px-4 py-2 rounded-xl text-white transition-colors"
                      style={{ background: "#7C3AED", fontSize: "0.82rem", fontWeight: 600, fontFamily: "inherit" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#6D28D9")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#7C3AED")}>
                      {addingHist ? "Cancel" : "+ Add Record"}
                    </button>
                  </div>
                  {addingHist && (
                    <div className="rounded-xl border p-4 space-y-3" style={{ background: "var(--fur-cream)", borderColor: "var(--border)" }}>
                      <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--fur-slate)" }}>New Medical Record</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label style={formLabelStyle}>Diagnosis *</label>
                          <input type="text" value={histForm.diagnosis} onChange={e => setHistForm({ ...histForm, diagnosis: e.target.value })}
                            style={inputStyle} placeholder="e.g., Skin Allergy" />
                        </div>
                        <div>
                          <label style={formLabelStyle}>Date *</label>
                          <input type="date" value={histForm.date} onChange={e => setHistForm({ ...histForm, date: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                          <label style={formLabelStyle}>Treatment</label>
                          <input type="text" value={histForm.treatment} onChange={e => setHistForm({ ...histForm, treatment: e.target.value })}
                            style={inputStyle} placeholder="e.g., Antihistamine" />
                        </div>
                        <div>
                          <label style={formLabelStyle}>Prescription</label>
                          <input type="text" value={histForm.prescription} onChange={e => setHistForm({ ...histForm, prescription: e.target.value })}
                            style={inputStyle} placeholder="e.g., Cetirizine 5mg" />
                        </div>
                        <div className="col-span-2">
                          <label style={formLabelStyle}>Notes</label>
                          <input type="text" value={histForm.notes} onChange={e => setHistForm({ ...histForm, notes: e.target.value })}
                            style={inputStyle} placeholder="Any additional notes" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setAddingHist(false)}
                          style={{ padding: "6px 14px", borderRadius: 9, border: "1.5px solid var(--border)", background: "white", color: "var(--fur-slate)", fontSize: "0.82rem", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                        <button onClick={handleProviderAddHistory} disabled={!histForm.diagnosis || !histForm.date || saving}
                          style={{ padding: "6px 14px", borderRadius: 9, background: "#7C3AED", color: "white", border: "none", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: (!histForm.diagnosis || !histForm.date || saving) ? 0.5 : 1 }}>
                          {saving ? "Saving..." : "Save Record"}
                        </button>
                      </div>
                    </div>
                  )}
                  {petHistory.length === 0 && !addingHist
                    ? <p style={{ ...T.secondary, textAlign: "center", padding: "24px 0" }}>No medical history yet.</p>
                    : (() => {
                        const histTotalPages = Math.max(1, Math.ceil(petHistory.length / RECORDS_PER_PAGE));
                        const pagedHist = petHistory.slice((histPage - 1) * RECORDS_PER_PAGE, histPage * RECORDS_PER_PAGE);
                        return (
                          <>
                            <div className="space-y-2">
                              {pagedHist.map((h) => (
                                <div key={h.id} className="rounded-xl border" style={{ background: "white", borderColor: "var(--border)" }}>
                                  {editingHistId === h.id ? (
                                    <div className="p-4 space-y-3">
                                      <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--fur-slate)" }}>Edit Medical Record</p>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                          <label style={formLabelStyle}>Diagnosis *</label>
                                          <input type="text" value={editHistForm.diagnosis} onChange={e => setEditHistForm({ ...editHistForm, diagnosis: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div>
                                          <label style={formLabelStyle}>Date *</label>
                                          <input type="date" value={editHistForm.date} onChange={e => setEditHistForm({ ...editHistForm, date: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div>
                                          <label style={formLabelStyle}>Treatment</label>
                                          <input type="text" value={editHistForm.treatment} onChange={e => setEditHistForm({ ...editHistForm, treatment: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div>
                                          <label style={formLabelStyle}>Prescription</label>
                                          <input type="text" value={editHistForm.prescription} onChange={e => setEditHistForm({ ...editHistForm, prescription: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div className="col-span-2">
                                          <label style={formLabelStyle}>Notes</label>
                                          <input type="text" value={editHistForm.notes} onChange={e => setEditHistForm({ ...editHistForm, notes: e.target.value })} style={inputStyle} />
                                        </div>
                                      </div>
                                      <div className="flex justify-end gap-2">
                                        <button onClick={() => setEditingHistId(null)}
                                          style={{ padding: "6px 14px", borderRadius: 9, border: "1.5px solid var(--border)", background: "white", color: "var(--fur-slate)", fontSize: "0.82rem", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                                        <button onClick={handleProviderEditHist} disabled={!editHistForm.diagnosis || !editHistForm.date || saving}
                                          style={{ padding: "6px 14px", borderRadius: 9, background: "#7C3AED", color: "white", border: "none", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: (!editHistForm.diagnosis || !editHistForm.date || saving) ? 0.5 : 1 }}>
                                          {saving ? "Saving..." : "Save Changes"}
                                        </button>
                                      </div>
                                    </div>
                                  ) : deletingId === h.id ? (
                                    <div className="p-4 flex items-center justify-between gap-3">
                                      <p style={{ fontSize: "0.85rem", fontWeight: 400, color: "var(--fur-slate)" }}>Delete <strong style={{ fontWeight: 600 }}>{h.diagnosis}</strong>? This cannot be undone.</p>
                                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                        <button onClick={() => setDeletingId(null)}
                                          style={{ padding: "5px 12px", borderRadius: 8, border: "1.5px solid var(--border)", background: "white", color: "var(--fur-slate)", fontSize: "0.78rem", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                                        <button onClick={() => handleProviderDeleteHist(h.id)} disabled={saving}
                                          style={{ padding: "5px 12px", borderRadius: 8, background: "#DC2626", color: "white", border: "none", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: saving ? 0.5 : 1 }}>
                                          {saving ? "Deleting..." : "Delete"}
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="p-4">
                                      <div className="flex items-start gap-2 mb-1">
                                        <div className="flex items-center gap-2 flex-wrap flex-1">
                                          <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--fur-slate)" }}>{h.diagnosis}</p>
                                          {h.addedBy === "provider" && (
                                            <span style={{ fontSize: "0.68rem", fontWeight: 600, padding: "2px 7px", borderRadius: 9999, display: "inline-flex", alignItems: "center", gap: 3, background: "#DBEAFE", color: "#1E40AF" }}>
                                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                              Verified
                                            </span>
                                          )}
                                          <span style={{ ...T.secondary, marginLeft: "auto" }}>
                                            {new Date(h.date).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                                          </span>
                                        </div>
                                        {h.addedBy === "provider" && (
                                          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                                            <button onClick={() => { setEditingHistId(h.id); setEditHistForm({ diagnosis: h.diagnosis, treatment: h.treatment ?? "", prescription: h.prescription ?? "", notes: h.notes ?? "", date: h.date }); }}
                                              title="Edit" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--border)", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fur-slate-mid)" }}>
                                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                            </button>
                                            <button onClick={() => setDeletingId(h.id)}
                                              title="Delete" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #FCA5A5", background: "#FEF2F2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#DC2626" }}>
                                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                      {h.providerName && <p style={{ ...T.secondary, marginBottom: 6 }}>by {h.providerName}</p>}
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {h.treatment && <span style={{ fontSize: "0.75rem", fontWeight: 500, padding: "3px 8px", borderRadius: 8, background: "var(--fur-cream)", color: "var(--fur-slate)" }}>Treatment: {h.treatment}</span>}
                                        {h.prescription && <span style={{ fontSize: "0.75rem", fontWeight: 500, padding: "3px 8px", borderRadius: 8, background: "var(--fur-cream)", color: "var(--fur-slate)" }}>Rx: {h.prescription}</span>}
                                        {h.notes && <span style={{ fontSize: "0.75rem", fontWeight: 400, padding: "3px 8px", borderRadius: 8, background: "var(--fur-cream)", color: "var(--fur-slate-light)" }}>Notes: {h.notes}</span>}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            {histTotalPages > 1 && (
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }}>
                                <p style={T.secondary}>
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