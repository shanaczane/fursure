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
  const pendingBookings = bookings.filter(b => b.status === "pending").slice(0, 3);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const statCards = [
    { label: "Pending", value: stats.pendingBookings, icon: "⏳", color: "#F59E0B", bg: "#FEF3C7" },
    { label: "Confirmed", value: stats.confirmedBookings, icon: "📅", color: "var(--fur-teal)", bg: "var(--fur-teal-light)" },
    { label: "Active Services", value: stats.activeServices, icon: "🐾", color: "#8B5CF6", bg: "#EDE9FE" },
    { label: "This Month", value: formatCurrency(stats.monthlyEarnings), icon: "💰", color: "#059669", bg: "#D1FAE5" },
  ];

  const quickActions = [
    { label: "Add Service", icon: "➕", href: "/provider/services/new", color: "var(--fur-teal-light)", accent: "var(--fur-teal)" },
    { label: "View Bookings", icon: "📅", href: "/provider/bookings", color: "#FEF3C7", accent: "#92400E" },
    { label: "My Schedule", icon: "🗓️", href: "/provider/schedule", color: "#EDE9FE", accent: "#5B21B6" },
    { label: "Edit Profile", icon: "👤", href: "/provider/profile", color: "#D1FAE5", accent: "#065F46" },
  ];

  return (
    <ProviderLayout>
      <div className="space-y-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {/* Welcome banner */}
        <div className="rounded-2xl overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #1A2332 0%, #2D4A6B 100%)" }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-1/2 translate-x-1/4"
            style={{ background: "var(--fur-amber)" }} />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-5 translate-y-1/2"
            style={{ background: "var(--fur-teal)" }} />

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <p className="text-sm font-600 mb-1" style={{ color: "#7A90A8" }}>{getGreeting()} 👋</p>
                <h1 className="text-2xl md:text-3xl font-900 text-white" style={{ fontFamily: "'Fraunces', serif" }}>
                  {user.businessName}
                </h1>
                <p className="text-sm mt-1" style={{ color: "#7A90A8" }}>
                  {stats.pendingBookings > 0
                    ? `${stats.pendingBookings} booking${stats.pendingBookings !== 1 ? "s" : ""} awaiting response`
                    : "All caught up! No pending bookings."}
                </p>
              </div>
              {stats.averageRating > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <span className="text-xl">⭐</span>
                  <div>
                    <p className="text-xl font-900 text-white" style={{ fontFamily: "'Fraunces', serif" }}>
                      {stats.averageRating}
                    </p>
                    <p className="text-xs" style={{ color: "#7A90A8" }}>{user.totalReviews} reviews</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {statCards.map((s) => (
                <div key={s.label} className="rounded-xl p-4"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base mb-3" style={{ background: s.bg }}>
                    {s.icon}
                  </div>
                  <p className="text-xl font-900 text-white mb-0.5" style={{ fontFamily: "'Fraunces', serif" }}>{s.value}</p>
                  <p className="text-xs font-600" style={{ color: "#7A90A8" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending bookings alert */}
        {pendingBookings.length > 0 && (
          <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "#FCD34D" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#FEF3C7", background: "#FFFBEB" }}>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "#F59E0B" }} />
                <h2 className="font-800 text-base" style={{ color: "var(--fur-slate)" }}>Needs Your Response</h2>
                <span className="text-xs font-700 px-2 py-0.5 rounded-full"
                  style={{ background: "#FEF3C7", color: "#92400E" }}>
                  {stats.pendingBookings}
                </span>
              </div>
              <Link href="/provider/bookings" className="text-sm font-700" style={{ color: "var(--fur-teal)" }}>
                View all →
              </Link>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {pendingBookings.map((booking) => (
                <div key={booking.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: "#FEF3C7" }}>
                      {booking.petType === "cat" ? "🐈" : "🐕"}
                    </div>
                    <div>
                      <p className="font-700 text-sm" style={{ color: "var(--fur-slate)" }}>{booking.serviceName}</p>
                      <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                        {booking.petName} · {booking.ownerName} · {formatBookingDateTime(booking.date, booking.time)}
                      </p>
                    </div>
                  </div>
                  <Link href="/provider/bookings"
                    className="text-xs font-700 px-3 py-1.5 rounded-xl transition-colors"
                    style={{ background: "var(--fur-teal-light)", color: "var(--fur-teal-dark)" }}>
                    Respond
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Schedule */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="font-800 text-base" style={{ color: "var(--fur-slate)" }}>Upcoming Schedule</h2>
              <Link href="/provider/schedule" className="text-sm font-700" style={{ color: "var(--fur-teal)" }}>
                Full calendar →
              </Link>
            </div>
            {upcomingBookings.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-4xl mb-3">📅</p>
                <p className="font-700 mb-1" style={{ color: "var(--fur-slate)" }}>No upcoming bookings</p>
                <Link href="/provider/services" className="text-sm font-700" style={{ color: "var(--fur-teal)" }}>
                  Activate your services
                </Link>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {upcomingBookings.map((booking) => {
                  const effectiveDate = booking.rescheduleDate || booking.date;
                  const effectiveTime = booking.rescheduleTime || booking.time;
                  const cfg = BOOKING_STATUS_CONFIG[booking.status];
                  return (
                    <div key={booking.id} className="px-6 py-4 flex items-start gap-4">
                      <div className="flex-shrink-0 text-center min-w-12">
                        <p className="text-xs font-700 uppercase" style={{ color: "var(--fur-slate-light)" }}>
                          {new Date(effectiveDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" })}
                        </p>
                        <p className="text-2xl font-900" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
                          {new Date(effectiveDate + "T00:00:00").getDate()}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-700 text-sm truncate" style={{ color: "var(--fur-slate)" }}>{booking.serviceName}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                          {booking.petName} · {booking.ownerName}
                        </p>
                        <p className="text-xs font-700 mt-1" style={{ color: "var(--fur-teal)" }}>
                          🕐 {formatRelativeDate(effectiveDate)} at {effectiveTime}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Earnings + Quick Actions */}
          <div className="space-y-5">
            {/* Earnings */}
            <div className="rounded-2xl border p-6" style={{ background: "white", borderColor: "var(--border)" }}>
              <h2 className="font-800 text-base mb-5" style={{ color: "var(--fur-slate)" }}>Earnings Overview</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="rounded-xl p-4" style={{ background: "var(--fur-teal-light)" }}>
                  <p className="text-xs font-700 uppercase tracking-wide mb-2" style={{ color: "var(--fur-teal-dark)" }}>This Month</p>
                  <p className="text-2xl font-900" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-teal-dark)" }}>
                    {formatCurrency(stats.monthlyEarnings)}
                  </p>
                </div>
                <div className="rounded-xl p-4" style={{ background: "var(--fur-amber-light)" }}>
                  <p className="text-xs font-700 uppercase tracking-wide mb-2" style={{ color: "var(--fur-amber-dark)" }}>All Time</p>
                  <p className="text-2xl font-900" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-amber-dark)" }}>
                    {formatCurrency(stats.totalEarnings)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Completed", value: stats.completedBookings, color: "#065F46" },
                  { label: "Cancelled", value: stats.cancelledBookings, color: "var(--fur-rose)" },
                  { label: "Total", value: stats.totalBookings, color: "var(--fur-slate)" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "var(--fur-cream)" }}>
                    <p className="text-lg font-900 mb-0.5" style={{ fontFamily: "'Fraunces', serif", color: s.color }}>{s.value}</p>
                    <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border p-6" style={{ background: "white", borderColor: "var(--border)" }}>
              <h2 className="font-800 text-base mb-4" style={{ color: "var(--fur-slate)" }}>Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Link key={action.label} href={action.href}
                    className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all card-hover"
                    style={{ borderColor: "var(--border)", background: "var(--fur-cream)" }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ background: action.color }}>
                      {action.icon}
                    </div>
                    <span className="font-700 text-sm" style={{ color: "var(--fur-slate)" }}>{action.label}</span>
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