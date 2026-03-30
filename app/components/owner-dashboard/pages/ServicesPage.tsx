"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/app/contexts/AppContext";
import { useDashboard } from "@/app/hooks/useDashboard";
import { type Service, SERVICE_CATEGORIES } from "@/app/types";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

const ServicesPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const { user, services, bookings, pets } = useAppContext();

  const {
    services: filteredServices,
    filters,
    handleFilterChange,
    handleResetFilters,
    handleSearchChange,
  } = useDashboard({ services, bookings, pets, user });

  const upcomingCount = bookings.filter(
    b => (b.status === "pending" || b.status === "confirmed") &&
      new Date(b.date + "T00:00:00") >= new Date(new Date().setHours(0, 0, 0, 0))
  ).length;

  const handleServiceClick = (service: Service) => {
    router.push(`/owner/services/${service.id}`);
  };

  const categoryColors: Record<string, string> = {
    grooming: { bg: "var(--fur-amber-light)", accent: "var(--fur-amber-dark)" },
    veterinary: { bg: "var(--fur-teal-light)", accent: "var(--fur-teal-dark)" },
    training: { bg: "#EDE9FE", accent: "#5B21B6" },
    boarding: { bg: "#E0E7FF", accent: "#3730A3" },
    walking: { bg: "#D1FAE5", accent: "#065F46" },
    daycare: { bg: "#FEF3C7", accent: "#92400E" },
  } as unknown as Record<string, string>;

  return (
    <div className="min-h-screen" style={{ background: "var(--fur-cream)", fontFamily: "'Nunito', sans-serif" }}>
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        upcomingBookingsCount={upcomingCount}
      />
      <div style={{ marginLeft: isSidebarOpen ? "16rem" : "0", transition: "margin-left 300ms ease-in-out" }}>
        <TopNavbar
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="p-4 md:p-6 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl md:text-3xl font-900 mb-1" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
                Find Services
              </h1>
              <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>Browse and book trusted pet care services near you</p>
            </div>

            {/* Search & Filter */}
            <div className="rounded-2xl p-5 border" style={{ background: "white", borderColor: "var(--border)" }}>
              <div className="flex flex-col md:flex-row gap-4 mb-5">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search services, providers..."
                    className="fur-input"
                    style={{ paddingLeft: "2.5rem" }}
                  />
                  <svg className="w-4 h-4 absolute left-3 top-3.5" style={{ color: "var(--fur-slate-light)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value as "rating" | "price" | "distance" })}
                  className="fur-input md:w-48"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="price">Lowest Price</option>
                  <option value="distance">Nearest</option>
                </select>
              </div>

              {/* Category chips */}
              <div className="flex flex-wrap gap-2">
                {SERVICE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleFilterChange({ category: cat.value })}
                    className="px-4 py-1.5 rounded-full text-sm font-700 border-2 transition-all"
                    style={filters.category === cat.value
                      ? { background: "var(--fur-teal)", color: "white", borderColor: "var(--fur-teal)" }
                      : { background: "white", color: "var(--fur-slate-mid)", borderColor: "var(--border)" }}
                  >
                    {cat.label}
                  </button>
                ))}
                {(filters.category !== "all" || filters.searchQuery) && (
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-1.5 rounded-full text-sm font-700 border-2 transition-all"
                    style={{ background: "var(--fur-rose-light)", color: "var(--fur-rose)", borderColor: "#FCA5A5" }}
                  >
                    ✕ Reset
                  </button>
                )}
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-600" style={{ color: "var(--fur-slate-mid)" }}>
                {filteredServices.length} service{filteredServices.length !== 1 ? "s" : ""} found
              </p>
            </div>

            {/* Service grid */}
            {filteredServices.length === 0 ? (
              <div className="rounded-2xl p-16 text-center border" style={{ background: "white", borderColor: "var(--border)" }}>
                <p className="text-5xl mb-4">🔍</p>
                <p className="font-700 text-lg mb-2" style={{ color: "var(--fur-slate)" }}>No services found</p>
                <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredServices.map((service) => {
                  const colors = (categoryColors[service.category] as unknown as { bg: string; accent: string }) || { bg: "var(--fur-sand)", accent: "var(--fur-brown)" };
                  return (
                    <div
                      key={service.id}
                      onClick={() => handleServiceClick(service)}
                      className="rounded-2xl overflow-hidden border cursor-pointer card-hover"
                      style={{ background: "white", borderColor: "var(--border)" }}
                    >
                      {/* Card hero */}
                      <div className="h-36 flex items-center justify-center relative" style={{ background: colors.bg }}>
                        <div className="absolute inset-0 opacity-30" style={{
                          backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.8) 0%, transparent 60%)"
                        }} />
                        <span className="text-5xl relative z-10">{service.image}</span>
                        <span className="absolute top-3 right-3 text-xs font-700 px-3 py-1 rounded-full bg-white"
                          style={{ color: colors.accent }}>
                          {service.category}
                        </span>
                      </div>

                      <div className="p-5">
                        <h3 className="font-800 text-base mb-1 truncate" style={{ color: "var(--fur-slate)" }}>{service.name}</h3>
                        <p className="text-xs mb-3 truncate" style={{ color: "var(--fur-slate-light)" }}>🏢 {service.provider}</p>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1">
                            <span className="text-amber-400">⭐</span>
                            <span className="font-700 text-sm" style={{ color: "var(--fur-slate)" }}>{service.rating}</span>
                            <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>({service.reviews})</span>
                          </div>
                          <span className="text-xs font-600" style={{ color: "var(--fur-teal)" }}>📍 {service.distance}</span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                          <div>
                            <span className="text-xl font-900" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
                              ₱{service.price}
                            </span>
                            <span className="text-xs ml-1" style={{ color: "var(--fur-slate-light)" }}>{service.priceUnit}</span>
                          </div>
                          <span className="text-xs font-700 px-3 py-1.5 rounded-xl text-white"
                            style={{ background: "var(--fur-teal)" }}>
                            View Details →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ServicesPage;