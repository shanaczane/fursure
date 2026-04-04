"use client";

import React from "react";
import Link from "next/link";
import { useAdminContext } from "../context/AdminContext";
import AdminLayout from "../components/AdminLayout";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const UsersIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const BuildingIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const ClockIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const ShieldIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const CheckCircleIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
  </svg>
);
const KeyIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);
const MoneyIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const CalendarIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const AdminDashboardPage: React.FC = () => {
  const { admin, stats, providers, users, isLoading } = useAdminContext();

  const pendingProviders = providers.filter((p) => !p.isVerified && !p.isRejected).slice(0, 4);
  const recentUsers = users.filter((u) => u.role !== "admin").slice(0, 5);
  const ownerCount = users.filter((u) => u.role === "owner").length;
  const providerCount = providers.length;
  const verifiedProviderCount = providers.filter((p) => p.isVerified).length;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const statCards = [
    { label: "Pet Owners", value: ownerCount, icon: <UsersIcon />, color: "#3B82F6", bg: "#DBEAFE" },
    { label: "Providers", value: `${verifiedProviderCount}/${providerCount}`, icon: <BuildingIcon />, color: "#8B5CF6", bg: "#EDE9FE", sub: "verified/total" },
    { label: "Pending Verify", value: stats.pendingVerifications, icon: <ClockIcon />, color: "#F59E0B", bg: "#FEF3C7" },
    { label: "Total Bookings", value: stats.totalBookings, icon: <CalendarIcon />, color: "#10B981", bg: "#D1FAE5" },
  ];

  const revenueCards = [
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: <MoneyIcon />, color: "#065F46", bg: "#D1FAE5" },
    { label: "This Month", value: formatCurrency(stats.monthlyRevenue), icon: <MoneyIcon />, color: "#1E40AF", bg: "#DBEAFE" },
    { label: "Completed", value: stats.completedBookings, icon: <CheckCircleIcon />, color: "#065F46", bg: "#D1FAE5" },
    { label: "Pending", value: stats.pendingBookings, icon: <ClockIcon />, color: "#92400E", bg: "#FEF3C7" },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse"
              style={{ background: "#FEE2E2", color: "#EF4444" }}>
              <KeyIcon />
            </div>
            <p className="font-700" style={{ color: "var(--fur-slate)" }}>Loading admin data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {/* Welcome Banner */}
        <div className="rounded-2xl overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #1A2332 0%, #2D4A6B 100%)" }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-1/2 translate-x-1/4"
            style={{ background: "#EF4444" }} />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <p className="text-sm font-600 mb-1" style={{ color: "#7A90A8" }}>{getGreeting()}</p>
                <h1 className="text-2xl md:text-3xl font-900 text-white" style={{ fontFamily: "'Fraunces', serif" }}>
                  System Overview
                </h1>
                <p className="text-sm mt-1" style={{ color: "#7A90A8" }}>
                  {stats.pendingVerifications > 0
                    ? `${stats.pendingVerifications} provider${stats.pendingVerifications !== 1 ? "s" : ""} awaiting verification`
                    : "All systems operational."}
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span style={{ color: "#EF4444" }}><ShieldIcon size={18} /></span>
                <div>
                  <p className="text-sm font-700 text-white">{admin.name}</p>
                  <p className="text-xs" style={{ color: "#EF4444" }}>Administrator</p>
                </div>
              </div>
            </div>

            {/* User/Provider Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {statCards.map((s) => (
                <div key={s.label} className="rounded-xl p-4"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: s.bg, color: s.color }}>
                    {s.icon}
                  </div>
                  <p className="text-lg font-900 text-white mb-0.5" style={{ fontFamily: "'Fraunces', serif" }}>{s.value}</p>
                  <p className="text-xs font-600" style={{ color: "#7A90A8" }}>{s.label}</p>
                  {(s as any).sub && <p className="text-xs" style={{ color: "#4A6280" }}>{(s as any).sub}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Section */}
        <div className="rounded-2xl overflow-hidden border" style={{ background: "white", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: "var(--border)", background: "#F0FDF4" }}>
            <div className="flex items-center gap-3">
              <span style={{ color: "#059669" }}><MoneyIcon size={18} /></span>
              <h2 className="font-800 text-base" style={{ color: "var(--fur-slate)" }}>Revenue & Bookings</h2>
            </div>
            <Link href="/admin/activity" className="text-sm font-700" style={{ color: "var(--fur-teal)" }}>
              View activity →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-y sm:divide-y-0"
            style={{ borderColor: "var(--border)" }}>
            {revenueCards.map((card) => (
              <div key={card.label} className="p-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: card.bg, color: card.color }}>
                  {card.icon}
                </div>
                <p className="text-2xl font-900 mb-1" style={{ fontFamily: "'Fraunces', serif", color: card.color }}>
                  {card.value}
                </p>
                <p className="text-xs font-600" style={{ color: "var(--fur-slate-light)" }}>{card.label}</p>
              </div>
            ))}
          </div>

          {/* Revenue by Provider */}
          {providers.filter(p => p.totalRevenue > 0).length > 0 && (
            <div className="border-t px-6 py-4" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-700 uppercase tracking-widest mb-4" style={{ color: "var(--fur-slate-mid)" }}>
                Top Earning Providers
              </p>
              <div className="space-y-3">
                {providers
                  .filter(p => p.isVerified && p.totalRevenue > 0)
                  .sort((a, b) => b.totalRevenue - a.totalRevenue)
                  .slice(0, 5)
                  .map((provider) => {
                    const maxRev = Math.max(...providers.map(p => p.totalRevenue), 1);
                    const pct = Math.round((provider.totalRevenue / maxRev) * 100);
                    return (
                      <div key={provider.id} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "#EDE9FE", color: "#5B21B6" }}>
                          <BuildingIcon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-700 truncate" style={{ color: "var(--fur-slate)" }}>
                              {provider.businessName}
                            </p>
                            <p className="text-sm font-700 ml-2 shrink-0" style={{ color: "#059669" }}>
                              {formatCurrency(provider.totalRevenue)}
                            </p>
                          </div>
                          <div className="h-1.5 rounded-full" style={{ background: "var(--fur-mist)" }}>
                            <div className="h-1.5 rounded-full transition-all"
                              style={{ width: `${pct}%`, background: "linear-gradient(90deg, #059669, #10B981)" }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Pending Verifications */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: pendingProviders.length ? "#FEF3C7" : "var(--border)", background: pendingProviders.length ? "#FFFBEB" : "white" }}>
            <div className="flex items-center gap-3">
              {pendingProviders.length > 0 && (
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "#F59E0B" }} />
              )}
              <h2 className="font-800 text-base" style={{ color: "var(--fur-slate)" }}>Pending Verifications</h2>
              <span className="text-xs font-700 px-2 py-0.5 rounded-full"
                style={{ background: "#FEF3C7", color: "#92400E" }}>
                {stats.pendingVerifications}
              </span>
            </div>
            <Link href="/admin/providers" className="text-sm font-700" style={{ color: "var(--fur-teal)" }}>
              View all →
            </Link>
          </div>
          {pendingProviders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "#D1FAE5", color: "#059669" }}>
                <CheckCircleIcon size={22} />
              </div>
              <p className="font-700" style={{ color: "var(--fur-slate)" }}>All providers verified!</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {pendingProviders.map((provider) => (
                <div key={provider.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "#EDE9FE", color: "#5B21B6" }}>
                      <BuildingIcon />
                    </div>
                    <div>
                      <p className="font-700 text-sm" style={{ color: "var(--fur-slate)" }}>{provider.businessName}</p>
                      <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                        {provider.email} · {provider.serviceCount} services
                        {(provider.validIdUrl || provider.credentialsUrl) && (
                          <span className="ml-2 font-700" style={{ color: "#059669" }}>
                            · Docs submitted ✓
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Link href="/admin/providers"
                    className="text-xs font-700 px-3 py-1.5 rounded-xl"
                    style={{ background: "#FEF3C7", color: "#92400E" }}>
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Registrations */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-3">
              <h2 className="font-800 text-base" style={{ color: "var(--fur-slate)" }}>Recent Registrations</h2>
              <span className="text-xs font-600 px-2 py-0.5 rounded-full"
                style={{ background: "#DBEAFE", color: "#1E40AF" }}>
                {ownerCount} owners · {providerCount} providers
              </span>
            </div>
            <Link href="/admin/users" className="text-sm font-700" style={{ color: "var(--fur-teal)" }}>
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid var(--border)` }}>
                  {["User", "Role", "Bookings", "Joined"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-700 uppercase tracking-wide"
                      style={{ color: "var(--fur-slate-light)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {recentUsers.map((user) => (
                  <tr key={user.id}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-cream)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-700"
                          style={{ background: "linear-gradient(135deg, var(--fur-teal), var(--fur-teal-dark))" }}>
                          {(user.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-700 text-sm" style={{ color: "var(--fur-slate)" }}>{user.name}</p>
                          <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-700 px-2 py-1 rounded-full capitalize"
                        style={{
                          background: user.role === "provider" ? "#EDE9FE" : "var(--fur-teal-light)",
                          color: user.role === "provider" ? "#5B21B6" : "var(--fur-teal-dark)",
                        }}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-600" style={{ color: "var(--fur-slate)" }}>
                        {user.bookingCount ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                        {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>No users found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;