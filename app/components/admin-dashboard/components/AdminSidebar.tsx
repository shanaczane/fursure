"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const AdminSidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const pathname = usePathname();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊", path: "/admin" },
    { id: "providers", label: "Provider Verification", icon: "✅", path: "/admin/providers" },
    { id: "users", label: "User Accounts", icon: "👥", path: "/admin/users" },
    { id: "activity", label: "System Activity", icon: "📋", path: "/admin/activity" },
    { id: "moderation", label: "Content Moderation", icon: "🛡️", path: "/admin/moderation" },
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
              <p className="text-xs font-700" style={{ color: "#EF4444", marginTop: -2 }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-700 uppercase tracking-widest px-3 mb-4 mt-2" style={{ color: "#4A6280" }}>
            Administration
          </p>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.id} href={item.path} className={`sidebar-item ${isActive ? "active" : ""}`}>
                <span className="text-lg w-6 text-center flex-shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <p className="text-xs font-700 uppercase tracking-widest px-3 mb-3" style={{ color: "#4A6280" }}>
              Other Panels
            </p>
            <Link href="/owner" className="sidebar-item" style={{ color: "#4A6280" }}>
              <span className="text-lg w-6 text-center">🐾</span>
              <span>Owner Dashboard</span>
            </Link>
            <Link href="/provider" className="sidebar-item" style={{ color: "#4A6280" }}>
              <span className="text-lg w-6 text-center">🏢</span>
              <span>Provider Dashboard</span>
            </Link>
          </div>
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

export default AdminSidebar;