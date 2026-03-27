"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  upcomingBookingsCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, upcomingBookingsCount = 0 }) => {
  const pathname = usePathname();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊", path: "/owner" },
    { id: "services", label: "Find Pet Care", icon: "🏪", path: "/owner/services" },
    {
      id: "bookings",
      label: "My Bookings",
      icon: "📅",
      path: "/owner/bookings",
      badge: upcomingBookingsCount,
    },
    { id: "pets", label: "My Pets", icon: "🐾", path: "/owner/pets" },
    { id: "profile", label: "Profile", icon: "👤", path: "/owner/profile" },
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
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="text-xl font-900 text-white" style={{ fontFamily: "'Fraunces', serif" }}>FurSure</span>
          </div>
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
                <span className="text-lg w-6 text-center flex-shrink-0">{item.icon}</span>
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
            <span className="text-lg w-6 text-center">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;