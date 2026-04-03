"use client";

import React, { useState, useMemo } from "react";
import { useAdminContext, type ProviderRecord } from "../context/AdminContext";
import AdminLayout from "../components/AdminLayout";

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

const ProviderVerificationPage: React.FC = () => {
  const { providers, verifyProvider, unverifyProvider, rejectProvider, isLoading } = useAdminContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "verified" | "rejected">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnverify = async (provider: ProviderRecord) => {
    setActionLoading(provider.id);
    try {
      await unverifyProvider(provider.id);
      showSuccess(`${provider.businessName} verification removed.`);
    } catch (err) {
      showError((err as Error).message || "Failed to update provider.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (provider: ProviderRecord) => {
    setActionLoading(provider.id);
    try {
      await rejectProvider(provider.id);
      showSuccess(`${provider.businessName} has been rejected.`);
    } catch (err) {
      showError((err as Error).message || "Failed to reject provider.");
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
            { label: "Total Providers", value: providers.length, bg: "#EDE9FE", color: "#5B21B6" },
            { label: "Pending Review", value: providers.filter(p => !p.isVerified && !p.isRejected).length, bg: "#FEF3C7", color: "#92400E" },
            { label: "Verified", value: verifiedCount, bg: "#D1FAE5", color: "#065F46" },
            { label: "Rejected", value: providers.filter(p => p.isRejected).length, bg: "#FEE2E2", color: "#991B1B" },
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
                  borderColor: provider.isVerified ? "var(--border)" : provider.isRejected ? "#FCA5A5" : "#FCD34D"
                }}>
                <div className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                  {/* Provider Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        background: provider.isVerified ? "#D1FAE5" : provider.isRejected ? "#FEE2E2" : "#FEF3C7",
                        color: provider.isVerified ? "#059669" : provider.isRejected ? "#991B1B" : "#92400E"
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
                          {provider.isVerified ? <><CheckIcon /> Verified</> : provider.isRejected ? <>Rejected</> : <>Pending</>}
                        </span>
                      </div>
                      <p className="text-xs truncate" style={{ color: "var(--fur-slate-light)" }}>
                        {provider.email}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {provider.contactLink && (
                      <a href={provider.contactLink} target="_blank" rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl text-sm font-700 border transition-all flex items-center gap-1.5"
                        style={{ borderColor: "var(--border)", color: "var(--fur-teal)", background: "var(--fur-teal-light)" }}>
                        <LinkIcon /> Profile
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
                      <>
                        <button
                          onClick={() => handleVerify(provider)}
                          disabled={actionLoading === provider.id}
                          className="px-4 py-2 rounded-xl text-sm font-700 text-white transition-all disabled:opacity-60 flex items-center gap-1.5"
                          style={{ background: "linear-gradient(135deg, #059669, #065F46)", boxShadow: "0 2px 8px rgba(5,150,105,0.3)" }}>
                          {actionLoading === provider.id ? "..." : <><CheckIcon /> Verify</>}
                        </button>
                        {!provider.isRejected && (
                          <button
                            onClick={() => handleReject(provider)}
                            disabled={actionLoading === provider.id}
                            className="px-4 py-2 rounded-xl text-sm font-700 border transition-all disabled:opacity-60"
                            style={{ borderColor: "#FCA5A5", color: "#991B1B", background: "#FEE2E2" }}>
                            {actionLoading === provider.id ? "..." : "Reject"}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Documents for review */}
                {(provider.validIdUrl || provider.credentialsUrl) && (
                  <div className="px-5 pb-4 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
                    <p className="text-xs font-700 uppercase tracking-widest mb-2" style={{ color: "var(--fur-slate-mid)" }}>
                      Submitted Documents
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {provider.validIdUrl && (
                        <a
                          href={provider.validIdUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-700 border transition-all"
                          style={{ borderColor: "#BFDBFE", background: "#EFF6FF", color: "#1E40AF" }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
                          </svg>
                          View Valid ID
                        </a>
                      )}
                      {provider.credentialsUrl && (
                        <a
                          href={provider.credentialsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-700 border transition-all"
                          style={{ borderColor: "#A7F3D0", background: "#ECFDF5", color: "#065F46" }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                          </svg>
                          View Credentials
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {!provider.validIdUrl && !provider.credentialsUrl && !provider.isVerified && (
                  <div className="px-5 pb-3 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
                    <p className="text-xs flex items-center gap-1.5" style={{ color: "#92400E" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      No documents submitted yet
                    </p>
                  </div>
                )}

                {/* Metadata bar */}
                <div className="px-5 pb-4 flex items-center gap-4 text-xs" style={{ color: "var(--fur-slate-light)" }}>
                  <span className="flex items-center gap-1"><CalendarIcon /> Joined {new Date(provider.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  {provider.totalReviews > 0 && <span className="flex items-center gap-1"><MessageIcon /> {provider.totalReviews} reviews</span>}
                  {provider.contactLink && (
                    <span className="truncate flex items-center gap-1"><LinkIcon /> {provider.contactLink}</span>
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
