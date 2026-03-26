"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProviderContext } from "../context/ProviderAppContext";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ProviderSidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const pathname = usePathname();
  const { bookings } = useProviderContext();
  const pendingCount = bookings.filter(b => b.status === "pending").length;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊", path: "/provider" },
    { id: "bookings", label: "Manage Bookings", icon: "📅", path: "/provider/bookings", badge: pendingCount },
    { id: "services", label: "My Services", icon: "🐾", path: "/provider/services" },
    { id: "schedule", label: "Schedule", icon: "🗓️", path: "/provider/schedule" },
    { id: "profile", label: "Profile", icon: "👤", path: "/provider/profile" },
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
        className={`fixed top-0 left-0 h-full z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "var(--sidebar-bg)", fontFamily: "'Nunito', sans-serif" }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <div>
              <span className="text-xl font-900 text-white" style={{ fontFamily: "'Fraunces', serif" }}>FurSure</span>
              <p className="text-xs font-700" style={{ color: "var(--fur-amber)", marginTop: -2 }}>Provider</p>
            </div>
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
                <span className="text-lg w-6 text-center flex-shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-xs font-700 px-2 py-0.5 rounded-full"
                    style={{ background: isActive ? "rgba(26,35,50,0.3)" : "#F59E0B", color: "#1A2332" }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <button onClick={handleLogout} className="sidebar-item w-full" style={{ color: "#4A6280" }} suppressHydrationWarning>
            <span className="text-lg w-6 text-center">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ProviderSidebar;