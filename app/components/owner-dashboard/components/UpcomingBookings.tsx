"use client";

import React from "react";
import Link from "next/link";
import {
  type Booking,
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  getBookingPermissions,
  gracePeriodHoursRemaining,
  isDownPaymentExpired,
} from "@/app/types";
import { formatRelativeDate, formatBookingDate } from "@/app/utils/dashboardUtils";

interface UpcomingBookingsProps {
  bookings: Booking[];
  showViewAll?: boolean;
  onEdit?: (booking: Booking) => void;
  onCancel?: (bookingId: string, needsApproval: boolean) => void;
  onDelete?: (bookingId: string) => void;
  onPayDownPayment?: (bookingId: string) => void;
  /** Called when the owner confirms the provider's reschedule proposal */
  onConfirmReschedule?: (bookingId: string) => void;
  /** Called when the owner declines the provider's reschedule proposal */
  onDeclineReschedule?: (bookingId: string) => void;
}

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
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Upcoming Bookings</h2>
        {showViewAll && (
          <Link
            href="/owner/bookings"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all →
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {displayBookings.map((booking) => {
          const permissions = getBookingPermissions(booking);
          const hoursLeft = gracePeriodHoursRemaining(booking);
          const downPaymentExpired = isDownPaymentExpired(booking);
          const editApproved = booking.editRequestStatus === "approved";

          // ── Reschedule proposal helpers ───────────────────────────────────
          const hasRescheduleProposal =
            booking.status === "rescheduled" &&
            !!booking.rescheduleDate &&
            !!booking.rescheduleTime;

          return (
            <div
              key={booking.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header: name + status badge */}
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{booking.serviceName}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${BOOKING_STATUS_COLORS[booking.status]}`}
                    >
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </span>
                  </div>

                  {/* Core info */}
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="flex items-center space-x-2">
                      <span>🏢</span>
                      <span>{booking.providerName}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <span>🐾</span>
                      <span>{booking.petName}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <span>📅</span>
                      {/* Show original date/time with strikethrough when a proposal is pending */}
                      {hasRescheduleProposal ? (
                        <span className="line-through text-gray-400">
                          {formatBookingDate(booking.date, booking.time)}
                        </span>
                      ) : (
                        <span>{formatBookingDate(booking.date, booking.time)}</span>
                      )}
                    </p>
                  </div>

                  {booking.notes && (
                    <p className="mt-2 text-sm text-gray-500 italic">Note: {booking.notes}</p>
                  )}

                  {/* ── Reschedule proposal banner ────────────────────────── */}
                  {hasRescheduleProposal && (
                    <div className="mt-3 pt-3 border-t border-purple-200 bg-purple-50 rounded-lg px-3 py-3">
                      <p className="text-sm font-semibold text-purple-800 mb-1">
                        📅 The provider proposed a new schedule
                      </p>
                      <p className="text-sm text-purple-700 mb-3">
                        <span className="font-medium">New time: </span>
                        {formatBookingDate(booking.rescheduleDate!, booking.rescheduleTime!)}
                      </p>
                      <div className="flex gap-2">
                        {onConfirmReschedule && (
                          <button
                            onClick={() => onConfirmReschedule(booking.id)}
                            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors"
                          >
                            ✓ Confirm New Schedule
                          </button>
                        )}
                        {onDeclineReschedule && (
                          <button
                            onClick={() => onDeclineReschedule(booking.id)}
                            className="px-4 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold transition-colors"
                          >
                            ✗ Decline
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Down payment banner ───────────────────────────────── */}
                  {booking.status === "awaiting_downpayment" && (
                    <div
                      className={`mt-3 pt-3 border-t ${
                        downPaymentExpired ? "border-red-100" : "border-orange-100"
                      }`}
                    >
                      {downPaymentExpired ? (
                        <p className="text-xs text-red-600 font-medium">
                          ⛔ Down payment deadline passed. This booking will be automatically declined.
                        </p>
                      ) : (
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="text-xs text-orange-700 font-medium">
                            ⏳ Down payment required within{" "}
                            {Math.ceil(booking.downPaymentDeadlineHours ?? 24)} hrs
                            {hoursLeft > 0 && ` (${Math.ceil(hoursLeft)} hrs remaining)`}
                          </p>
                          {onPayDownPayment && (
                            <button
                              onClick={() => onPayDownPayment(booking.id)}
                              className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-semibold transition-colors"
                            >
                              Pay Now
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Grace period notice for pending bookings ──────────── */}
                  {booking.status === "pending" && !permissions.withinGracePeriod && (
                    <p className="mt-2 text-xs text-gray-400 italic">
                      Grace period expired — edits/cancellations no longer available.
                    </p>
                  )}

                  {/* ── Approved edit notice ──────────────────────────────── */}
                  {editApproved && (
                    <div className="mt-3 pt-3 border-t border-green-100">
                      <p className="text-xs text-green-700 font-medium">
                        ✅ Edit approved by provider — please update your booking details. Once
                        submitted, the provider will re-confirm.
                      </p>
                    </div>
                  )}

                  {/* ── Approval notice for confirmed bookings ────────────── */}
                  {booking.status === "confirmed" &&
                    !editApproved &&
                    booking.editRequestStatus !== "pending" && (
                      <p className="mt-2 text-xs text-blue-600">
                        ℹ️ Edits or cancellations require provider approval.
                      </p>
                    )}

                  {/* Pending edit/cancel request notices */}
                  {booking.editRequestStatus === "pending" && (
                    <p className="mt-1 text-xs text-yellow-600">
                      🕐 Edit request sent — awaiting provider approval.
                    </p>
                  )}
                  {booking.cancelRequestStatus === "pending" && (
                    <p className="mt-1 text-xs text-yellow-600">
                      🕐 Cancellation request sent — awaiting provider approval.
                    </p>
                  )}

                  {/* ── Contact provider (confirmed only) ────────────────── */}
                  {booking.status === "confirmed" &&
                    (booking.providerPhone ||
                      booking.providerEmail ||
                      booking.providerContactLink) && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                        <p className="text-xs font-semibold text-green-700">📞 Contact Provider</p>
                        {booking.providerPhone && (
                          <a
                            href={`tel:${booking.providerPhone}`}
                            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600"
                          >
                            <span>📱</span>
                            <span>{booking.providerPhone}</span>
                          </a>
                        )}
                        {booking.providerEmail && (
                          <a
                            href={`mailto:${booking.providerEmail}`}
                            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600"
                          >
                            <span>✉️</span>
                            <span>{booking.providerEmail}</span>
                          </a>
                        )}
                        {booking.providerContactLink && (
                          <a
                            href={booking.providerContactLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium"
                          >
                            <span>🔗</span>
                            <span>
                              {booking.providerContactLink.includes("facebook")
                                ? "Facebook"
                                : booking.providerContactLink.includes("instagram")
                                ? "Instagram"
                                : booking.providerContactLink.includes("tiktok")
                                ? "TikTok"
                                : booking.providerContactLink.includes("twitter") ||
                                  booking.providerContactLink.includes("x.com")
                                ? "Twitter / X"
                                : "Social Profile"}
                            </span>
                          </a>
                        )}
                      </div>
                    )}
                </div>

                {/* ── Right column: date badge + action buttons ──────────── */}
                <div className="ml-4 text-right space-y-2 shrink-0">
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                    {formatRelativeDate(
                      // Show proposed date in the badge when rescheduled
                      hasRescheduleProposal ? booking.rescheduleDate! : booking.date
                    )}
                  </div>

                  {/* Hide normal edit/cancel buttons while a reschedule is pending */}
                  {!hasRescheduleProposal && (
                    <div className="flex flex-col space-y-1">
                      {/* Edit — approved path */}
                      {onEdit && editApproved && (
                        <button
                          onClick={() => onEdit(booking)}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-semibold transition-colors"
                          title="Provider approved your edit — update your booking now"
                        >
                          ✏️ Edit Now
                        </button>
                      )}

                      {/* Edit — normal path */}
                      {onEdit && !editApproved && permissions.canEdit && (
                        <button
                          onClick={() => onEdit(booking)}
                          className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium transition-colors"
                          title={
                            permissions.editNeedsProviderApproval
                              ? "Request edit — provider must approve"
                              : "Edit booking"
                          }
                        >
                          {permissions.editNeedsProviderApproval ? "Request Edit" : "Edit"}
                        </button>
                      )}

                      {/* Cancel */}
                      {onCancel && permissions.canCancel && (
                        <button
                          onClick={() =>
                            onCancel(booking.id, permissions.cancelNeedsProviderApproval)
                          }
                          className="px-3 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded text-xs font-medium transition-colors"
                          title={
                            permissions.cancelNeedsProviderApproval
                              ? "Request cancellation — provider must approve"
                              : "Cancel booking"
                          }
                        >
                          {permissions.cancelNeedsProviderApproval
                            ? "Request Cancel"
                            : "Cancel"}
                        </button>
                      )}

                      {/* Delete */}
                      {onDelete && permissions.canDelete && (
                        <button
                          onClick={() => onDelete(booking.id)}
                          className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-xs font-medium transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No upcoming bookings</p>
          <Link
            href="/owner/services"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-2 inline-block"
          >
            Browse services
          </Link>
        </div>
      )}
    </div>
  );
};

export default UpcomingBookings;