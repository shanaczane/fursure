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

const AdminDashboardPage: React.FC = () => {
  const { admin, stats, providers, users, activityLogs, isLoading } = useAdminContext();

  const pendingProviders = providers.filter((p) => !p.isVerified).slice(0, 4);
  const recentUsers = users.slice(0, 5);

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "#3B82F6", bg: "#DBEAFE" },
    { label: "Providers", value: stats.totalProviders, icon: "🏢", color: "#8B5CF6", bg: "#EDE9FE" },
    { label: "Total Bookings", value: stats.totalBookings, icon: "📅", color: "var(--fur-teal)", bg: "var(--fur-teal-light)" },
    { label: "Pending Verify", value: stats.pendingVerifications, icon: "⏳", color: "#F59E0B", bg: "#FEF3C7" },
    { label: "Active Services", value: stats.activeServices, icon: "🐾", color: "#059669", bg: "#D1FAE5" },
    { label: "Revenue (PHP)", value: formatCurrency(stats.totalRevenue), icon: "💰", color: "#DC2626", bg: "#FEE2E2" },
  ];

  const quickActions = [
    { label: "Verify Providers", icon: "✅", href: "/admin/providers", color: "#D1FAE5", accent: "#065F46" },
    { label: "Manage Users", icon: "👥", href: "/admin/users", color: "#DBEAFE", accent: "#1E40AF" },
    { label: "System Activity", icon: "📋", href: "/admin/activity", color: "#EDE9FE", accent: "#5B21B6" },
    { label: "Moderation", icon: "🛡️", href: "/admin/moderation", color: "#FEF3C7", accent: "#92400E" },
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
            <p className="text-3xl mb-3 animate-pulse">🔑</p>
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
                <p className="text-sm font-600 mb-1" style={{ color: "#7A90A8" }}>{getGreeting()} 🔑</p>
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
                <span className="text-xl">🛡️</span>
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
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base mb-3" style={{ background: s.bg }}>
                    {s.icon}
                  </div>
                  <p className="text-lg font-900 text-white mb-0.5" style={{ fontFamily: "'Fraunces', serif", fontSize: typeof s.value === "string" ? "0.85rem" : undefined }}>
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
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: action.color }}>
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
                <p className="text-3xl mb-3">✅</p>
                <p className="font-700" style={{ color: "var(--fur-slate)" }}>All providers verified!</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {pendingProviders.map((provider) => (
                  <div key={provider.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: "#EDE9FE" }}>
                        🏢
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
                <p className="text-3xl mb-3">📋</p>
                <p className="font-700" style={{ color: "var(--fur-slate)" }}>No recent activity</p>
              </div>
            ) : (
              <div className="divide-y overflow-y-auto max-h-80" style={{ borderColor: "var(--border)" }}>
                {activityLogs.slice(0, 8).map((log) => {
                  const typeConfig = {
                    booking: { icon: "📅", bg: "#DBEAFE", color: "#1E40AF" },
                    registration: { icon: "👤", bg: "#D1FAE5", color: "#065F46" },
                    verification: { icon: "✅", bg: "#FEF3C7", color: "#92400E" },
                    cancellation: { icon: "❌", bg: "#FEE2E2", color: "#991B1B" },
                    service: { icon: "🐾", bg: "#EDE9FE", color: "#5B21B6" },
                  }[log.type];

                  return (
                    <div key={log.id} className="px-6 py-3 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                        style={{ background: typeConfig.bg }}>
                        {typeConfig.icon}
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
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
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