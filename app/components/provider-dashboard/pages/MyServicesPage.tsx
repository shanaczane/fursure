"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useProviderContext } from "../context/ProviderAppContext";
import type { ProviderService } from "../types";
import { PROVIDER_SERVICE_CATEGORIES } from "../types";
import { formatCurrency } from "../utils/providerUtils";
import ProviderLayout from "../components/ProviderLayout";

const MyServicesPage: React.FC = () => {
  const router = useRouter();
  const { services, deleteService, toggleServiceActive } = useProviderContext();

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const filtered = useMemo(() => {
    return services.filter((s) => {
      if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
      if (!showInactive && !s.isActive) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [services, categoryFilter, searchQuery, showInactive]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDelete = (id: string) => {
    deleteService(id);
    setDeleteConfirmId(null);
    showSuccess("Service deleted.");
  };

  const handleToggle = (id: string, name: string, isActive: boolean) => {
    toggleServiceActive(id);
    showSuccess(`"${name}" is now ${!isActive ? "active" : "inactive"}.`);
  };

  const activeCount = services.filter(s => s.isActive).length;

  const categoryColors: Record<string, { bg: string; color: string }> = {
    grooming: { bg: "var(--fur-amber-light)", color: "var(--fur-amber-dark)" },
    veterinary: { bg: "var(--fur-teal-light)", color: "var(--fur-teal-dark)" },
    training: { bg: "#EDE9FE", color: "#5B21B6" },
    boarding: { bg: "#E0E7FF", color: "#3730A3" },
    walking: { bg: "#D1FAE5", color: "#065F46" },
    daycare: { bg: "#FEF3C7", color: "#92400E" },
  };

  return (
    <ProviderLayout>
      <div className="space-y-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl mb-1" style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, color: "var(--fur-slate)" }}>
              My Services
            </h1>
            <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>
              {activeCount} active · {services.length} total services listed
            </p>
          </div>
          <button
            onClick={() => router.push("/provider/services/new")}
            className="btn-primary flex items-center gap-2 px-6 py-3"
          >
            <span>➕</span>
            <span>Add New Service</span>
          </button>
        </div>

        {/* Success toast */}
        {successMsg && (
          <div className="flex items-center gap-3 p-4 rounded-xl border"
            style={{ background: "#D1FAE5", borderColor: "#6EE7B7", color: "#065F46" }}>
            <span>✓</span>
            <span className="font-700 text-sm">{successMsg}</span>
          </div>
        )}

        {/* Filters */}
        <div className="rounded-2xl p-5 border" style={{ background: "white", borderColor: "var(--border)" }}>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services..."
                className="fur-input pl-10"
              />
              <svg className="w-4 h-4 absolute left-3 top-3.5" style={{ color: "var(--fur-slate-light)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <label className="flex items-center gap-2 px-4 cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-600" style={{ color: "var(--fur-slate-mid)" }}>Show inactive</span>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {PROVIDER_SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-700 border-2 transition-all"
                style={categoryFilter === cat.value
                  ? { background: "var(--fur-teal)", color: "white", borderColor: "var(--fur-teal)" }
                  : { background: "white", color: "var(--fur-slate-mid)", borderColor: "var(--border)" }}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Services grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl p-16 text-center border" style={{ background: "white", borderColor: "var(--border)" }}>
            <p className="text-5xl mb-4">🐾</p>
            <p className="font-700 text-lg mb-2" style={{ color: "var(--fur-slate)" }}>No services found</p>
            <p className="text-sm mb-6" style={{ color: "var(--fur-slate-light)" }}>
              {services.length === 0 ? "Add your first service to get started" : "Try adjusting your filters"}
            </p>
            {services.length === 0 && (
              <button onClick={() => router.push("/provider/services/new")} className="btn-primary px-8 py-3">
                Add First Service
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((service) => {
              const colors = categoryColors[service.category] || { bg: "var(--fur-sand)", color: "var(--fur-brown)" };
              return (
                <div
                  key={service.id}
                  className={`rounded-2xl overflow-hidden border-2 transition-all ${service.isActive ? "card-hover" : "opacity-60"}`}
                  style={{ borderColor: service.isActive ? "var(--border)" : "transparent", background: "white",
                    borderStyle: service.isActive ? "solid" : "dashed" }}
                >
                  {/* Card header */}
                  <div className="h-28 flex items-center justify-center relative" style={{ background: colors.bg }}>
                    <div className="absolute inset-0 opacity-30" style={{
                      backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.8) 0%, transparent 60%)"
                    }} />
                    <span className="text-4xl relative z-10">{service.image}</span>
                    <span
                      className="absolute top-2.5 right-2.5 text-xs font-700 px-2.5 py-1 rounded-full"
                      style={service.isActive
                        ? { background: "#D1FAE5", color: "#065F46" }
                        : { background: "#F3F4F6", color: "#6B7280" }}
                    >
                      {service.isActive ? "● Active" : "○ Inactive"}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="mb-4">
                      <h3 className="font-900 text-base truncate mb-0.5" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>{service.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: colors.bg, color: colors.color }}>
                          {service.category}
                        </span>
                        <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>{service.duration} min</span>
                        {service.rating > 0 && (
                          <span className="text-xs" style={{ color: "#F59E0B" }}>⭐ {service.rating}</span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs mb-4 line-clamp-2" style={{ color: "var(--fur-slate-light)" }}>{service.description}</p>

                    <div className="flex items-center justify-between py-3 border-t border-b mb-4" style={{ borderColor: "var(--border)" }}>
                      <div>
                        <p className="text-lg font-900" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
                          {formatCurrency(service.price)}
                        </p>
                        <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>{service.priceUnit}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-700 text-sm" style={{ color: "var(--fur-slate)" }}>{service.totalBookings}</p>
                        <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>bookings</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/provider/services/${service.id}/edit`)}
                        className="flex-1 py-2 rounded-xl text-sm font-700 transition-colors border"
                        style={{ borderColor: "var(--fur-teal)", color: "var(--fur-teal)", background: "var(--fur-teal-light)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-teal)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "var(--fur-teal-light)")}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggle(service.id, service.name, service.isActive)}
                        className="flex-1 py-2 rounded-xl text-sm font-700 transition-colors border"
                        style={service.isActive
                          ? { borderColor: "var(--border)", color: "var(--fur-slate-mid)", background: "var(--fur-mist)" }
                          : { borderColor: "#D1FAE5", color: "#065F46", background: "#D1FAE5" }}
                      >
                        {service.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(service.id)}
                        className="p-2 rounded-xl transition-colors"
                        style={{ color: "var(--fur-rose)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-rose-light)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Delete confirm */}
                    {deleteConfirmId === service.id && (
                      <div className="mt-3 p-3 rounded-xl" style={{ background: "var(--fur-rose-light)", border: "1px solid #FCA5A5" }}>
                        <p className="text-sm font-700 mb-2" style={{ color: "var(--fur-rose)" }}>
                          Delete "{service.name}"?
                        </p>
                        <div className="flex gap-2">
                          <button onClick={() => setDeleteConfirmId(null)}
                            className="flex-1 py-1.5 rounded-lg text-sm font-700 bg-white border"
                            style={{ borderColor: "var(--border)", color: "var(--fur-slate-mid)" }}>
                            Cancel
                          </button>
                          <button onClick={() => handleDelete(service.id)}
                            className="flex-1 py-1.5 rounded-lg text-sm font-700 text-white"
                            style={{ background: "var(--fur-rose)" }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProviderLayout>
  );
};

export default MyServicesPage;