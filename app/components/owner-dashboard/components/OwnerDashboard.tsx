"use client";

import React, { useState } from "react";
import { useAppContext } from "@/app/contexts/AppContext";
import { useDashboard } from "@/app/hooks/useDashboard";
import Link from "next/link";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import WelcomeSection from "./WelcomeSection";

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);
const PersonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7"/>
  </svg>
);
const PawIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/>
    <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.45-2.344-2.5"/>
    <path d="M8 14v.5C8 18 10 22 12 22s4-4 4-7.5V14"/><path d="M8.5 14c1 1 5 1 7 0"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const OwnerDashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, services, bookings, pets } = useAppContext();
  const { upcomingBookings, dashboardStats } = useDashboard({ services, bookings, pets, user });

  const recentBookings = bookings.slice(0, 4);

  const quickActions = [
    { icon: <SearchIcon />, label: "Find Pet Care", desc: "Browse local providers", href: "/owner/services", color: "var(--fur-teal-light)", accent: "var(--fur-teal)" },
    { icon: <PlusIcon />, label: "Add a Pet", desc: "Register a new pet", href: "/owner/pets", color: "var(--fur-amber-light)", accent: "var(--fur-amber-dark)" },
    { icon: <CalendarIcon />, label: "View Bookings", desc: "Manage appointments", href: "/owner/bookings", color: "#EDE9FE", accent: "#5B21B6" },
    { icon: <PersonIcon />, label: "My Profile", desc: "Update your info", href: "/owner/profile", color: "#D1FAE5", accent: "#065F46" },
  ];

  const statusConfig: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
    pending:              { label: "Pending",            bg: "#FEF3C7", color: "#92400E", icon: <ClockIcon /> },
    awaiting_downpayment: { label: "Awaiting Payment",   bg: "#FFEDD5", color: "#9A3412", icon: <ClockIcon /> },
    payment_submitted:    { label: "Payment Submitted",  bg: "#DBEAFE", color: "#1E40AF", icon: <ClockIcon /> },
    confirmed:            { label: "Confirmed",          bg: "#DBEAFE", color: "#1E40AF", icon: <CalendarIcon /> },
    rescheduled:          { label: "Rescheduled",        bg: "#EDE9FE", color: "#5B21B6", icon: <CalendarIcon /> },
    completed:            { label: "Completed",          bg: "#D1FAE5", color: "#065F46", icon: <CheckIcon /> },
    cancelled:            { label: "Cancelled",          bg: "#FEE2E2", color: "#991B1B", icon: <XIcon /> },
    declined:             { label: "Declined",           bg: "#F3F4F6", color: "#374151", icon: <XIcon /> },
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--fur-cream)", fontFamily: "'Nunito', sans-serif" }}>
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        upcomingBookingsCount={upcomingBookings.length}
      />
      <div style={{ marginLeft: isSidebarOpen ? "16rem" : "0", transition: "margin-left 300ms ease-in-out" }}>
        <TopNavbar
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="p-4 md:p-6 mt-16">
          <div className="max-w-5xl mx-auto space-y-6">
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
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: action.color, color: action.accent }}>
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
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: "var(--fur-teal-light)", color: "var(--fur-teal)" }}>
                      <CalendarIcon />
                    </div>
                    <p className="font-700 mb-1" style={{ color: "var(--fur-slate)" }}>No upcoming bookings</p>
                    <p className="text-sm mb-4" style={{ color: "var(--fur-slate-light)" }}>Book a service to get started</p>
                    <Link href="/owner/services" className="btn-primary inline-block px-6 py-2">
                      Browse Services
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingBookings.slice(0, 3).map((booking) => {
                      const status = statusConfig[booking.status] ?? statusConfig.pending;
                      return (
                        <div key={booking.id} className="rounded-2xl p-5 border flex items-center gap-4"
                          style={{ background: "white", borderColor: "var(--border)" }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: status.bg, color: status.color }}>
                            {status.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-700 text-sm truncate" style={{ color: "var(--fur-slate)" }}>{booking.serviceName}</p>
                            <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                              {booking.petName} · {booking.date} at {booking.time}
                            </p>
                            {/* Payment action prompt on dashboard card */}
                            {booking.status === "awaiting_downpayment" && (
                              <p className="text-xs font-700 mt-1" style={{ color: "#9A3412" }}>
                                ⚠️ Cash down payment required — go to My Bookings
                              </p>
                            )}
                            {booking.status === "payment_submitted" && (
                              <p className="text-xs font-700 mt-1" style={{ color: "#1E40AF" }}>
                                🕐 Payment submitted — awaiting provider confirmation
                              </p>
                            )}
                          </div>
                          <span className="text-xs font-700 px-3 py-1 rounded-full shrink-0"
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
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                        style={{ background: "var(--fur-amber-light)", color: "var(--fur-amber-dark)" }}>
                        <PawIcon />
                      </div>
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
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-900"
                            style={{ background: "var(--fur-teal)", color: "white", fontFamily: "'Fraunces', serif", fontSize: "1rem" }}>
                            {pet.name.charAt(0).toUpperCase()}
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
                        const status = statusConfig[booking.status] ?? statusConfig.pending;
                        return (
                          <div key={booking.id}
                            className={`flex items-center gap-3 p-4 ${idx < recentBookings.length - 1 ? "border-b" : ""}`}
                            style={{ borderColor: "var(--border)" }}>
                            <span style={{ color: status.color }}>{status.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-700 truncate" style={{ color: "var(--fur-slate)" }}>{booking.serviceName}</p>
                              <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>{booking.petName}</p>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full font-600 shrink-0"
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