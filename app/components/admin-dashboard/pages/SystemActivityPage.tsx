"use client";

import React, { useState, useMemo } from "react";
import { useAdminContext, type ActivityLog } from "../context/AdminContext";
import AdminLayout from "../components/AdminLayout";

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRelativeTime = (dateStr: string) => {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
};

const typeConfig: Record<ActivityLog["type"], { icon: string; bg: string; color: string; label: string }> = {
  booking: { icon: "📅", bg: "#DBEAFE", color: "#1E40AF", label: "Booking" },
  registration: { icon: "👤", bg: "#D1FAE5", color: "#065F46", label: "Registration" },
  verification: { icon: "✅", bg: "#FEF3C7", color: "#92400E", label: "Verification" },
  cancellation: { icon: "❌", bg: "#FEE2E2", color: "#991B1B", label: "Cancellation" },
  service: { icon: "🐾", bg: "#EDE9FE", color: "#5B21B6", label: "Service" },
};

const SystemActivityPage: React.FC = () => {
  const { activityLogs, stats, users, providers, isLoading, refreshData } = useAdminContext();
  const [filterType, setFilterType] = useState<ActivityLog["type"] | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filtered = useMemo(() => {
    return activityLogs.filter((log) => {
      if (filterType !== "all" && log.type !== filterType) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !log.description.toLowerCase().includes(q) &&
          !(log.userName ?? "").toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [activityLogs, filterType, searchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: activityLogs.length };
    activityLogs.forEach((log) => {
      counts[log.type] = (counts[log.type] ?? 0) + 1;
    });
    return counts;
  }, [activityLogs]);

  return (
    <AdminLayout>
      <div className="space-y-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-900 mb-1" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
              System Activity
            </h1>
            <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>
              Real-time overview of all platform activity and events.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-secondary flex items-center gap-2 px-4 py-2 disabled:opacity-60"
          >
            <span className={isRefreshing ? "animate-spin" : ""}>🔄</span>
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Bookings", value: stats.totalBookings, icon: "📅", bg: "#DBEAFE", color: "#1E40AF" },
            { label: "Completed", value: stats.completedBookings, icon: "✅", bg: "#D1FAE5", color: "#065F46" },
            { label: "Cancelled", value: stats.cancelledBookings, icon: "❌", bg: "#FEE2E2", color: "#991B1B" },
            { label: "New Users (30d)", value: users.filter(u => {
              const d = new Date(u.createdAt);
              const now = new Date();
              return (now.getTime() - d.getTime()) < 30 * 24 * 60 * 60 * 1000;
            }).length, icon: "👤", bg: "#EDE9FE", color: "#5B21B6" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-5 border" style={{ background: "white", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{ background: s.bg }}>
                  {s.icon}
                </div>
              </div>
              <p className="text-2xl font-900 mb-0.5" style={{ fontFamily: "'Fraunces', serif", color: s.color }}>{s.value}</p>
              <p className="text-xs font-600" style={{ color: "var(--fur-slate-light)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Platform Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl p-5 border" style={{ background: "white", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ background: "#10B981" }} />
              <p className="font-700 text-sm" style={{ color: "var(--fur-slate)" }}>Platform Health</p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Booking Success Rate", value: stats.totalBookings > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0, suffix: "%" },
                { label: "Provider Verified Rate", value: providers.length > 0 ? Math.round((providers.filter(p => p.isVerified).length / providers.length) * 100) : 0, suffix: "%" },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-600" style={{ color: "var(--fur-slate-mid)" }}>{metric.label}</span>
                    <span className="text-xs font-800" style={{ color: "var(--fur-slate)" }}>{metric.value}{metric.suffix}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: "var(--fur-mist)" }}>
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${metric.value}%`,
                        background: metric.value >= 70 ? "#10B981" : metric.value >= 40 ? "#F59E0B" : "#EF4444"
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-5 border" style={{ background: "white", borderColor: "var(--border)" }}>
            <p className="font-700 text-sm mb-4" style={{ color: "var(--fur-slate)" }}>Activity Breakdown</p>
            <div className="space-y-2">
              {(Object.keys(typeConfig) as ActivityLog["type"][]).map((type) => {
                const cfg = typeConfig[type];
                const count = typeCounts[type] ?? 0;
                const total = activityLogs.length || 1;
                return (
                  <div key={type} className="flex items-center gap-2">
                    <span className="text-base">{cfg.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span style={{ color: "var(--fur-slate-mid)" }}>{cfg.label}</span>
                        <span className="font-700" style={{ color: "var(--fur-slate)" }}>{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: "var(--fur-mist)" }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${(count / total) * 100}%`, background: cfg.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl p-5 border" style={{ background: "white", borderColor: "var(--border)" }}>
            <p className="font-700 text-sm mb-4" style={{ color: "var(--fur-slate)" }}>Quick Stats</p>
            <div className="space-y-3">
              {[
                { label: "Total Revenue", value: new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(stats.totalRevenue), icon: "💰" },
                { label: "Active Services", value: `${stats.activeServices} services`, icon: "🐾" },
                { label: "Pending Verifications", value: `${stats.pendingVerifications} providers`, icon: "⏳" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--fur-cream)" }}>
                  <span className="text-lg">{s.icon}</span>
                  <div>
                    <p className="text-xs font-600" style={{ color: "var(--fur-slate-mid)" }}>{s.label}</p>
                    <p className="text-sm font-800" style={{ color: "var(--fur-slate)" }}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)" }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search activity..."
                  className="fur-input pl-10 text-sm"
                />
                <svg className="w-4 h-4 absolute left-3 top-3.5" style={{ color: "var(--fur-slate-light)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterType("all")}
                  className="px-3 py-1.5 rounded-full text-xs font-700 border-2 transition-all"
                  style={filterType === "all"
                    ? { background: "var(--fur-teal)", color: "white", borderColor: "var(--fur-teal)" }
                    : { background: "white", color: "var(--fur-slate-mid)", borderColor: "var(--border)" }}>
                  All ({typeCounts.all})
                </button>
                {(Object.keys(typeConfig) as ActivityLog["type"][]).map((type) => {
                  const cfg = typeConfig[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-700 border-2 transition-all"
                      style={filterType === type
                        ? { background: "var(--fur-teal)", color: "white", borderColor: "var(--fur-teal)" }
                        : { background: "white", color: "var(--fur-slate-mid)", borderColor: "var(--border)" }}>
                      {cfg.icon} {cfg.label} ({typeCounts[type] ?? 0})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <p className="text-3xl mb-3 animate-pulse">📋</p>
              <p className="font-700" style={{ color: "var(--fur-slate)" }}>Loading activity...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-700" style={{ color: "var(--fur-slate)" }}>No activity found</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {filtered.map((log) => {
                const cfg = typeConfig[log.type];
                return (
                  <div key={log.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 mt-0.5"
                      style={{ background: cfg.bg }}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-700 px-2 py-0.5 rounded-full"
                          style={{ background: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                        <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                          {getRelativeTime(log.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm font-600" style={{ color: "var(--fur-slate)" }}>{log.description}</p>
                      {log.userName && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--fur-slate-light)" }}>
                          👤 {log.userName}
                        </p>
                      )}
                    </div>
                    <div className="text-xs flex-shrink-0" style={{ color: "var(--fur-slate-light)" }}>
                      {formatDate(log.createdAt)}
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

export default SystemActivityPage;