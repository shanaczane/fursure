"use client";

import React, { useMemo, useState } from "react";
import { useAdminContext } from "../context/AdminContext";
import AdminLayout from "../components/AdminLayout";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const MoneyIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const TrendIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
  </svg>
);
const BuildingIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
  </svg>
);
const XIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const CalendarIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const RevenueTab: React.FC = () => {
  const { stats, providers, isLoading } = useAdminContext();
  const [sortBy, setSortBy] = useState<"revenue" | "bookings" | "name">("revenue");

  const topProviders = useMemo(() => {
    return [...providers]
      .filter(p => p.isVerified)
      .sort((a, b) => {
        if (sortBy === "revenue") return b.totalRevenue - a.totalRevenue;
        if (sortBy === "bookings") return b.bookingCount - a.bookingCount;
        return a.businessName.localeCompare(b.businessName);
      });
  }, [providers, sortBy]);

  const maxRevenue = Math.max(...topProviders.map(p => p.totalRevenue), 1);

  const completionRate = stats.totalBookings > 0
    ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
    : 0;

  const cancellationRate = stats.totalBookings > 0
    ? Math.round((stats.cancelledBookings / stats.totalBookings) * 100)
    : 0;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <p className="font-700" style={{ color: "var(--fur-slate)" }}>Loading revenue data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <div>
          <h1 className="text-2xl md:text-3xl font-900 mb-1" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
            Revenue & Analytics
          </h1>
          <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>
            Platform-wide revenue tracking and booking performance.
          </p>
        </div>

        {/* Top Revenue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total Platform Revenue",
              value: formatCurrency(stats.totalRevenue),
              sub: "From all completed bookings",
              icon: <MoneyIcon />,
              bg: "#D1FAE5",
              color: "#065F46",
              accent: "#F0FDF4",
            },
            {
              label: "This Month's Revenue",
              value: formatCurrency(stats.monthlyRevenue),
              sub: `${new Date().toLocaleString("default", { month: "long" })} ${new Date().getFullYear()}`,
              icon: <TrendIcon />,
              bg: "#DBEAFE",
              color: "#1E40AF",
              accent: "#EFF6FF",
            },
            {
              label: "Avg. Revenue Per Booking",
              value: stats.completedBookings > 0 ? formatCurrency(stats.totalRevenue / stats.completedBookings) : "₱0.00",
              sub: `Based on ${stats.completedBookings} completed`,
              icon: <CalendarIcon />,
              bg: "#EDE9FE",
              color: "#5B21B6",
              accent: "#F5F3FF",
            },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)" }}>
              <div className="p-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: card.bg, color: card.color }}>
                  {card.icon}
                </div>
                <p className="text-3xl font-900 mb-1" style={{ fontFamily: "'Fraunces', serif", color: card.color }}>
                  {card.value}
                </p>
                <p className="text-xs font-700 mb-0.5" style={{ color: "var(--fur-slate)" }}>{card.label}</p>
                <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>{card.sub}</p>
              </div>
              <div style={{ height: 4, background: card.bg }}>
                <div style={{ height: 4, width: "100%", background: card.color, opacity: 0.4 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Booking Performance */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)" }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-800 text-base" style={{ color: "var(--fur-slate)" }}>Booking Performance</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x" style={{ borderColor: "var(--border)" }}>
            {[
              { label: "Total Bookings", value: stats.totalBookings, icon: <CalendarIcon />, color: "var(--fur-slate)" },
              { label: "Completed", value: stats.completedBookings, icon: <CheckIcon />, color: "#065F46", bg: "#D1FAE5" },
              { label: "Cancelled", value: stats.cancelledBookings, icon: <XIcon />, color: "#991B1B", bg: "#FEE2E2" },
              { label: "Pending", value: stats.pendingBookings, icon: <CalendarIcon />, color: "#92400E", bg: "#FEF3C7" },
            ].map((stat) => (
              <div key={stat.label} className="p-6">
                <p className="text-3xl font-900 mb-1" style={{ fontFamily: "'Fraunces', serif", color: stat.color }}>
                  {stat.value}
                </p>
                <p className="text-xs font-600" style={{ color: "var(--fur-slate-light)" }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Rate bars */}
          <div className="px-6 pb-6 pt-2 border-t space-y-4" style={{ borderColor: "var(--border)" }}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>Completion Rate</p>
                <span className="text-sm font-900" style={{ color: "#065F46", fontFamily: "'Fraunces', serif" }}>{completionRate}%</span>
              </div>
              <div className="h-3 rounded-full" style={{ background: "var(--fur-mist)" }}>
                <div className="h-3 rounded-full transition-all" style={{ width: `${completionRate}%`, background: "linear-gradient(90deg, #059669, #10B981)" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>Cancellation Rate</p>
                <span className="text-sm font-900" style={{ color: cancellationRate > 30 ? "#991B1B" : "#92400E", fontFamily: "'Fraunces', serif" }}>{cancellationRate}%</span>
              </div>
              <div className="h-3 rounded-full" style={{ background: "var(--fur-mist)" }}>
                <div className="h-3 rounded-full transition-all" style={{ width: `${cancellationRate}%`, background: cancellationRate > 30 ? "linear-gradient(90deg, #DC2626, #EF4444)" : "linear-gradient(90deg, #D97706, #F59E0B)" }} />
              </div>
              {cancellationRate > 30 && (
                <p className="text-xs mt-1 font-600" style={{ color: "#991B1B" }}>
                  ⚠️ High cancellation rate — consider investigating provider quality.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Provider Revenue Leaderboard */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-800 text-base" style={{ color: "var(--fur-slate)" }}>Revenue by Provider</h2>
            <div className="flex gap-2">
              {(["revenue", "bookings", "name"] as const).map((s) => (
                <button key={s} onClick={() => setSortBy(s)}
                  className="px-3 py-1.5 rounded-lg text-xs font-700 capitalize transition-all border"
                  style={sortBy === s ? { background: "var(--fur-teal)", color: "white", borderColor: "var(--fur-teal)" } : { background: "white", color: "var(--fur-slate-mid)", borderColor: "var(--border)" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {topProviders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-700" style={{ color: "var(--fur-slate)" }}>No verified providers yet</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {topProviders.map((provider, idx) => {
                const pct = Math.round((provider.totalRevenue / maxRevenue) * 100);
                return (
                  <div key={provider.id} className="px-6 py-4 flex items-center gap-4"
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-cream)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-900"
                      style={{ background: idx === 0 ? "#FEF3C7" : idx === 1 ? "#F1F5F9" : idx === 2 ? "#FEF3C7" : "var(--fur-mist)", color: idx === 0 ? "#92400E" : idx === 1 ? "#475569" : idx === 2 ? "#78350F" : "var(--fur-slate-mid)", fontFamily: "'Fraunces', serif" }}>
                      {idx + 1}
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "#EDE9FE", color: "#5B21B6" }}>
                      <BuildingIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-700 text-sm truncate" style={{ color: "var(--fur-slate)" }}>{provider.businessName}</p>
                        <p className="font-900 text-sm ml-4 shrink-0" style={{ fontFamily: "'Fraunces', serif", color: "#059669" }}>
                          {formatCurrency(provider.totalRevenue)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>{provider.bookingCount} bookings</span>
                        <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>{provider.serviceCount} services</span>
                        {provider.rating > 0 && <span className="text-xs" style={{ color: "#F59E0B" }}>⭐ {provider.rating}</span>}
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: "var(--fur-mist)" }}>
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #059669, #10B981)" }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default RevenueTab;