"use client";

import React, { useState, useMemo } from "react";
import { useAdminContext, type ProviderRecord } from "../context/AdminContext";
import AdminLayout from "../components/AdminLayout";

// ─── Icons ────────────────────────────────────────────────────────────────────

const BuildingIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const LinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const MessageIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const EmptyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const LayersIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const TagIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const BanIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceRecord {
  id: string;
  name: string;
  category: string;
  price: number;
  isActive: boolean;
  description?: string;
}

// ─── Services Drawer ──────────────────────────────────────────────────────────

const ServicesPanelOverlay: React.FC<{
  provider: ProviderRecord;
  services: ServiceRecord[];
  isLoadingServices: boolean;
  fetchError: string | null;
  onClose: () => void;
}> = ({ provider, services, isLoadingServices, fetchError, onClose }) => {
  const [serviceFilter, setServiceFilter] = useState<"all" | "active" | "inactive">("all");

  const active = services.filter((s) => s.isActive);
  const inactive = services.filter((s) => !s.isActive);
  const filtered =
    serviceFilter === "all" ? services :
    serviceFilter === "active" ? active : inactive;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(15, 23, 42, 0.35)",
          backdropFilter: "blur(2px)",
          zIndex: 40,
          animation: "fadeInBackdrop 0.2s ease",
        }}
      />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(520px, 100vw)",
        background: "white",
        zIndex: 50,
        display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 40px rgba(15,23,42,0.12)",
        animation: "slideInDrawer 0.28s cubic-bezier(0.22,1,0.36,1)",
        fontFamily: "'Nunito', sans-serif",
      }}>
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--border)",
          background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: "#D1FAE5", color: "#059669",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <BuildingIcon size={20} />
              </div>
              <div>
                <h2 style={{
                  margin: 0, fontSize: 17, fontWeight: 800,
                  color: "var(--fur-slate)",
                  fontFamily: "'Fraunces', serif",
                }}>
                  {provider.businessName}
                </h2>
                <p style={{ margin: 0, fontSize: 12, color: "var(--fur-slate-light)", marginTop: 1 }}>
                  Services Overview
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 10, border: "1px solid var(--border)",
                background: "white", cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
                color: "var(--fur-slate-mid)", flexShrink: 0,
                transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "#FEE2E2";
                (e.currentTarget as HTMLElement).style.color = "#991B1B";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "white";
                (e.currentTarget as HTMLElement).style.color = "var(--fur-slate-mid)";
              }}
            >
              <CloseIcon />
            </button>
          </div>
          {!isLoadingServices && !fetchError && (
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              {[
                { label: "Total", value: services.length, bg: "#EDE9FE", color: "#5B21B6" },
                { label: "Active", value: active.length, bg: "#D1FAE5", color: "#065F46" },
                { label: "Inactive", value: inactive.length, bg: "#FEE2E2", color: "#991B1B" },
              ].map((chip) => (
                <div key={chip.label} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 12px", borderRadius: 99,
                  background: chip.bg, color: chip.color,
                  fontSize: 12, fontWeight: 700,
                }}>
                  <span style={{ fontSize: 15, fontFamily: "'Fraunces', serif", fontWeight: 900 }}>
                    {chip.value}
                  </span>
                  <span>{chip.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isLoadingServices && !fetchError && services.length > 0 && (
          <div style={{ padding: "12px 24px", borderBottom: "1px solid var(--border)", display: "flex", gap: 6 }}>
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setServiceFilter(f)}
                style={{
                  padding: "6px 14px", borderRadius: 10,
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  border: "2px solid", transition: "all 0.15s",
                  textTransform: "capitalize",
                  ...(serviceFilter === f
                    ? { background: "var(--fur-teal)", color: "white", borderColor: "var(--fur-teal)" }
                    : { background: "white", color: "var(--fur-slate-mid)", borderColor: "var(--border)" }
                  ),
                }}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
          {isLoadingServices && (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "#EDE9FE", color: "#5B21B6",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px", animation: "pulse 1.5s infinite",
              }}>
                <LayersIcon size={22} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--fur-slate)" }}>Loading services…</p>
            </div>
          )}
          {!isLoadingServices && fetchError && (
            <div style={{
              padding: "14px 16px", borderRadius: 12,
              background: "#FEE2E2", border: "1px solid #FCA5A5",
              color: "#991B1B", fontSize: 13, fontWeight: 600,
            }}>
              {fetchError}
            </div>
          )}
          {!isLoadingServices && !fetchError && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "var(--fur-mist)", color: "var(--fur-slate-light)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px",
              }}>
                <LayersIcon size={22} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--fur-slate)", margin: "0 0 4px" }}>
                No services found
              </p>
              <p style={{ fontSize: 12, color: "var(--fur-slate-light)", margin: 0 }}>
                {serviceFilter === "all"
                  ? "This provider hasn't added any services yet."
                  : `No ${serviceFilter} services.`}
              </p>
            </div>
          )}
          {!isLoadingServices && !fetchError && filtered.map((service) => (
            <div
              key={service.id}
              style={{
                border: "1px solid",
                borderColor: service.isActive ? "#A7F3D0" : "#E5E7EB",
                borderRadius: 14, overflow: "hidden",
                background: service.isActive ? "#F0FDF4" : "#FAFAFA",
                transition: "box-shadow 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}
            >
              <div style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "var(--fur-slate)" }}>
                        {service.name}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                        background: service.isActive ? "#D1FAE5" : "#F3F4F6",
                        color: service.isActive ? "#065F46" : "#6B7280",
                        display: "inline-flex", alignItems: "center", gap: 4,
                      }}>
                        <span style={{
                          width: 5, height: 5, borderRadius: "50%",
                          background: service.isActive ? "#10B981" : "#9CA3AF",
                          display: "inline-block",
                        }} />
                        {service.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {service.description && (
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--fur-slate-light)", lineHeight: 1.5 }}>
                        {service.description}
                      </p>
                    )}
                  </div>
                  <div style={{
                    fontSize: 15, fontWeight: 900, color: "#059669",
                    fontFamily: "'Fraunces', serif",
                    whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    ₱{Number(service.price).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--fur-slate-mid)", fontWeight: 600 }}>
                    <TagIcon /> {service.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInBackdrop { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideInDrawer  { from { transform: translateX(100%) } to { transform: translateX(0) } }
        @keyframes pulse          { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
      `}</style>
    </>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const ProviderVerificationPage: React.FC = () => {
  const { providers, verifyProvider, unverifyProvider, rejectProvider, isLoading } = useAdminContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "verified" | "rejected">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedProvider, setSelectedProvider] = useState<ProviderRecord | null>(null);
  const [providerServices, setProviderServices] = useState<ServiceRecord[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [servicesFetchError, setServicesFetchError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      if (filterStatus === "pending" && (p.isVerified || p.isRejected)) return false;
      if (filterStatus === "verified" && !p.isVerified) return false;
      if (filterStatus === "rejected" && !p.isRejected) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !p.businessName.toLowerCase().includes(q) &&
          !p.name.toLowerCase().includes(q) &&
          !p.email.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [providers, filterStatus, searchQuery]);

  const showSuccess = (msg: string) => {
    setErrorMsg("");
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };
  const showError = (msg: string) => {
    setSuccessMsg("");
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 4000);
  };

  const handleVerify = async (provider: ProviderRecord) => {
    setActionLoading(provider.id);
    try {
      await verifyProvider(provider.id);
      showSuccess(`${provider.businessName} has been verified.`);
    } catch (err) {
      showError((err as Error).message || "Failed to verify provider.");
    } finally { setActionLoading(null); }
  };

  const handleUnverify = async (provider: ProviderRecord) => {
    setActionLoading(provider.id);
    try {
      await unverifyProvider(provider.id);
      showSuccess(`${provider.businessName} verification removed.`);
    } catch (err) {
      showError((err as Error).message || "Failed to update provider.");
    } finally { setActionLoading(null); }
  };

  const handleReject = async (provider: ProviderRecord) => {
    setActionLoading(provider.id);
    try {
      await rejectProvider(provider.id);
      showSuccess(`${provider.businessName} has been rejected.`);
    } catch (err) {
      showError((err as Error).message || "Failed to reject provider.");
    } finally { setActionLoading(null); }
  };

  const handleViewServices = async (provider: ProviderRecord) => {
    setSelectedProvider(provider);
    setProviderServices([]);
    setServicesFetchError(null);
    setIsLoadingServices(true);
    try {
      const res = await fetch(`/api/admin/providers/${provider.id}/services`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to load services.");
      setProviderServices(data.services as ServiceRecord[]);
    } catch (err) {
      setServicesFetchError((err as Error).message || "Failed to load services.");
    } finally {
      setIsLoadingServices(false);
    }
  };

  const closeDrawer = () => {
    setSelectedProvider(null);
    setProviderServices([]);
    setServicesFetchError(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-900 mb-1" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
            Provider Verification
          </h1>
          <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>
            Review and verify service providers before they go live on the platform.
          </p>
        </div>

        {successMsg && (
          <div className="flex items-center gap-3 p-4 rounded-xl border"
            style={{ background: "#D1FAE5", borderColor: "#6EE7B7", color: "#065F46" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="font-700 text-sm">{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-3 p-4 rounded-xl border"
            style={{ background: "#FEE2E2", borderColor: "#FCA5A5", color: "#991B1B" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="font-700 text-sm">{errorMsg}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Providers", value: providers.length, color: "#5B21B6" },
            { label: "Pending Review", value: providers.filter(p => !p.isVerified && !p.isRejected).length, color: "#92400E" },
            { label: "Verified", value: providers.filter(p => p.isVerified).length, color: "#065F46" },
            { label: "Rejected", value: providers.filter(p => p.isRejected).length, color: "#991B1B" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-5 border" style={{ background: "white", borderColor: "var(--border)" }}>
              <p className="text-2xl font-900 mb-1" style={{ fontFamily: "'Fraunces', serif", color: s.color }}>{s.value}</p>
              <p className="text-xs font-600" style={{ color: "var(--fur-slate-light)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-2xl p-5 border" style={{ background: "white", borderColor: "var(--border)" }}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search providers by name or email..."
                className="fur-input"
                style={{ paddingLeft: "2.5rem" }}
              />
              <span className="absolute left-3 top-3.5" style={{ color: "var(--fur-slate-light)" }}><SearchIcon /></span>
            </div>
            <div className="flex gap-2">
              {(["all", "pending", "verified", "rejected"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className="px-4 py-2 rounded-xl text-sm font-700 border-2 transition-all capitalize"
                  style={filterStatus === status
                    ? { background: "var(--fur-teal)", color: "white", borderColor: "var(--fur-teal)" }
                    : { background: "white", color: "var(--fur-slate-mid)", borderColor: "var(--border)" }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Provider List */}
        {isLoading ? (
          <div className="rounded-2xl p-16 text-center border" style={{ background: "white", borderColor: "var(--border)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse"
              style={{ background: "#EDE9FE", color: "#5B21B6" }}>
              <BuildingIcon size={28} />
            </div>
            <p className="font-700" style={{ color: "var(--fur-slate)" }}>Loading providers...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-16 text-center border" style={{ background: "white", borderColor: "var(--border)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--fur-mist)", color: "var(--fur-slate-light)" }}>
              <EmptyIcon />
            </div>
            <p className="font-700 text-lg mb-2" style={{ color: "var(--fur-slate)" }}>No providers found</p>
            <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((provider) => (
              <div key={provider.id} className="rounded-2xl border overflow-hidden"
                style={{
                  background: "white",
                  borderColor: provider.isVerified
                    ? "var(--border)"
                    : provider.isRejected
                    ? "#FCA5A5"
                    : "#FCD34D",
                }}>
                <div className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                  {/* Provider Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        background: provider.isVerified ? "#D1FAE5" : provider.isRejected ? "#FEE2E2" : "#FEF3C7",
                        color: provider.isVerified ? "#059669" : provider.isRejected ? "#991B1B" : "#92400E",
                      }}>
                      <BuildingIcon size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-800 text-base" style={{ color: "var(--fur-slate)" }}>
                          {provider.businessName}
                        </h3>
                        <span className="text-xs font-700 px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={provider.isVerified
                            ? { background: "#D1FAE5", color: "#065F46" }
                            : provider.isRejected
                              ? { background: "#FEE2E2", color: "#991B1B" }
                              : { background: "#FEF3C7", color: "#92400E" }}>
                          {provider.isVerified
                            ? <><CheckIcon /> Verified</>
                            : provider.isRejected
                              ? <><BanIcon /> Rejected</>
                              : <>Pending</>}
                        </span>
                      </div>
                      <p className="text-xs truncate" style={{ color: "var(--fur-slate-light)" }}>
                        {provider.email}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    {/* View Services — only for verified providers */}
                    {provider.isVerified && (
                      <button
                        onClick={() => handleViewServices(provider)}
                        className="px-3 py-2 rounded-xl text-sm font-700 border transition-all flex items-center gap-1.5"
                        style={{ borderColor: "#A7F3D0", color: "#065F46", background: "#ECFDF5" }}
                      >
                        <LayersIcon size={12} />
                        View Services
                        {provider.serviceCount > 0 && (
                          <span style={{
                            fontSize: 10, fontWeight: 800,
                            background: "#059669", color: "white",
                            borderRadius: 99, padding: "1px 6px",
                          }}>
                            {provider.serviceCount}
                          </span>
                        )}
                      </button>
                    )}

                    {provider.contactLink && (
                      <a href={provider.contactLink} target="_blank" rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl text-sm font-700 border transition-all flex items-center gap-1.5"
                        style={{ borderColor: "var(--border)", color: "var(--fur-teal)", background: "var(--fur-teal-light)" }}>
                        <LinkIcon /> Profile
                      </a>
                    )}

                    {/* ── Action buttons: verified → Revoke | rejected → locked badge | pending → Verify + Reject ── */}
                    {provider.isVerified ? (
                      <button
                        onClick={() => handleUnverify(provider)}
                        disabled={actionLoading === provider.id}
                        className="px-4 py-2 rounded-xl text-sm font-700 border transition-all disabled:opacity-60"
                        style={{ borderColor: "#FCA5A5", color: "#991B1B", background: "#FEE2E2" }}>
                        {actionLoading === provider.id ? "..." : "Revoke"}
                      </button>
                    ) : provider.isRejected ? (
                      // Rejected providers are locked — no further actions available
                      <span
                        className="px-4 py-2 rounded-xl text-sm font-700 border flex items-center gap-1.5"
                        style={{ borderColor: "#FCA5A5", color: "#991B1B", background: "#FEF2F2", opacity: 0.75 }}>
                        <BanIcon /> Rejected
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleVerify(provider)}
                          disabled={actionLoading === provider.id}
                          className="px-4 py-2 rounded-xl text-sm font-700 text-white transition-all disabled:opacity-60 flex items-center gap-1.5"
                          style={{ background: "linear-gradient(135deg, #059669, #065F46)", boxShadow: "0 2px 8px rgba(5,150,105,0.3)" }}>
                          {actionLoading === provider.id ? "..." : <><CheckIcon /> Verify</>}
                        </button>
                        <button
                          onClick={() => handleReject(provider)}
                          disabled={actionLoading === provider.id}
                          className="px-4 py-2 rounded-xl text-sm font-700 border transition-all disabled:opacity-60"
                          style={{ borderColor: "#FCA5A5", color: "#991B1B", background: "#FEE2E2" }}>
                          {actionLoading === provider.id ? "..." : "Reject"}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Documents */}
                {(provider.validIdUrl || provider.credentialsUrl) && (
                  <div className="px-5 pb-4 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
                    <p className="text-xs font-700 uppercase tracking-widest mb-2" style={{ color: "var(--fur-slate-mid)" }}>
                      Submitted Documents
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {provider.validIdUrl && (
                        <a href={provider.validIdUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-700 border transition-all"
                          style={{ borderColor: "#BFDBFE", background: "#EFF6FF", color: "#1E40AF" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
                          </svg>
                          View Valid ID
                        </a>
                      )}
                      {provider.credentialsUrl && (
                        <a href={provider.credentialsUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-700 border transition-all"
                          style={{ borderColor: "#A7F3D0", background: "#ECFDF5", color: "#065F46" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                          </svg>
                          View Credentials
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {!provider.validIdUrl && !provider.credentialsUrl && !provider.isVerified && !provider.isRejected && (
                  <div className="px-5 pb-3 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
                    <p className="text-xs flex items-center gap-1.5" style={{ color: "#92400E" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      No documents submitted yet
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div className="px-5 pb-4 flex items-center gap-4 text-xs" style={{ color: "var(--fur-slate-light)" }}>
                  <span className="flex items-center gap-1">
                    <CalendarIcon /> Joined {new Date(provider.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  {provider.totalReviews > 0 && (
                    <span className="flex items-center gap-1"><MessageIcon /> {provider.totalReviews} reviews</span>
                  )}
                  {provider.contactLink && (
                    <span className="truncate flex items-center gap-1"><LinkIcon /> {provider.contactLink}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProvider && (
        <ServicesPanelOverlay
          provider={selectedProvider}
          services={providerServices}
          isLoadingServices={isLoadingServices}
          fetchError={servicesFetchError}
          onClose={closeDrawer}
        />
      )}
    </AdminLayout>
  );
};

export default ProviderVerificationPage;