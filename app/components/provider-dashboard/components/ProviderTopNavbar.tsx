"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProviderContext } from "../context/ProviderAppContext";
import { supabase } from "@/app/lib/supabase";

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
  const router = useRouter();
  const [authName, setAuthName] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const firstName = data.user.user_metadata?.firstName || "";
        const lastName = data.user.user_metadata?.lastName || "";
        const fullName = [firstName, lastName].filter(Boolean).join(" ");
        setAuthName(fullName || data.user.email || "");
      }
    };
    fetchUser();
  }, []);

  const displayName = authName || user.name;
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "?";

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
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

          {/* Clickable avatar → profile page */}
          <button
            onClick={() => router.push("/provider/profile")}
            className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              <div className="flex items-center justify-end space-x-1">
                <span className="text-yellow-400 text-xs">⭐</span>
                <span className="text-xs text-gray-500">{user.rating}</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {initial}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default ProviderTopNavbar;