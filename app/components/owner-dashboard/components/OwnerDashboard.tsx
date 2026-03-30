"use client";

import React, { useState } from "react";
import { useAppContext } from "@/app/contexts/AppContext";
import { useDashboard } from "@/app/hooks/useDashboard";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import WelcomeSection from "./WelcomeSection";
import UpcomingBookings from "./UpcomingBookings";
import QuickActions from "./QuickActions";
import RecentActivity from "./RecentActivity";

const OwnerDashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, services, bookings, pets } = useAppContext();
  const { upcomingBookings, dashboardStats } = useDashboard({
    services,
    bookings,
    pets,
    user,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        upcomingBookingsCount={upcomingBookings.length}
      />
      <div
        style={{
          marginLeft: isSidebarOpen ? "16rem" : "0",
          transition: "margin-left 300ms ease-in-out",
        }}
      >
        <TopNavbar
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="p-4 md:p-6 mt-16">
          <div className="max-w-7xl mx-auto space-y-4">
            <WelcomeSection user={user} stats={dashboardStats} />
            <QuickActions pets={pets} />
            {upcomingBookings.length > 0 && (
              <UpcomingBookings
                bookings={upcomingBookings}
                showViewAll={true}
              />
            )}
            <RecentActivity bookings={bookings} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default OwnerDashboard;