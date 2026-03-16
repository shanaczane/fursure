"use client";

import React from "react";
import Link from "next/link";
import { useProviderContext } from "../context/ProviderAppContext";
import {
  getProviderDashboardStats,
  getUpcomingBookings,
  formatBookingDateTime,
  formatRelativeDate,
  formatCurrency,
} from "../utils/providerUtils";
import { BOOKING_STATUS_CONFIG } from "../types";
import ProviderLayout from "../components/ProviderLayout";

const ProviderDashboardPage: React.FC = () => {
  const { user, services, bookings } = useProviderContext();
  const stats = getProviderDashboardStats(bookings, services);
  const upcomingBookings = getUpcomingBookings(bookings).slice(0, 4);
  const pendingBookings = bookings.filter((b) => b.status === "pending").slice(0, 3);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <ProviderLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                {getGreeting()}, {user.name.split(" ")[0]}! 👋
              </h1>
              <p className="text-blue-100 text-sm md:text-base">
                {user.businessName} · {stats.pendingBookings} booking{stats.pendingBookings !== 1 ? "s" : ""} awaiting your response
              </p>
            </div>
            {stats.averageRating > 0 && (
              <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2 flex items-center space-x-2">
                <span className="text-yellow-300 text-xl">⭐</span>
                <div>
                  <p className="text-white font-bold text-lg leading-none">{stats.averageRating}</p>
                  <p className="text-blue-200 text-xs">{user.totalReviews} reviews</p>
                </div>
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {[
              { label: "Pending", value: stats.pendingBookings, color: "text-amber-300" },
              { label: "Confirmed", value: stats.confirmedBookings, color: "text-green-300" },
              { label: "Active Services", value: stats.activeServices, color: "text-blue-200" },
              { label: "This Month", value: formatCurrency(stats.monthlyEarnings), color: "text-emerald-300" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-lg p-3 text-center">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-blue-100 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Bookings Alert */}
        {pendingBookings.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-amber-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                <h2 className="font-bold text-gray-900">Needs Your Response</h2>
                <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {stats.pendingBookings}
                </span>
              </div>
              <Link href="/provider/bookings" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {pendingBookings.map((booking) => (
                <div key={booking.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center text-lg">
                      {booking.petType === "cat" ? "🐈" : "🐕"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{booking.serviceName}</p>
                      <p className="text-xs text-gray-500">
                        {booking.petName} · {booking.ownerName} · {formatBookingDateTime(booking.date, booking.time)}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/provider/bookings"
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-medium transition-colors flex-shrink-0"
                  >
                    Respond
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Upcoming Schedule</h2>
              <Link href="/provider/schedule" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Full calendar →
              </Link>
            </div>
            {upcomingBookings.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-4xl mb-2">📅</p>
                <p className="text-gray-500 text-sm">No upcoming bookings</p>
                <Link href="/provider/services" className="text-blue-600 text-sm font-medium mt-1 inline-block">
                  Activate your services
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {upcomingBookings.map((booking) => {
                  const effectiveDate = booking.rescheduleDate || booking.date;
                  const effectiveTime = booking.rescheduleTime || booking.time;
                  const cfg = BOOKING_STATUS_CONFIG[booking.status];
                  return (
                    <div key={booking.id} className="px-6 py-4 flex items-start space-x-3">
                      <div className="flex-shrink-0 text-center min-w-[44px]">
                        <p className="text-xs text-gray-400 uppercase font-medium">
                          {new Date(effectiveDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" })}
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                          {new Date(effectiveDate + "T00:00:00").getDate()}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900 text-sm truncate">{booking.serviceName}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {booking.petName} · {booking.ownerName}
                        </p>
                        <p className="text-xs text-blue-600 font-medium mt-0.5">
                          🕐 {formatRelativeDate(effectiveDate)} at {effectiveTime}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Stats + Actions */}
          <div className="space-y-4">
            {/* Earnings Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Earnings Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-green-600 font-medium uppercase tracking-wide mb-1">This Month</p>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(stats.monthlyEarnings)}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">All Time</p>
                  <p className="text-2xl font-bold text-blue-700">{formatCurrency(stats.totalEarnings)}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Completed", value: stats.completedBookings, color: "text-green-600" },
                  { label: "Cancelled", value: stats.cancelledBookings, color: "text-red-500" },
                  { label: "Total", value: stats.totalBookings, color: "text-gray-700" },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-50 rounded-lg p-2">
                    <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Add Service", icon: "➕", href: "/provider/services", color: "border-blue-200 hover:border-blue-400 hover:bg-blue-50" },
                  { label: "View Bookings", icon: "📅", href: "/provider/bookings", color: "border-amber-200 hover:border-amber-400 hover:bg-amber-50" },
                  { label: "My Schedule", icon: "🗓️", href: "/provider/schedule", color: "border-purple-200 hover:border-purple-400 hover:bg-purple-50" },
                  { label: "Edit Profile", icon: "👤", href: "/provider/profile", color: "border-green-200 hover:border-green-400 hover:bg-green-50" },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={`border-2 rounded-xl p-4 text-center transition-all ${action.color}`}
                  >
                    <p className="text-2xl mb-1">{action.icon}</p>
                    <p className="text-sm font-medium text-gray-700">{action.label}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
};

export default ProviderDashboardPage;