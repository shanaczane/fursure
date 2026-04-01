"use client";

import React, { useState, useMemo } from "react";
import { useAdminContext, type ActivityLog } from "../context/AdminContext";
import AdminLayout from "../components/AdminLayout";

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
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

// SVG icons
const CalendarIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
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
const WrenchIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);
const RefreshIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const InboxIcon = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);
const ActivityIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const typeConfig: Record<ActivityLog["type"], { icon: React.ReactNode; bg: string; color: string; label: string }> = {
  booking:      { icon: <CalendarIcon />,    bg: "#DBEAFE", color: "#1E40AF", label: "Booking" },
  registration: { icon: <PersonIcon />,      bg: "#D1FAE5", color: "#065F46", label: "Registration" },
  verification: { icon: <CheckCircleIcon />, bg: "#FEF3C7", color: "#92400E", label: "Verification" },
  cancellation: { icon: <XCircleIcon />,     bg: "#FEE2E2", color: "#991B1B", label: "Cancellation" },
  service:      { icon: <WrenchIcon />,      bg: "#EDE9FE", color: "#5B21B6", label: "Service" },
};

const SystemActivityPage: React.FC = () => {
  const { activityLogs, isLoading, refreshData } = useAdminContext();
  const [filterType, setFilterType] = useState<ActivityLog["type"] | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filtered = useMemo(() => {
    return activityLogs.filter((log) => {
      if (filterType !== "all" && log.type !== filterType) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!log.description.toLowerCase().includes(q) && !(log.userName ?? "").toLowerCase().includes(q)) return false;
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
    activityLogs.forEach((log) => { counts[log.type] = (counts[log.type] ?? 0) + 1; });
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
            <span className={isRefreshing ? "animate-spin" : ""}><RefreshIcon /></span>
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
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
                  className="fur-input text-sm"
                  style={{ paddingLeft: "2.5rem" }}
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
                      <span style={{ color: filterType === type ? "white" : cfg.color }}>{cfg.icon}</span>
                      {cfg.label} ({typeCounts[type] ?? 0})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse"
                style={{ background: "var(--fur-mist)", color: "var(--fur-slate-light)" }}>
                <ActivityIcon size={22} />
              </div>
              <p className="font-700" style={{ color: "var(--fur-slate)" }}>Loading activity...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "var(--fur-mist)", color: "var(--fur-slate-light)" }}>
                <InboxIcon size={28} />
              </div>
              <p className="font-700" style={{ color: "var(--fur-slate)" }}>No activity found</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {filtered.map((log) => {
                const cfg = typeConfig[log.type];
                return (
                  <div key={log.id} className="px-6 py-4 flex items-start gap-4 transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-cream)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: cfg.bg, color: cfg.color }}>
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
                        <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--fur-slate-light)" }}>
                          <PersonIcon size={11} /> {log.userName}
                        </p>
                      )}
                    </div>
                    <div className="text-xs shrink-0" style={{ color: "var(--fur-slate-light)" }}>
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
