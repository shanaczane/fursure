"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  upcomingBookingsCount?: number;
}

const Icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  services: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  bookings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  pets: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  profile: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, upcomingBookingsCount = 0 }) => {
  const pathname = usePathname();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Icons.dashboard, path: "/owner" },
    { id: "services", label: "Find Pet Care", icon: Icons.services, path: "/owner/services" },
    {
      id: "bookings",
      label: "My Bookings",
      icon: Icons.bookings,
      path: "/owner/bookings",
      badge: upcomingBookingsCount,
    },
    { id: "pets", label: "My Pets", icon: Icons.pets, path: "/owner/pets" },
    { id: "profile", label: "Profile", icon: Icons.profile, path: "/owner/profile" },
  ];

  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";
    window.location.href = "/login";
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(26,35,50,0.5)", backdropFilter: "blur(4px)" }}
          onClick={onToggle}
        />
      )}

      <aside
        className="fixed top-0 left-0 h-full z-50 w-64 flex flex-col"
        style={{
          background: "var(--sidebar-bg)",
          fontFamily: "'Nunito', sans-serif",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 300ms ease-in-out",
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <span className="text-xl font-900 text-white" style={{ fontFamily: "'Fraunces', serif" }}>FurSure</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-700 uppercase tracking-widest px-3 mb-4 mt-2" style={{ color: "#4A6280" }}>
            Pet Owner
          </p>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`sidebar-item ${isActive ? "active" : ""}`}
              >
                <span className="w-5 flex items-center justify-center shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-xs font-700 px-2 py-0.5 rounded-full"
                    style={{ background: isActive ? "rgba(26,35,50,0.3)" : "var(--fur-amber)", color: isActive ? "#1A2332" : "#1A2332" }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <button
            onClick={handleLogout}
            className="sidebar-item w-full justify-start"
            style={{ color: "#4A6280" }}
          >
            <span className="w-5 flex items-center justify-center shrink-0">{Icons.logout}</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;