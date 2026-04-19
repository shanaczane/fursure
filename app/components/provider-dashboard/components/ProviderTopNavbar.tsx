"use client";

import React, { useState, useEffect, useRef } from "react";
import { useProviderContext } from "../context/ProviderAppContext";
import type { ProviderNotification } from "../types";

interface TopNavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

/* ── Notification type config ──────────────────────────────────────────────── */
const NOTIF_CONFIG: Record<
  ProviderNotification["type"],
  { bg: string; color: string; icon: React.ReactNode }
> = {
  new_booking: {
    bg: "#DBEAFE", color: "#1E40AF",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  payment_submitted: {
    bg: "#D1FAE5", color: "#065F46",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  payment_overdue: {
    bg: "#FEE2E2", color: "#991B1B",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  edit_request: {
    bg: "#FEF3C7", color: "#92400E",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  },
  cancel_request: {
    bg: "#FEE2E2", color: "#991B1B",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
  },
  reschedule_accepted: {
    bg: "#D1FAE5", color: "#065F46",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
  reschedule_declined: {
    bg: "#FEE2E2", color: "#991B1B",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
  },
  new_review: {
    bg: "#FEF3C7", color: "#92400E",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
};

/* ── Relative time ─────────────────────────────────────────────────────────── */
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ── Component ─────────────────────────────────────────────────────────────── */
const ProviderTopNavbar: React.FC<TopNavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, bookings, notifications, unreadCount, markAsRead, markAllRead } = useProviderContext();
  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setOpen(false);
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
            suppressHydrationWarning
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden md:block">
            <p className="text-sm font-800" style={{ color: "var(--fur-slate)" }}>{user.businessName}</p>
            <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>Service Provider Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border"
              style={{ background: "#FFFBEB", borderColor: "#FCD34D" }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#F59E0B" }} />
              <span className="text-xs font-700" style={{ color: "#92400E" }}>
                {pendingCount} pending
              </span>
            </div>
          )}

          {/* ── Bell ── */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setOpen(v => !v)}
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
                      <span style={{ padding: "1px 7px", borderRadius: 9999, fontSize: "0.72rem", fontWeight: 700, background: "#FEF3C7", color: "#92400E" }}>
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--fur-teal)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
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
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#F59E0B", flexShrink: 0, marginTop: 4 }} />
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

          {/* ── Provider avatar ── */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>{user.name}</p>
              <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>{user.email}</p>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-700 text-sm"
              style={{ background: "linear-gradient(135deg, #3B4F6B, #1A2332)" }}>
              {user.avatar || user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProviderTopNavbar;
