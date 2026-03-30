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
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊", path: "/provider" },
    {
      id: "bookings",
      label: "Manage Bookings",
      icon: "📅",
      path: "/provider/bookings",
      badge: pendingCount,
    },
    { id: "services", label: "My Services", icon: "🐾", path: "/provider/services" },
    { id: "schedule", label: "Schedule", icon: "🗓️", path: "/provider/schedule" },
  ];

  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";
    window.location.href = "/login";
  };

  return (
    <>
      {/* Overlay (all screen sizes when open) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
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
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🐕</span>
            <div>
              <span className="text-xl font-bold text-gray-900">FurSure</span>
              <p className="text-xs text-blue-600 font-medium -mt-0.5">Provider</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
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