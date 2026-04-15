"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/app/contexts/AppContext";
import { useDashboard } from "@/app/hooks/useDashboard";
import { type Service, type ServiceCategory } from "@/app/types";
import { getRecommendedServices } from "@/app/utils/dashboardUtils";
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

  const recommendations = useMemo(
    () => getRecommendedServices(services, pets, bookings, 3),
    [services, pets, bookings],
  );

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

            {/* Recommended for You */}
            {recommendations.length > 0 && (
              <div className="rounded-2xl border p-5" style={{ background: "white", borderColor: "var(--border)" }}>
                {/* Section header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "var(--fur-teal-light)" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--fur-teal-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-900 text-sm leading-tight" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
                      Recommended for You
                    </p>
                    <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                      Based on your pets &amp; booking history
                    </p>
                  </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {recommendations.map(({ service, reason }) => {
                    const colors = categoryColors[service.category] || { bg: "var(--fur-sand)", accent: "var(--fur-brown)" };
                    return (
                      <div
                        key={service.id}
                        onClick={() => handleServiceClick(service)}
                        className="rounded-xl p-4 cursor-pointer transition-all"
                        style={{ background: colors.bg }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.filter = "brightness(0.96)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.filter = "none"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
                      >
                        {/* Reason tag */}
                        <span className="inline-block text-xs font-700 px-2.5 py-1 rounded-full mb-3"
                          style={{ background: "rgba(255,255,255,0.75)", color: colors.accent }}>
                          {reason}
                        </span>
                        <p className="font-800 text-sm mb-0.5 truncate" style={{ color: "var(--fur-slate)" }}>
                          {service.name}
                        </p>
                        <p className="text-xs truncate mb-3" style={{ color: "var(--fur-slate-light)" }}>
                          {service.provider}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            <span className="text-xs font-700" style={{ color: "var(--fur-slate)" }}>
                              {service.reviews > 0 ? service.rating.toFixed(1) : "—"}
                            </span>
                            <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                              ({service.reviews})
                            </span>
                          </div>
                          <span className="text-sm font-900" style={{ fontFamily: "'Fraunces', serif", color: colors.accent }}>
                            ₱{service.price}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Search & Filter */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)" }}>

              {/* Search bar */}
              <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all"
                  style={{ borderColor: filters.searchQuery ? "var(--fur-teal)" : "var(--border)", background: "var(--fur-cream)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ color: filters.searchQuery ? "var(--fur-teal)" : "var(--fur-slate-light)", flexShrink: 0 }}>
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search by service name or provider..."
                    style={{
                      flex: 1,
                      border: "none",
                      background: "transparent",
                      outline: "none",
                      fontSize: "0.9rem",
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 600,
                      color: "var(--fur-slate)",
                    }}
                  />
                  {filters.searchQuery && (
                    <button onClick={() => handleSearchChange("")}
                      style={{ color: "var(--fur-slate-light)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Categories + Sort */}
              <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex flex-wrap gap-2 flex-1">
                  {SERVICE_CATEGORIES.map((cat) => (
                    <button key={cat.value} onClick={() => handleFilterChange({ category: cat.value })}
                      className="px-3 py-1.5 rounded-full text-xs font-700 border transition-all"
                      style={filters.category === cat.value
                        ? { background: "var(--fur-teal)", color: "white", borderColor: "var(--fur-teal)" }
                        : { background: "white", color: "var(--fur-slate-mid)", borderColor: "var(--border)" }}>
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange({ sortBy: e.target.value as "rating" | "price_asc" | "price_desc" })}
                    style={{
                      border: "1.5px solid var(--border)",
                      borderRadius: "0.75rem",
                      padding: "0.4rem 2rem 0.4rem 0.75rem",
                      fontSize: "0.8rem",
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 700,
                      color: "var(--fur-slate)",
                      background: "white",
                      outline: "none",
                      cursor: "pointer",
                      appearance: "none",
                      WebkitAppearance: "none",
                    }}>
                    <option value="rating">Highest Rated</option>
                    <option value="price_asc">Lowest Price</option>
                    <option value="price_desc">Highest Price</option>
                  </select>
                  <span style={{ position: "absolute", right: "0.6rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--fur-slate-light)" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Active filters bar */}
              {(filters.category !== "all" || filters.searchQuery) && (
                <div className="px-4 py-2.5 border-t flex items-center justify-between" style={{ borderColor: "var(--border)", background: "var(--fur-teal-light)" }}>
                  <p className="text-xs font-700" style={{ color: "var(--fur-teal-dark)" }}>
                    {filteredServices.length} result{filteredServices.length !== 1 ? "s" : ""}
                    {filters.searchQuery && <span> for &ldquo;{filters.searchQuery}&rdquo;</span>}
                    {filters.category !== "all" && <span> in {filters.category}</span>}
                  </p>
                  <button onClick={handleResetFilters}
                    className="text-xs font-700 flex items-center gap-1"
                    style={{ color: "var(--fur-teal-dark)", background: "none", border: "none", cursor: "pointer" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Results count */}
            {!filters.searchQuery && filters.category === "all" && (
              <p className="text-sm font-600" style={{ color: "var(--fur-slate-mid)" }}>
                {filteredServices.length} service{filteredServices.length !== 1 ? "s" : ""} available
              </p>
            )}

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
                  const hasRating = service.reviews > 0;

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

                        {/* Provider */}
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

                        {/* Rating + Address */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1">
                            <svg width="13" height="13" viewBox="0 0 24 24"
                              fill={hasRating ? "#F59E0B" : "none"}
                              stroke={hasRating ? "#F59E0B" : "var(--fur-slate-light)"}
                              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            <span className="font-700 text-sm" style={{ color: "var(--fur-slate)" }}>
                              {hasRating ? service.rating : "—"}
                            </span>
                            <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                              ({service.reviews})
                            </span>
                          </div>

                          {/* Address */}
                          <div className="flex items-center gap-1 min-w-0 max-w-[55%]">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                              style={{ color: "var(--fur-teal)", flexShrink: 0 }}>
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span className="text-xs font-600 truncate" style={{ color: "var(--fur-teal)" }}>
                              {service.location || "—"}
                            </span>
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