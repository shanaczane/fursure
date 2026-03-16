"use client";

import React from "react";
import { useProviderContext } from "../context/ProviderAppContext";

interface TopNavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const ProviderTopNavbar: React.FC<TopNavbarProps> = ({
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const { user, bookings } = useProviderContext();
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white border-b border-gray-200 z-30 transition-all duration-300 ${
        isSidebarOpen ? "left-0 lg:left-64" : "left-0"
      }`}
    >
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-900">{user.businessName}</p>
            <p className="text-xs text-gray-500">Service Provider Dashboard</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {pendingCount > 0 && (
            <div className="hidden sm:flex items-center space-x-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-amber-700">
                {pendingCount} pending
              </span>
            </div>
          )}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <div className="flex items-center justify-end space-x-1">
                <span className="text-yellow-400 text-xs">⭐</span>
                <span className="text-xs text-gray-500">{user.rating}</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user.avatar || user.name.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProviderTopNavbar;