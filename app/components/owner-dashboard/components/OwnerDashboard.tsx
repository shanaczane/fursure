"use client";

import React, { useState } from "react";
import { useAppContext } from "@/app/contexts/AppContext";
import { useDashboard } from "@/app/hooks/useDashboard";
import Link from "next/link";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import WelcomeSection from "./WelcomeSection";

const OwnerDashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, services, bookings, pets } = useAppContext();
  const { upcomingBookings, dashboardStats } = useDashboard({ services, bookings, pets, user });

  const recentBookings = bookings.slice(0, 4);

  const quickActions = [
    { icon: "🏪", label: "Find Pet Care", desc: "Browse local providers", href: "/owner/services", color: "var(--fur-teal-light)", accent: "var(--fur-teal)" },
    { icon: "➕", label: "Add a Pet", desc: "Register a new pet", href: "/owner/pets", color: "var(--fur-amber-light)", accent: "var(--fur-amber-dark)" },
    { icon: "📅", label: "View Bookings", desc: "Manage appointments", href: "/owner/bookings", color: "#EDE9FE", accent: "#5B21B6" },
    { icon: "👤", label: "My Profile", desc: "Update your info", href: "/owner/profile", color: "#D1FAE5", accent: "#065F46" },
  ];

  const statusConfig: Record<string, { label: string; bg: string; color: string; icon: string }> = {
    pending: { label: "Pending", bg: "#FEF3C7", color: "#92400E", icon: "⏳" },
    confirmed: { label: "Confirmed", bg: "#DBEAFE", color: "#1E40AF", icon: "📅" },
    completed: { label: "Completed", bg: "#D1FAE5", color: "#065F46", icon: "✅" },
    cancelled: { label: "Cancelled", bg: "#FEE2E2", color: "#991B1B", icon: "❌" },
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--fur-cream)", fontFamily: "'Nunito', sans-serif" }}>
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        upcomingBookingsCount={upcomingBookings.length}
      />
      <div className={`transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : "lg:ml-0"}`}>
        <TopNavbar
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="p-4 md:p-6 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <WelcomeSection user={user} stats={dashboardStats} />

            {/* Quick Actions */}
            <div>
              <h2 className="font-800 text-base mb-4" style={{ color: "var(--fur-slate)" }}>Quick Actions</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="rounded-2xl p-5 border-2 transition-all card-hover block"
                    style={{ background: "white", borderColor: "var(--border)" }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                      style={{ background: action.color }}>
                      {action.icon}
                    </div>
                    <p className="font-800 text-sm mb-1" style={{ color: "var(--fur-slate)" }}>{action.label}</p>
                    <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>{action.desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upcoming Bookings */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-800 text-base" style={{ color: "var(--fur-slate)" }}>
                    Upcoming Bookings
                    {upcomingBookings.length > 0 && (
                      <span className="ml-2 text-xs font-700 px-2 py-0.5 rounded-full"
                        style={{ background: "var(--fur-teal-light)", color: "var(--fur-teal-dark)" }}>
                        {upcomingBookings.length}
                      </span>
                    )}
                  </h2>
                  <Link href="/owner/bookings" className="text-sm font-700" style={{ color: "var(--fur-teal)" }}>
                    View all →
                  </Link>
                </div>

                {upcomingBookings.length === 0 ? (
                  <div className="rounded-2xl p-12 text-center border" style={{ background: "white", borderColor: "var(--border)" }}>
                    <p className="text-4xl mb-3">📅</p>
                    <p className="font-700 mb-1" style={{ color: "var(--fur-slate)" }}>No upcoming bookings</p>
                    <p className="text-sm mb-4" style={{ color: "var(--fur-slate-light)" }}>Book a service to get started</p>
                    <Link href="/owner/services" className="btn-primary inline-block px-6 py-2">
                      Browse Services
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingBookings.slice(0, 3).map((booking) => {
                      const status = statusConfig[booking.status] || statusConfig.pending;
                      return (
                        <div key={booking.id} className="rounded-2xl p-5 border flex items-center gap-4"
                          style={{ background: "white", borderColor: "var(--border)" }}>
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                            style={{ background: "var(--fur-mist)" }}>
                            {status.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-700 text-sm truncate" style={{ color: "var(--fur-slate)" }}>{booking.serviceName}</p>
                            <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                              🐾 {booking.petName} · 📅 {booking.date} at {booking.time}
                            </p>
                          </div>
                          <span className="text-xs font-700 px-3 py-1 rounded-full flex-shrink-0"
                            style={{ background: status.bg, color: status.color }}>
                            {status.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* My Pets & Recent Activity */}
              <div className="space-y-6">
                {/* My Pets */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-800 text-base" style={{ color: "var(--fur-slate)" }}>My Pets</h2>
                    <Link href="/owner/pets" className="text-sm font-700" style={{ color: "var(--fur-teal)" }}>
                      Manage →
                    </Link>
                  </div>
                  {pets.length === 0 ? (
                    <div className="rounded-2xl p-8 text-center border" style={{ background: "white", borderColor: "var(--border)" }}>
                      <p className="text-3xl mb-2">🐾</p>
                      <p className="font-700 text-sm mb-3" style={{ color: "var(--fur-slate)" }}>No pets yet</p>
                      <Link href="/owner/pets" className="btn-amber inline-block text-sm px-4 py-2">
                        Add a pet
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pets.slice(0, 3).map((pet) => (
                        <div key={pet.id} className="rounded-xl p-4 border flex items-center gap-3"
                          style={{ background: "white", borderColor: "var(--border)" }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                            style={{ background: "var(--fur-amber-light)" }}>
                            {pet.type === "dog" ? "🐕" : pet.type === "cat" ? "🐈" : "🐾"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-700 text-sm truncate" style={{ color: "var(--fur-slate)" }}>{pet.name}</p>
                            <p className="text-xs capitalize truncate" style={{ color: "var(--fur-slate-light)" }}>
                              {pet.breed} · {pet.age}yr
                            </p>
                          </div>
                        </div>
                      ))}
                      {pets.length > 3 && (
                        <Link href="/owner/pets" className="text-xs font-700 block text-center" style={{ color: "var(--fur-teal)" }}>
                          +{pets.length - 3} more pets
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                {recentBookings.length > 0 && (
                  <div>
                    <h2 className="font-800 text-base mb-4" style={{ color: "var(--fur-slate)" }}>Recent Activity</h2>
                    <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)" }}>
                      {recentBookings.map((booking, idx) => {
                        const status = statusConfig[booking.status] || statusConfig.pending;
                        return (
                          <div key={booking.id}
                            className={`flex items-center gap-3 p-4 ${idx < recentBookings.length - 1 ? "border-b" : ""}`}
                            style={{ borderColor: "var(--border)" }}>
                            <span className="text-lg">{status.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-700 truncate" style={{ color: "var(--fur-slate)" }}>{booking.serviceName}</p>
                              <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>{booking.petName}</p>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full font-600 flex-shrink-0"
                              style={{ background: status.bg, color: status.color }}>
                              {status.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OwnerDashboard;