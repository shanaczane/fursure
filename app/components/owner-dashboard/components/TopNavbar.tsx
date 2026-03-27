"use client";

import React from "react";
import { type User } from "@/app/types";

interface TopNavbarProps {
  user: User;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ user, onToggleSidebar, isSidebarOpen }) => {
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
            <div className="relative">
              <input
                type="text"
                placeholder="Search services..."
                className="pl-10 pr-4 py-2 text-sm rounded-xl border"
                style={{ borderColor: "var(--border)", background: "white", color: "var(--fur-slate)", width: 240, fontFamily: "'Nunito', sans-serif", outline: "none" }}
              />
              <svg className="w-4 h-4 absolute left-3 top-2.5" style={{ color: "var(--fur-slate-light)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-xl transition-colors"
            style={{ color: "var(--fur-slate-light)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-mist)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "var(--fur-rose)" }} />
          </button>

          <div className="flex items-center gap-3">
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;