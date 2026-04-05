"use client";

import React, { useMemo } from "react";
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

const PendingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const WrenchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);
const EarningsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const ScheduleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
  </svg>
);
const PersonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
  </svg>
);
const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const PetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const StarRating: React.FC<{ rating: number; count: number }> = ({ rating, count }) => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const filled = rating >= i + 1;
        const half = !filled && rating >= i + 0.5;
        return (
          <svg key={i} width="12" height="12" viewBox="0 0 24 24"
            fill={filled || half ? "#F59E0B" : "none"}
            stroke="#F59E0B" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ opacity: filled || half ? 1 : 0.3 }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
    </div>
    <span className="text-sm font-800 text-white" style={{ fontFamily: "'Fraunces', serif" }}>
      {rating > 0 ? rating.toFixed(1) : "—"}
    </span>
    <span className="text-xs" style={{ color: "#7A90A8" }}>
      ({count > 0 ? `${count} review${count !== 1 ? "s" : ""}` : "no reviews"})
    </span>
  </div>
);

const ProviderDashboardPage: React.FC = () => {
  const { user, services, bookings } = useProviderContext();
  const stats = getProviderDashboardStats(bookings, services);
  const upcomingBookings = getUpcomingBookings(bookings).slice(0, 4);
  const pendingBookings = bookings.filter(b => b.status === "pending").slice(0, 3);

  const { liveRating, liveReviewCount } = useMemo(() => {
    const reviewed = bookings.filter(
      b => b.status === "completed" && typeof b.rating === "number" && b.rating > 0
    );
    const count = reviewed.length;
    const avg = count > 0
      ? Math.round((reviewed.reduce((sum, b) => sum + (b.rating ?? 0), 0) / count) * 10) / 10
      : 0;
    return { liveRating: avg, liveReviewCount: count };
  }, [bookings]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const statCards = [
    { label: "Pending", value: stats.pendingBookings, icon: <PendingIcon />, color: "#F59E0B", bg: "#FEF3C7" },
    { label: "Confirmed", value: stats.confirmedBookings, icon: <CalendarIcon />, color: "var(--fur-teal)", bg: "var(--fur-teal-light)" },
    { label: "Active Services", value: stats.activeServices, icon: <WrenchIcon />, color: "#8B5CF6", bg: "#EDE9FE" },
    { label: "This Month", value: formatCurrency(stats.monthlyEarnings), icon: <EarningsIcon />, color: "#059669", bg: "#D1FAE5" },
  ];

  const quickActions = [
    { label: "Add Service", icon: <PlusIcon />, href: "/provider/services/new", color: "var(--fur-teal-light)", accent: "var(--fur-teal)" },
    { label: "View Bookings", icon: <CalendarIcon />, href: "/provider/bookings", color: "#FEF3C7", accent: "#92400E" },
    { label: "My Schedule", icon: <ScheduleIcon />, href: "/provider/schedule", color: "#EDE9FE", accent: "#5B21B6" },
    { label: "Edit Profile", icon: <PersonIcon />, href: "/provider/profile", color: "#D1FAE5", accent: "#065F46" },
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
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
              <div>
                <p className="text-sm font-600 mb-1" style={{ color: "#7A90A8" }}>{getGreeting()}</p>
                <h1 className="text-2xl md:text-3xl font-900 text-white" style={{ fontFamily: "'Fraunces', serif" }}>
                  {user.businessName}
                </h1>
                <p className="text-sm mt-1" style={{ color: "#7A90A8" }}>
                  {stats.pendingBookings > 0
                    ? `${stats.pendingBookings} booking${stats.pendingBookings !== 1 ? "s" : ""} awaiting response`
                    : "All caught up! No pending bookings."}
                </p>
              </div>
              <StarRating rating={liveRating} count={liveReviewCount} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {statCards.map((s) => (
                <div key={s.label} className="rounded-xl p-4"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: s.bg, color: s.color }}>
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
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "#FEF3C7", color: "#92400E" }}>
                      <PetIcon />
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
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "var(--fur-teal-light)", color: "var(--fur-teal)" }}>
                  <CalendarIcon />
                </div>
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
                        <p className="text-xs font-700 mt-1 flex items-center gap-1" style={{ color: "var(--fur-teal)" }}>
                          <ClockIcon /> {formatRelativeDate(effectiveDate)} at {effectiveTime}
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
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: action.color, color: action.accent }}>
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