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
    pendingBookings?: number;
  };
}

const statIcons = {
  upcoming: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  ),
  pets: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/>
      <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.45-2.344-2.5"/>
      <path d="M8 14v.5C8 18 10 22 12 22s4-4 4-7.5V14"/><path d="M8.5 14c1 1 5 1 7 0"/>
    </svg>
  ),
  pending: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  completed: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
};

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ user, stats }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const statCards = [
    { label: "Upcoming",  value: stats.upcomingBookings,     icon: statIcons.upcoming,  color: "var(--fur-teal)", bg: "rgba(45,140,114,0.15)" },
    { label: "My Pets",   value: stats.totalPets,            icon: statIcons.pets,      color: "#A78BFA",         bg: "rgba(167,139,250,0.15)" },
    { label: "Pending",   value: stats.pendingBookings ?? 0, icon: statIcons.pending,   color: "#D97706",         bg: "rgba(217,119,6,0.15)" },
    { label: "Completed", value: stats.completedBookings,    icon: statIcons.completed, color: "#34D399",         bg: "rgba(52,211,153,0.15)" },
  ];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1A2332 0%, #2D4A6B 100%)" }}>
      <div className="p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-1/2 translate-x-1/4"
          style={{ background: "var(--fur-amber)" }} />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 rounded-full opacity-5 translate-y-1/2"
          style={{ background: "var(--fur-teal)" }} />

        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-600 mb-1" style={{ color: "#7A90A8" }}>{getGreeting()}</p>
              <h1 className="text-2xl md:text-3xl font-900 text-white" style={{ fontFamily: "'Fraunces', serif" }}>
                {user.name.split(" ")[0]}&apos;s Pet Hub
              </h1>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A90A8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/>
                <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.45-2.344-2.5"/>
                <path d="M8 14v.5C8 18 10 22 12 22s4-4 4-7.5V14"/><path d="M8.5 14c1 1 5 1 7 0"/>
              </svg>
              <span className="text-sm font-600 text-white">Caring for your furry family</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((stat) => (
              <div key={stat.label} className="rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: stat.bg, color: stat.color }}>
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