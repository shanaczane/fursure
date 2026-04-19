"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { type User, type OwnerNotification } from "@/app/types";
import { useAppContext } from "@/app/contexts/AppContext";

interface TopNavbarProps {
  user: User;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

/* ── Notification type config ──────────────────────────────────────────────── */
const NOTIF_CONFIG: Record<
  OwnerNotification["type"],
  { bg: string; color: string; icon: React.ReactNode }
> = {
  booking_confirmed: {
    bg: "#D1FAE5", color: "#065F46",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
  booking_declined: {
    bg: "#FEE2E2", color: "#991B1B",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
  },
  reschedule_proposal: {
    bg: "#EDE9FE", color: "#5B21B6",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  payment_required: {
    bg: "#FFEDD5", color: "#9A3412",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  review_pending: {
    bg: "#FEF3C7", color: "#92400E",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  edit_approved: {
    bg: "#DBEAFE", color: "#1E40AF",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  },
  cancel_approved: {
    bg: "#F3F4F6", color: "#374151",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
  vaccine_overdue: {
    bg: "#FEE2E2", color: "#991B1B",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  vaccine_due: {
    bg: "#FEF3C7", color: "#92400E",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  // ── Provider recorded a vaccination ──────────────────────────────────────
  vaccine_recorded: {
    bg: "#D1FAE5", color: "#065F46",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
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

/* ── Vaccine-activity notification types ───────────────────────────────────── */
const VACCINE_ACTIVITY_TYPES: OwnerNotification["type"][] = [
  "vaccine_overdue",
  "vaccine_due",
  "vaccine_recorded",
];

/* ── Component ─────────────────────────────────────────────────────────────── */
const TopNavbar: React.FC<TopNavbarProps> = ({ user, onToggleSidebar, isSidebarOpen }) => {
  const { notifications, unreadCount, markAsRead, markAllRead } = useAppContext();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const hasVaccineActivity = notifications.some((n) =>
    VACCINE_ACTIVITY_TYPES.includes(n.type)
  );

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
        </div>

        <div className="flex items-center gap-3">
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
                  background: "var(--fur-teal)", color: "white",
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
                      <span style={{ padding: "1px 7px", borderRadius: 9999, fontSize: "0.72rem", fontWeight: 700, background: "var(--fur-teal-light)", color: "var(--fur-teal-dark)" }}>
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
                      <p style={{ fontSize: "0.78rem", color: "var(--fur-slate-light)" }}>No new activity to show.</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const cfg = NOTIF_CONFIG[n.type];
                      const isVaxRecorded = n.type === "vaccine_recorded";
                      return (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          style={{
                            display: "flex", alignItems: "flex-start", gap: 12,
                            padding: "12px 16px", cursor: "pointer",
                            borderBottom: "1px solid var(--border)",
                            background: !n.read
                              ? (isVaxRecorded ? "#F0FDF4" : "#F0FDF9")
                              : "white",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-cream)")}
                          onMouseLeave={e => (e.currentTarget.style.background = !n.read ? (isVaxRecorded ? "#F0FDF4" : "#F0FDF9") : "white")}
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
                              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--fur-slate)", whiteSpace: "nowrap" }}>{n.title}</p>
                                {isVaxRecorded && (
                                  <span style={{
                                    fontSize: "0.65rem", fontWeight: 700,
                                    padding: "1px 6px", borderRadius: 9999,
                                    background: "#D1FAE5", color: "#065F46",
                                    whiteSpace: "nowrap",
                                  }}>
                                    ✓ Recorded
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize: "0.72rem", color: "var(--fur-slate-light)", whiteSpace: "nowrap", flexShrink: 0 }}>{relativeTime(n.createdAt)}</p>
                            </div>
                            <p style={{ fontSize: "0.78rem", color: "var(--fur-slate-mid)", lineHeight: 1.4 }}>{n.description}</p>
                          </div>
                          {!n.read && (
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--fur-teal)", flexShrink: 0, marginTop: 4 }} />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                {hasVaccineActivity && (
                  <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
                    <Link
                      href="/owner/pets"
                      onClick={() => setOpen(false)}
                      style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--fur-teal)", textDecoration: "none" }}
                    >
                      Manage pet vaccinations →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Profile ── */}
          <Link href="/owner/profile" className="flex items-center gap-3 rounded-xl px-2 py-1 transition-colors"
            style={{ textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-mist)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>{user.name}</p>
              <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>Pet Owner</p>
            </div>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-700 text-sm"
              style={{ background: "linear-gradient(135deg, var(--fur-teal), var(--fur-teal-dark))" }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;