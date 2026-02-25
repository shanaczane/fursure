"use client";

import React, { useState } from "react";
import { type Booking } from "@/app/types";
import { formatBookingDate } from "@/app/utils/dashboardUtils";
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS } from "@/app/types";

interface BookingHistoryProps {
  bookings: Booking[];
  onEdit?: (booking: Booking) => void;
  onDelete?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
  onBookAgain?: (booking: Booking) => void;
  onLeaveReview?: (booking: Booking) => void;
}

const BookingHistory: React.FC<BookingHistoryProps> = ({
  bookings,
  onEdit,
  onDelete,
  onCancel,
  onBookAgain,
  onLeaveReview,
}) => {
  const [showAll, setShowAll] = useState(false);
  const displayBookings = showAll ? bookings : bookings.slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Booking History</h2>
        <span className="text-sm text-gray-500">
          {bookings.length} total booking{bookings.length !== 1 ? "s" : ""}
        </span>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No booking history yet
          </h3>
          <p className="text-gray-500">Your past bookings will appear here</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {displayBookings.map((booking) => (
              <div
                key={booking.id}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1 mb-4 md:mb-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {booking.serviceName}
                      </h3>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${BOOKING_STATUS_COLORS[booking.status]}`}
                      >
                        {BOOKING_STATUS_LABELS[booking.status]}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
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
                        <span>
                          {formatBookingDate(booking.date, booking.time)}
                        </span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <span>🆔</span>
                        <span className="text-gray-400">
                          Booking #{booking.id}
                        </span>
                      </p>
                    </div>
                    {booking.notes && (
                      <div className="mt-3 bg-gray-50 rounded p-3">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Note:</span>{" "}
                          {booking.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2">
                    {booking.status === "pending" && (
                      <>
                        {onEdit && (
                          <button
                            onClick={() => onEdit(booking)}
                            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            Edit
                          </button>
                        )}
                        {onCancel && (
                          <button
                            onClick={() => onCancel(booking.id)}
                            className="px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(booking.id)}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                    {booking.status === "confirmed" && (
                      <>
                        {onCancel && (
                          <button
                            onClick={() => onCancel(booking.id)}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </>
                    )}
                    {booking.status === "completed" && (
                      <>
                        {onBookAgain && (
                          <button
                            onClick={() => onBookAgain(booking)}
                            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            Book Again
                          </button>
                        )}
                        {onLeaveReview && (
                          <button
                            onClick={() => onLeaveReview(booking)}
                            className="px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            Leave Review
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(booking.id)}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                    {booking.status === "cancelled" && (
                      <>
                        {onBookAgain && (
                          <button
                            onClick={() => onBookAgain(booking)}
                            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            Book Again
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(booking.id)}
                            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {bookings.length > 5 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                {showAll ? "Show Less" : `Show All (${bookings.length})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookingHistory;
