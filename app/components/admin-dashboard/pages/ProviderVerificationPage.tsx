"use client";

import React, { useState, useMemo } from "react";
import { useAdminContext, type ProviderRecord } from "../context/AdminContext";
import AdminLayout from "../components/AdminLayout";

const ProviderVerificationPage: React.FC = () => {
  const { providers, verifyProvider, unverifyProvider, isLoading } = useAdminContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "verified">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      if (filterStatus === "pending" && p.isVerified) return false;
      if (filterStatus === "verified" && !p.isVerified) return false;
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
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleVerify = async (provider: ProviderRecord) => {
    setActionLoading(provider.id);
    try {
      await verifyProvider(provider.id);
      showSuccess(`✓ ${provider.businessName} has been verified.`);
    } catch {
      showSuccess("Failed to verify provider.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnverify = async (provider: ProviderRecord) => {
    setActionLoading(provider.id);
    try {
      await unverifyProvider(provider.id);
      showSuccess(`${provider.businessName} verification removed.`);
    } catch {
      showSuccess("Failed to update provider.");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = providers.filter((p) => !p.isVerified).length;
  const verifiedCount = providers.filter((p) => p.isVerified).length;

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

        {/* Success Toast */}
        {successMsg && (
          <div className="flex items-center gap-3 p-4 rounded-xl border"
            style={{ background: "#D1FAE5", borderColor: "#6EE7B7", color: "#065F46" }}>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Providers", value: providers.length, bg: "#EDE9FE", color: "#5B21B6" },
            { label: "Pending Review", value: pendingCount, bg: "#FEF3C7", color: "#92400E" },
            { label: "Verified", value: verifiedCount, bg: "#D1FAE5", color: "#065F46" },
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
                className="fur-input pl-10"
              />
              <svg className="w-4 h-4 absolute left-3 top-3.5" style={{ color: "var(--fur-slate-light)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex gap-2">
              {(["all", "pending", "verified"] as const).map((status) => (
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
            <p className="text-4xl mb-3 animate-pulse">🏢</p>
            <p className="font-700" style={{ color: "var(--fur-slate)" }}>Loading providers...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-16 text-center border" style={{ background: "white", borderColor: "var(--border)" }}>
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-700 text-lg mb-2" style={{ color: "var(--fur-slate)" }}>No providers found</p>
            <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((provider) => (
              <div key={provider.id} className="rounded-2xl border overflow-hidden"
                style={{ background: "white", borderColor: provider.isVerified ? "var(--border)" : "#FCD34D" }}>
                <div className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                  {/* Provider Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: provider.isVerified ? "#D1FAE5" : "#FEF3C7" }}>
                      🏢
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-800 text-base" style={{ color: "var(--fur-slate)" }}>
                          {provider.businessName}
                        </h3>
                        <span className={`text-xs font-700 px-2 py-0.5 rounded-full ${
                          provider.isVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {provider.isVerified ? "✓ Verified" : "⏳ Pending"}
                        </span>
                      </div>
                      <p className="text-xs truncate" style={{ color: "var(--fur-slate-light)" }}>
                        {provider.email}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 md:w-64">
                    {[
                      { label: "Services", value: provider.serviceCount },
                      { label: "Bookings", value: provider.bookingCount },
                      { label: "Rating", value: provider.rating > 0 ? `${provider.rating}⭐` : "—" },
                    ].map((s) => (
                      <div key={s.label} className="text-center p-2 rounded-xl" style={{ background: "var(--fur-cream)" }}>
                        <p className="font-800 text-sm" style={{ color: "var(--fur-slate)" }}>{s.value}</p>
                        <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {provider.contactLink && (
                      <a href={provider.contactLink} target="_blank" rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl text-sm font-700 border transition-all"
                        style={{ borderColor: "var(--border)", color: "var(--fur-teal)", background: "var(--fur-teal-light)" }}>
                        🔗 Profile
                      </a>
                    )}
                    {provider.isVerified ? (
                      <button
                        onClick={() => handleUnverify(provider)}
                        disabled={actionLoading === provider.id}
                        className="px-4 py-2 rounded-xl text-sm font-700 border transition-all disabled:opacity-60"
                        style={{ borderColor: "#FCA5A5", color: "#991B1B", background: "#FEE2E2" }}>
                        {actionLoading === provider.id ? "..." : "Revoke"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerify(provider)}
                        disabled={actionLoading === provider.id}
                        className="px-4 py-2 rounded-xl text-sm font-700 text-white transition-all disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg, #059669, #065F46)", boxShadow: "0 2px 8px rgba(5,150,105,0.3)" }}>
                        {actionLoading === provider.id ? "..." : "✓ Verify Now"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Metadata bar */}
                <div className="px-5 pb-4 flex items-center gap-4 text-xs" style={{ color: "var(--fur-slate-light)" }}>
                  <span>📅 Joined {new Date(provider.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  {provider.totalReviews > 0 && <span>💬 {provider.totalReviews} reviews</span>}
                  {provider.contactLink && (
                    <span className="truncate">🔗 {provider.contactLink}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProviderVerificationPage;