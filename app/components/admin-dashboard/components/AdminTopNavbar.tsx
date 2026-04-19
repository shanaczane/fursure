"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAdminContext } from "../context/AdminContext";
import type { AdminNotification } from "../context/AdminContext";

interface TopNavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

/* ── Notification type config ──────────────────────────────────────────────── */
const NOTIF_CONFIG: Record<
  AdminNotification["type"],
  { bg: string; color: string; icon: React.ReactNode }
> = {
  booking: {
    bg: "#DBEAFE",
    color: "#1E40AF",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  cancellation: {
    bg: "#FEE2E2",
    color: "#991B1B",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
  },
  registration: {
    bg: "#D1FAE5",
    color: "#065F46",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  verification: {
    bg: "#FEF3C7",
    color: "#92400E",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
};

/* ── Relative time helper ──────────────────────────────────────────────────── */
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ── Component ─────────────────────────────────────────────────────────────── */
const AdminTopNavbar: React.FC<TopNavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { admin, stats, notifications, unreadCount, markAsRead, markAllRead } = useAdminContext();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <header
      className={`fixed top-0 right-0 h-16 z-30 border-b ${isSidebarOpen ? "left-0 lg:left-64" : "left-0"}`}
      style={{ background: "rgba(253,248,240,0.95)", backdropFilter: "blur(8px)", borderColor: "var(--border)", fontFamily: "'Nunito', sans-serif", transition: "left 300ms ease-in-out" }}
    >
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl transition-colors"
            style={{ color: "var(--fur-slate-light)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-mist)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden md:block">
            <p className="text-sm font-800" style={{ color: "var(--fur-slate)" }}>Admin Control Panel</p>
            <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>FurSure System Administration</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {stats.pendingVerifications > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border"
              style={{ background: "#FEF2F2", borderColor: "#FCA5A5" }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#EF4444" }} />
              <span className="text-xs font-700" style={{ color: "#991B1B" }}>
                {stats.pendingVerifications} pending
              </span>
            </div>
          )}

          {/* ── Bell ── */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setOpen((v) => !v)}
              style={{
                position: "relative", width: 38, height: 38, borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: open ? "1.5px solid var(--border)" : "1.5px solid transparent",
                background: open ? "var(--fur-mist)" : "transparent",
                color: "var(--fur-slate-mid)", cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (!open) e.currentTarget.style.background = "var(--fur-mist)"; }}
              onMouseLeave={e => { if (!open) e.currentTarget.style.background = "transparent"; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: 4, right: 4,
                  minWidth: 16, height: 16, borderRadius: 9999,
                  background: "#EF4444", color: "white",
                  fontSize: "0.6rem", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 3px", border: "1.5px solid white",
                }}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* ── Dropdown ── */}
            {open && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                width: 340, maxHeight: 420,
                background: "white", border: "1px solid var(--border)",
                borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                display: "flex", flexDirection: "column",
                overflow: "hidden", zIndex: 50,
                fontFamily: "'Nunito', sans-serif",
              }}>
                {/* Header */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px 10px",
                  borderBottom: "1px solid var(--border)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--fur-slate)" }}>Notifications</p>
                    {unreadCount > 0 && (
                      <span style={{
                        padding: "1px 7px", borderRadius: 9999, fontSize: "0.72rem", fontWeight: 700,
                        background: "#FEE2E2", color: "#991B1B",
                      }}>
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{ fontSize: "0.75rem", fontWeight: 600, color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div style={{ overflowY: "auto", flex: 1 }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "36px 16px", textAlign: "center" }}>
                      <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>🔔</div>
                      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--fur-slate)", marginBottom: 4 }}>All caught up!</p>
                      <p style={{ fontSize: "0.78rem", color: "var(--fur-slate-light)" }}>No recent activity to show.</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const cfg = NOTIF_CONFIG[n.type];
                      return (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          style={{
                            display: "flex", alignItems: "flex-start", gap: 12,
                            padding: "12px 16px", cursor: "pointer",
                            borderBottom: "1px solid var(--border)",
                            background: !n.read ? "#FFFBF7" : "white",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-cream)")}
                          onMouseLeave={e => (e.currentTarget.style.background = !n.read ? "#FFFBF7" : "white")}
                        >
                          <div style={{
                            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: cfg.bg, color: cfg.color,
                          }}>
                            {cfg.icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
                              <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--fur-slate)", whiteSpace: "nowrap" }}>{n.title}</p>
                              <p style={{ fontSize: "0.72rem", color: "var(--fur-slate-light)", whiteSpace: "nowrap", flexShrink: 0 }}>{relativeTime(n.createdAt)}</p>
                            </div>
                            <p style={{ fontSize: "0.78rem", color: "var(--fur-slate-mid)", lineHeight: 1.4 }}>{n.description}</p>
                          </div>
                          {!n.read && (
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#EF4444", flexShrink: 0, marginTop: 4 }} />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {notifications.length > 0 && (
                  <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--fur-slate-light)" }}>
                      Showing activity from the last 48 hours
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Admin avatar ── */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>{admin.name}</p>
              <p className="text-xs" style={{ color: "#EF4444" }}>Administrator</p>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-700 text-sm"
              style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)" }}>
              {admin.name.charAt(0).toUpperCase() || "A"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopNavbar;
