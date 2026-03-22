"use client";

import React from "react";
import { type User } from "@/app/types";

interface WelcomeSectionProps {
  user: User;
  stats: {
    upcomingBookings: number;
    completedBookings: number;
    totalPets: number;
    totalServices: number;
  };
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ user, stats }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const statCards = [
    { label: "Upcoming", value: stats.upcomingBookings, icon: "📅", color: "var(--fur-teal)", bg: "var(--fur-teal-light)" },
    { label: "My Pets", value: stats.totalPets, icon: "🐾", color: "#8B5CF6", bg: "#EDE9FE" },
    { label: "Services", value: stats.totalServices, icon: "🔍", color: "var(--fur-amber-dark)", bg: "var(--fur-amber-light)" },
    { label: "Completed", value: stats.completedBookings, icon: "✅", color: "#059669", bg: "#D1FAE5" },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1A2332 0%, #2D4A6B 100%)" }}
    >
      <div className="p-6 md:p-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-1/2 translate-x-1/4"
          style={{ background: "var(--fur-amber)" }} />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 rounded-full opacity-5 translate-y-1/2"
          style={{ background: "var(--fur-teal)" }} />

        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-600 mb-1" style={{ color: "#7A90A8" }}>{getGreeting()} 👋</p>
              <h1 className="text-2xl md:text-3xl font-900 text-white" style={{ fontFamily: "'Fraunces', serif" }}>
                {user.name.split(" ")[0]}&apos;s Pet Hub
              </h1>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <span>🐕</span>
              <span className="text-sm font-600 text-white">Caring for your furry family</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: stat.bg }}>
                    {stat.icon}
                  </div>
                </div>
                <p className="text-2xl font-900 text-white mb-1" style={{ fontFamily: "'Fraunces', serif" }}>{stat.value}</p>
                <p className="text-xs font-600" style={{ color: "#7A90A8" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;