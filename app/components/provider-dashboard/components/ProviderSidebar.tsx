"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProviderContext } from "../context/ProviderAppContext";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
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
  bookings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  services: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  schedule: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
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

const ProviderSidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const pathname = usePathname();
  const { bookings } = useProviderContext();
  const pendingCount = bookings.filter(b => b.status === "pending").length;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Icons.dashboard, path: "/provider" },
    { id: "bookings", label: "Manage Bookings", icon: Icons.bookings, path: "/provider/bookings", badge: pendingCount },
    { id: "services", label: "My Services", icon: Icons.services, path: "/provider/services" },
    { id: "schedule", label: "Schedule", icon: Icons.schedule, path: "/provider/schedule" },
    { id: "profile", label: "Profile", icon: Icons.profile, path: "/provider/profile" },
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
          <div>
            <span className="text-xl font-900 text-white" style={{ fontFamily: "'Fraunces', serif" }}>FurSure</span>
            <p className="text-xs font-700" style={{ color: "var(--fur-amber)", marginTop: -2 }}>Provider</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-700 uppercase tracking-widest px-3 mb-4 mt-2" style={{ color: "#4A6280" }}>
            Service Provider
          </p>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.id} href={item.path} className={`sidebar-item ${isActive ? "active" : ""}`}>
                <span className="w-5 flex items-center justify-center shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-xs font-700 px-2 py-0.5 rounded-full"
                    style={{ background: isActive ? "rgba(26,35,50,0.3)" : "var(--fur-amber)", color: "#1A2332" }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <button onClick={handleLogout} className="sidebar-item w-full justify-start" style={{ color: "#4A6280" }} suppressHydrationWarning>
            <span className="w-5 flex items-center justify-center shrink-0">{Icons.logout}</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ProviderSidebar;
