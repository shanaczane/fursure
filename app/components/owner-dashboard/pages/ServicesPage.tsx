"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/app/contexts/AppContext";
import { useDashboard } from "@/app/hooks/useDashboard";
import { type Service, type ServiceCategory } from "@/app/types";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

const SERVICE_CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: "all",        label: "All" },
  { value: "grooming",   label: "Grooming" },
  { value: "veterinary", label: "Veterinary" },
  { value: "training",   label: "Training" },
  { value: "boarding",   label: "Boarding" },
  { value: "walking",    label: "Walking" },
  { value: "daycare",    label: "Daycare" },
];

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
    (b) =>
      (b.status === "pending" || b.status === "confirmed") &&
      new Date(b.date + "T00:00:00") >= new Date(new Date().setHours(0, 0, 0, 0)),
  ).length;

  const handleServiceClick = (service: Service) => {
    router.push(`/owner/services/${service.id}`);
  };

  const handleProviderClick = (e: React.MouseEvent, providerUserId: string) => {
    e.stopPropagation();
    router.push(`/owner/providers/${providerUserId}`);
  };

  const categoryColors: Record<string, { bg: string; accent: string }> = {
    grooming:   { bg: "var(--fur-amber-light)", accent: "var(--fur-amber-dark)" },
    veterinary: { bg: "var(--fur-teal-light)",  accent: "var(--fur-teal-dark)" },
    training:   { bg: "#EDE9FE",                accent: "#5B21B6" },
    boarding:   { bg: "#E0E7FF",                accent: "#3730A3" },
    walking:    { bg: "#D1FAE5",                accent: "#065F46" },
    daycare:    { bg: "#FEF3C7",                accent: "#92400E" },
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--fur-cream)", fontFamily: "'Nunito', sans-serif" }}>
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
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <div>
              <h1 className="text-2xl md:text-3xl font-900 mb-1"
                style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
                Find Services
              </h1>
              <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>
                Browse and book trusted pet care services near you
              </p>
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
                  <svg className="w-4 h-4 absolute left-3 top-3.5"
                    style={{ color: "var(--fur-slate-light)" }}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value as "rating" | "price_asc" | "price_desc" | "distance" })}
                  className="fur-input md:w-48">
                  <option value="rating">Highest Rated</option>
                  <option value="price_asc">Lowest Price</option>
                  <option value="price_desc">Highest Price</option>
                  <option value="distance">Nearest</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                {SERVICE_CATEGORIES.map((cat) => (
                  <button key={cat.value} onClick={() => handleFilterChange({ category: cat.value })}
                    className="px-4 py-1.5 rounded-full text-sm font-700 border-2 transition-all"
                    style={filters.category === cat.value
                      ? { background: "var(--fur-teal)", color: "white", borderColor: "var(--fur-teal)" }
                      : { background: "white", color: "var(--fur-slate-mid)", borderColor: "var(--border)" }}>
                    {cat.label}
                  </button>
                ))}
                {(filters.category !== "all" || filters.searchQuery) && (
                  <button onClick={handleResetFilters}
                    className="px-4 py-1.5 rounded-full text-sm font-700 border-2 transition-all flex items-center gap-1"
                    style={{ background: "var(--fur-rose-light)", color: "var(--fur-rose)", borderColor: "#FCA5A5" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Results count */}
            <p className="text-sm font-600" style={{ color: "var(--fur-slate-mid)" }}>
              {filteredServices.length} service{filteredServices.length !== 1 ? "s" : ""} found
            </p>

            {/* Service grid */}
            {filteredServices.length === 0 ? (
              <div className="rounded-2xl p-16 text-center border" style={{ background: "white", borderColor: "var(--border)" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "var(--fur-mist)", color: "var(--fur-slate-light)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <p className="font-700 text-lg mb-2" style={{ color: "var(--fur-slate)" }}>No services found</p>
                <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredServices.map((service) => {
                  const colors = categoryColors[service.category] || { bg: "var(--fur-sand)", accent: "var(--fur-brown)" };
                  return (
                    <div
                      key={service.id}
                      onClick={() => handleServiceClick(service)}
                      className="rounded-2xl overflow-hidden border cursor-pointer card-hover"
                      style={{ background: "white", borderColor: "var(--border)" }}
                    >
                      {/* Card hero */}
                      <div className="h-36 flex items-center justify-center relative" style={{ background: colors.bg }}>
                        <div className="absolute inset-0 opacity-30"
                          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.8) 0%, transparent 60%)" }} />
                        <span className="text-5xl relative z-10">{service.image}</span>
                        <span className="absolute top-3 right-3 text-xs font-700 px-3 py-1 rounded-full bg-white capitalize"
                          style={{ color: colors.accent }}>{service.category}</span>
                      </div>

                      <div className="p-5">
                        <h3 className="font-800 text-base mb-1 truncate" style={{ color: "var(--fur-slate)" }}>
                          {service.name}
                        </h3>

                        {/* ── Provider name — clickable ── */}
                        <div className="flex items-center gap-1.5 mb-3">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            style={{ color: "var(--fur-slate-light)", flexShrink: 0 }}>
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                          {service.providerUserId ? (
                            <button
                              onClick={(e) => handleProviderClick(e, service.providerUserId!)}
                              className="text-xs font-700 truncate hover:underline transition-colors"
                              style={{ color: "var(--fur-teal)", background: "none", border: "none", padding: 0, cursor: "pointer" }}
                            >
                              {service.provider}
                            </button>
                          ) : (
                            <p className="text-xs truncate" style={{ color: "var(--fur-slate-light)" }}>
                              {service.provider}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B"
                              strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            <span className="font-700 text-sm" style={{ color: "var(--fur-slate)" }}>{service.rating}</span>
                            <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>({service.reviews})</span>
                          </div>
                          <div className="flex items-center gap-1" style={{ color: "var(--fur-teal)" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span className="text-xs font-600">{service.distance}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                          <div>
                            <span className="text-xl font-900"
                              style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
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