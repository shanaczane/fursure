"use client";

import React from "react";
import { useAdminContext } from "../context/AdminContext";

interface TopNavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const AdminTopNavbar: React.FC<TopNavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { admin, stats } = useAdminContext();

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