"use client";

import React, { useState } from "react";
import { type Booking } from "@/app/types";
import { formatBookingDate } from "@/app/utils/dashboardUtils";
import { BOOKING_STATUS_LABELS } from "@/app/types";

interface BookingHistoryProps {
  bookings: Booking[];
  onEdit?: (booking: Booking) => void;
  onDelete?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
  onBookAgain?: (booking: Booking) => void;
  onLeaveReview?: (booking: Booking) => void;
  reviewedBookingIds?: Set<string>;
}

const statusStyle: Record<string, { bg: string; color: string }> = {
  pending:              { bg: "#FEF3C7", color: "#92400E" },
  awaiting_downpayment: { bg: "#FFEDD5", color: "#9A3412" },
  payment_submitted:    { bg: "#DBEAFE", color: "#1E40AF" },
  confirmed:            { bg: "#DBEAFE", color: "#1E40AF" },
  rescheduled:          { bg: "#EDE9FE", color: "#5B21B6" },
  completed:            { bg: "#D1FAE5", color: "#065F46" },
  cancelled:            { bg: "#F3F4F6", color: "#374151" },
  declined:             { bg: "#FEE2E2", color: "#991B1B" },
};

const BookingHistory: React.FC<BookingHistoryProps> = ({
  bookings,
  onEdit,
  onDelete,
  onCancel,
  onBookAgain,
  onLeaveReview,
  reviewedBookingIds,
}) => {
  const [showAll, setShowAll] = useState(false);
  const displayBookings = showAll ? bookings : bookings.slice(0, 8);
  const hasReviewed = (booking: Booking) => reviewedBookingIds?.has(booking.id) ?? false;

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border p-16 text-center" style={{ background: "white", borderColor: "var(--border)", fontFamily: "'Nunito', sans-serif" }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "var(--fur-cream)", color: "var(--fur-slate-light)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
        </div>
        <p className="font-700 mb-1" style={{ color: "var(--fur-slate)" }}>No booking history yet</p>
        <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>Your past bookings will appear here</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)", fontFamily: "'Nunito', sans-serif" }}>

      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: "var(--border)" }}>
        <div>
          <h2 className="font-900 text-lg" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>Booking History</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--fur-slate-light)" }}>{bookings.length} total booking{bookings.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--fur-cream)" }}>
              {["Service", "Provider", "Pet", "Date & Time", "Status", "Actions"].map((h) => (
                <th key={h} style={{
                  padding: "0.65rem 1.25rem",
                  textAlign: "left",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--fur-slate-mid)",
                  whiteSpace: "nowrap",
                  borderBottom: "1.5px solid var(--border)",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayBookings.map((booking, idx) => {
              const st = statusStyle[booking.status] ?? statusStyle.pending;
              const isLast = idx === displayBookings.length - 1;

              return (
                <tr key={booking.id}
                  style={{ borderBottom: isLast ? "none" : "1px solid var(--border)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-cream)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "white")}
                >
                  {/* Service */}
                  <td style={{ padding: "0.9rem 1.25rem", minWidth: "140px" }}>
                    <p className="font-800 text-sm" style={{ color: "var(--fur-slate)" }}>{booking.serviceName}</p>
                    {booking.notes && (
                      <p className="text-xs mt-0.5 truncate max-w-40" style={{ color: "var(--fur-slate-light)" }} title={booking.notes}>
                        {booking.notes}
                      </p>
                    )}
                  </td>

                  {/* Provider */}
                  <td style={{ padding: "0.9rem 1.25rem", minWidth: "120px" }}>
                    <p className="text-sm font-600 truncate" style={{ color: "var(--fur-slate)", maxWidth: "140px" }}>
                      {booking.providerName}
                    </p>
                  </td>

                  {/* Pet */}
                  <td style={{ padding: "0.9rem 1.25rem", minWidth: "90px" }}>
                    <p className="text-sm font-600" style={{ color: "var(--fur-slate)" }}>{booking.petName}</p>
                  </td>

                  {/* Date */}
                  <td style={{ padding: "0.9rem 1.25rem", minWidth: "140px", whiteSpace: "nowrap" }}>
                    <p className="text-sm font-600" style={{ color: "var(--fur-slate)" }}>
                      {formatBookingDate(booking.date, booking.time)}
                    </p>
                  </td>

                  {/* Status */}
                  <td style={{ padding: "0.9rem 1.25rem", minWidth: "120px" }}>
                    <span className="text-xs font-700 px-2.5 py-1 rounded-full whitespace-nowrap"
                      style={{ background: st.bg, color: st.color }}>
                      {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "0.9rem 1.25rem", minWidth: "160px" }}>
                    <div className="flex items-center gap-2 flex-wrap">
                      {booking.status === "pending" && (
                        <>
                          {onEdit && (
                            <button onClick={() => onEdit(booking)}
                              className="text-xs font-700 px-3 py-1.5 rounded-lg transition-colors"
                              style={{ background: "#DBEAFE", color: "#1E40AF" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#BFDBFE")}
                              onMouseLeave={e => (e.currentTarget.style.background = "#DBEAFE")}>
                              Edit
                            </button>
                          )}
                          {onCancel && (
                            <button onClick={() => onCancel(booking.id)}
                              className="text-xs font-700 px-3 py-1.5 rounded-lg transition-colors"
                              style={{ background: "#FEF3C7", color: "#92400E" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#FDE68A")}
                              onMouseLeave={e => (e.currentTarget.style.background = "#FEF3C7")}>
                              Cancel
                            </button>
                          )}
                          {onDelete && (
                            <button onClick={() => onDelete(booking.id)}
                              className="text-xs font-700 px-3 py-1.5 rounded-lg transition-colors"
                              style={{ background: "#FEE2E2", color: "#991B1B" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#FECACA")}
                              onMouseLeave={e => (e.currentTarget.style.background = "#FEE2E2")}>
                              Delete
                            </button>
                          )}
                        </>
                      )}

                      {booking.status === "confirmed" && onCancel && (
                        <button onClick={() => onCancel(booking.id)}
                          className="text-xs font-700 px-3 py-1.5 rounded-lg transition-colors"
                          style={{ background: "#FEE2E2", color: "#991B1B" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#FECACA")}
                          onMouseLeave={e => (e.currentTarget.style.background = "#FEE2E2")}>
                          Cancel
                        </button>
                      )}

                      {booking.status === "completed" && (
                        <>
                          {onBookAgain && (
                            <button onClick={() => onBookAgain(booking)}
                              className="text-xs font-700 px-3 py-1.5 rounded-lg transition-colors"
                              style={{ background: "#DBEAFE", color: "#1E40AF" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#BFDBFE")}
                              onMouseLeave={e => (e.currentTarget.style.background = "#DBEAFE")}>
                              Book Again
                            </button>
                          )}
                          {onLeaveReview && !hasReviewed(booking) && (
                            <button onClick={() => onLeaveReview(booking)}
                              className="text-xs font-700 px-3 py-1.5 rounded-lg transition-colors"
                              style={{ background: "#FEF3C7", color: "#92400E" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#FDE68A")}
                              onMouseLeave={e => (e.currentTarget.style.background = "#FEF3C7")}>
                              Review
                            </button>
                          )}
                          {hasReviewed(booking) && (
                            <span className="text-xs font-700 px-3 py-1.5 rounded-lg flex items-center gap-1"
                              style={{ background: "#D1FAE5", color: "#065F46" }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              Reviewed
                            </span>
                          )}
                          {onDelete && (
                            <button onClick={() => onDelete(booking.id)}
                              className="text-xs font-700 px-3 py-1.5 rounded-lg transition-colors"
                              style={{ background: "#FEE2E2", color: "#991B1B" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#FECACA")}
                              onMouseLeave={e => (e.currentTarget.style.background = "#FEE2E2")}>
                              Delete
                            </button>
                          )}
                        </>
                      )}

                      {(booking.status === "cancelled" || booking.status === "declined") && (
                        <>
                          {onBookAgain && (
                            <button onClick={() => onBookAgain(booking)}
                              className="text-xs font-700 px-3 py-1.5 rounded-lg transition-colors"
                              style={{ background: "#DBEAFE", color: "#1E40AF" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#BFDBFE")}
                              onMouseLeave={e => (e.currentTarget.style.background = "#DBEAFE")}>
                              Book Again
                            </button>
                          )}
                          {onDelete && (
                            <button onClick={() => onDelete(booking.id)}
                              className="text-xs font-700 px-3 py-1.5 rounded-lg transition-colors"
                              style={{ background: "#F3F4F6", color: "#374151" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#E5E7EB")}
                              onMouseLeave={e => (e.currentTarget.style.background = "#F3F4F6")}>
                              Delete
                            </button>
                          )}
                        </>
                      )}

                      {!["pending", "confirmed", "completed", "cancelled", "declined"].includes(booking.status) && (
                        <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>—</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Show more */}
      {bookings.length > 8 && (
        <div className="px-6 py-3 border-t text-center" style={{ borderColor: "var(--border)" }}>
          <button onClick={() => setShowAll(!showAll)}
            className="text-sm font-700 transition-colors"
            style={{ color: "var(--fur-teal)", background: "none", border: "none", cursor: "pointer" }}>
            {showAll ? "Show less" : `Show all ${bookings.length} bookings`}
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
