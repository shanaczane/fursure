"use client";

import React from "react";
import Link from "next/link";
import { type Booking } from "@/app/types";
import {
  formatRelativeDate,
  formatBookingDate,
} from "@/app/utils/dashboardUtils";
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS } from "@/app/types";

interface UpcomingBookingsProps {
  bookings: Booking[];
  showViewAll?: boolean;
  onEdit?: (booking: Booking) => void;
  onCancel?: (bookingId: string) => void;
  onDelete?: (bookingId: string) => void;
}

const UpcomingBookings: React.FC<UpcomingBookingsProps> = ({
  bookings,
  showViewAll = false,
  onEdit,
  onCancel,
  onDelete,
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
        {displayBookings.map((booking) => (
          <div
            key={booking.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {booking.serviceName}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${BOOKING_STATUS_COLORS[booking.status]}`}
                  >
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </span>
                </div>
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
                    <span>{formatBookingDate(booking.date, booking.time)}</span>
                  </p>
                </div>
                {booking.notes && (
                  <p className="mt-2 text-sm text-gray-500 italic">
                    Note: {booking.notes}
                  </p>
                )}
              </div>

              <div className="ml-4 text-right space-y-2">
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                  {formatRelativeDate(booking.date)}
                </div>
                <div className="flex flex-col space-y-1">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(booking)}
                      className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  {onCancel && (
                    <button
                      onClick={() => onCancel(booking.id)}
                      className="px-3 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded text-xs font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(booking.id)}
                      className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-xs font-medium transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
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
