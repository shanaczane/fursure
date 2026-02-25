"use client";

import Link from "next/link";
import { type Booking } from "@/app/types";
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS } from "@/app/types";

interface RecentActivityProps {
  bookings: Booking[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ bookings }) => {
  const recentBookings = bookings.slice(0, 5);
  if (recentBookings.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        <Link
          href="/owner/bookings"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View all →
        </Link>
      </div>
      <div className="space-y-3">
        {recentBookings.map((booking) => (
          <div
            key={booking.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                {booking.status === "completed"
                  ? "✅"
                  : booking.status === "confirmed"
                    ? "📅"
                    : booking.status === "cancelled"
                      ? "❌"
                      : "⏳"}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {booking.serviceName}
                </p>
                <p className="text-sm text-gray-600">{booking.petName}</p>
              </div>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${BOOKING_STATUS_COLORS[booking.status]}`}
            >
              {BOOKING_STATUS_LABELS[booking.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
