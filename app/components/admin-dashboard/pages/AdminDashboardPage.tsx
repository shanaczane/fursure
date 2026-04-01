"use client";

import React from "react";
import Link from "next/link";
import { useAdminContext } from "../context/AdminContext";
import AdminLayout from "../components/AdminLayout";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

// SVG Icons
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
const CalendarIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const ClockIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const WrenchIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);
const EarningsIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const ShieldCheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
  </svg>
);
const ShieldIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const ActivityIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const PersonIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
  </svg>
);
const CheckCircleIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
  </svg>
);
const XCircleIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const KeyIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const activityTypeConfig = {
  booking: { icon: <CalendarIcon />, bg: "#DBEAFE", color: "#1E40AF" },
  registration: { icon: <PersonIcon />, bg: "#D1FAE5", color: "#065F46" },
  verification: { icon: <CheckCircleIcon />, bg: "#FEF3C7", color: "#92400E" },
  cancellation: { icon: <XCircleIcon />, bg: "#FEE2E2", color: "#991B1B" },
  service: { icon: <WrenchIcon />, bg: "#EDE9FE", color: "#5B21B6" },
};

const AdminDashboardPage: React.FC = () => {
  const { admin, stats, providers, users, activityLogs, isLoading } = useAdminContext();

  const pendingProviders = providers.filter((p) => !p.isVerified).slice(0, 4);
  const recentUsers = users.slice(0, 5);

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: <UsersIcon />, color: "#3B82F6", bg: "#DBEAFE" },
    { label: "Providers", value: stats.totalProviders, icon: <BuildingIcon />, color: "#8B5CF6", bg: "#EDE9FE" },
    { label: "Total Bookings", value: stats.totalBookings, icon: <CalendarIcon />, color: "var(--fur-teal)", bg: "var(--fur-teal-light)" },
    { label: "Pending Verify", value: stats.pendingVerifications, icon: <ClockIcon />, color: "#F59E0B", bg: "#FEF3C7" },
    { label: "Active Services", value: stats.activeServices, icon: <WrenchIcon />, color: "#059669", bg: "#D1FAE5" },
    { label: "Revenue (PHP)", value: formatCurrency(stats.totalRevenue), icon: <EarningsIcon />, color: "#DC2626", bg: "#FEE2E2" },
  ];

  const quickActions = [
    { label: "Verify Providers", icon: <ShieldCheckIcon size={20} />, href: "/admin/providers", color: "#D1FAE5", accent: "#065F46" },
    { label: "Manage Users", icon: <UsersIcon size={20} />, href: "/admin/users", color: "#DBEAFE", accent: "#1E40AF" },
    { label: "System Activity", icon: <ActivityIcon size={20} />, href: "/admin/activity", color: "#EDE9FE", accent: "#5B21B6" },
    { label: "Moderation", icon: <ShieldIcon size={20} />, href: "/admin/moderation", color: "#FEF3C7", accent: "#92400E" },
  ];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

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
          <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-5 translate-y-1/2"
            style={{ background: "var(--fur-teal)" }} />

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

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {statCards.map((s) => (
                <div key={s.label} className="rounded-xl p-4"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: s.bg, color: s.color }}>
                    {s.icon}
                  </div>
                  <p className="text-lg font-900 text-white mb-0.5"
                    style={{ fontFamily: "'Fraunces', serif", fontSize: typeof s.value === "string" ? "0.85rem" : undefined }}>
                    {s.value}
                  </p>
                  <p className="text-xs font-600" style={{ color: "#7A90A8" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-800 text-base mb-4" style={{ color: "var(--fur-slate)" }}>Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}
                className="rounded-2xl p-5 border-2 transition-all card-hover block"
                style={{ background: "white", borderColor: "var(--border)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: action.color, color: action.accent }}>
                  {action.icon}
                </div>
                <p className="font-800 text-sm" style={{ color: "var(--fur-slate)" }}>{action.label}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        </p>
                      </div>
                    </div>
                    <Link href="/admin/providers"
                      className="text-xs font-700 px-3 py-1.5 rounded-xl transition-colors"
                      style={{ background: "#FEF3C7", color: "#92400E" }}>
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="font-800 text-base" style={{ color: "var(--fur-slate)" }}>Recent Activity</h2>
              <Link href="/admin/activity" className="text-sm font-700" style={{ color: "var(--fur-teal)" }}>
                View all →
              </Link>
            </div>
            {activityLogs.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "var(--fur-mist)", color: "var(--fur-slate-light)" }}>
                  <ActivityIcon size={22} />
                </div>
                <p className="font-700" style={{ color: "var(--fur-slate)" }}>No recent activity</p>
              </div>
            ) : (
              <div className="divide-y overflow-y-auto max-h-80" style={{ borderColor: "var(--border)" }}>
                {activityLogs.slice(0, 8).map((log) => {
                  const cfg = activityTypeConfig[log.type as keyof typeof activityTypeConfig] ?? activityTypeConfig.service;
                  return (
                    <div key={log.id} className="px-6 py-3 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-600 truncate" style={{ color: "var(--fur-slate)" }}>
                          {log.description}
                        </p>
                        <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                          {log.userName} · {formatDate(log.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-800 text-base" style={{ color: "var(--fur-slate)" }}>Recent Registrations</h2>
            <Link href="/admin/users" className="text-sm font-700" style={{ color: "var(--fur-teal)" }}>
              Manage users →
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
                          background: user.role === "provider" ? "#EDE9FE" : user.role === "admin" ? "#FEE2E2" : "var(--fur-teal-light)",
                          color: user.role === "provider" ? "#5B21B6" : user.role === "admin" ? "#991B1B" : "var(--fur-teal-dark)",
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
