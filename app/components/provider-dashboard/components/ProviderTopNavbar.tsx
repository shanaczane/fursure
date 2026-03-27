"use client";

import React from "react";
import { useProviderContext } from "../context/ProviderAppContext";

interface TopNavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const ProviderTopNavbar: React.FC<TopNavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, bookings } = useProviderContext();
  const pendingCount = bookings.filter(b => b.status === "pending").length;

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

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>{user.name}</p>
              <div className="flex items-center justify-end gap-1">
                <span className="text-xs">⭐</span>
                <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>{user.rating}</span>
              </div>
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