"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { type User } from "@/app/types";
import { useAppContext } from "@/app/contexts/AppContext";

interface TopNavbarProps {
  user: User;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ user, onToggleSidebar, isSidebarOpen }) => {
  const { vaccinationReminders } = useAppContext();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const overdueCount = vaccinationReminders.filter((r) => r.daysUntilDue < 0).length;
  const totalCount = vaccinationReminders.length;

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
          {/* Notification Bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="relative p-2 rounded-xl transition-colors"
              style={{ color: "var(--fur-slate-light)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-mist)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {totalCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 flex items-center justify-center rounded-full text-white text-xs font-700 px-1"
                  style={{ background: overdueCount > 0 ? "var(--fur-rose)" : "var(--fur-teal)", fontSize: "0.6rem" }}
                >
                  {totalCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {notifOpen && (
              <div
                className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl border overflow-hidden z-50"
                style={{ background: "white", borderColor: "var(--border)", fontFamily: "'Nunito', sans-serif" }}
              >
                {/* Header */}
                <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)", background: "var(--fur-cream)" }}>
                  <h3 className="font-800 text-sm" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
                    Vaccination Reminders
                  </h3>
                  {totalCount > 0 && (
                    <span className="text-xs font-700 px-2 py-0.5 rounded-full" style={{ background: overdueCount > 0 ? "#FEE2E2" : "var(--fur-teal-light)", color: overdueCount > 0 ? "#991B1B" : "var(--fur-teal-dark)" }}>
                      {totalCount} alert{totalCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="max-h-72 overflow-y-auto">
                  {totalCount === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: "#D1FAE5", color: "#065F46" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      <p className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>All vaccines up to date</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--fur-slate-light)" }}>No reminders in the next 30 days</p>
                    </div>
                  ) : (
                    vaccinationReminders.map((r, idx) => {
                      const isOverdue = r.daysUntilDue < 0;
                      const isSoon = r.daysUntilDue >= 0 && r.daysUntilDue <= 7;
                      const bgColor = isOverdue ? "#FFF5F5" : isSoon ? "#FFFBEB" : "white";
                      const badgeBg = isOverdue ? "#FEE2E2" : isSoon ? "#FEF3C7" : "var(--fur-teal-light)";
                      const badgeColor = isOverdue ? "#991B1B" : isSoon ? "#92400E" : "var(--fur-teal-dark)";
                      const label = isOverdue
                        ? `Overdue by ${Math.abs(r.daysUntilDue)} day${Math.abs(r.daysUntilDue) !== 1 ? "s" : ""}`
                        : r.daysUntilDue === 0
                        ? "Due today"
                        : `Due in ${r.daysUntilDue} day${r.daysUntilDue !== 1 ? "s" : ""}`;

                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-3 px-4 py-3 border-b"
                          style={{ borderColor: "var(--border)", background: bgColor }}
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: badgeBg }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={badgeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-700 truncate" style={{ color: "var(--fur-slate)" }}>{r.vaccineName}</p>
                            <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>{r.petName}</p>
                          </div>
                          <span className="text-xs font-700 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap" style={{ background: badgeBg, color: badgeColor }}>
                            {label}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t text-center" style={{ borderColor: "var(--border)" }}>
                  <Link
                    href="/owner/pets"
                    onClick={() => setNotifOpen(false)}
                    className="text-sm font-700"
                    style={{ color: "var(--fur-teal)" }}
                  >
                    Manage pet vaccinations →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
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
