"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  upcomingBookingsCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  upcomingBookingsCount = 0,
}) => {
  const pathname = usePathname();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠", path: "/owner" },
    { id: "services", label: "Services", icon: "🔍", path: "/owner/services" },
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
    // Clear auth cookie
    document.cookie = "token=; path=/; max-age=0";
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
          transition-transform duration-300 ease-in-out w-64
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🐕</span>
            <span className="text-xl font-bold text-gray-900">FurSure</span>
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
                className={`
                  flex items-center justify-between px-4 py-3 rounded-lg
                  transition-colors duration-200
                  ${isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"}
                `}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section - Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
