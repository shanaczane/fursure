"use client";

import React, { useState, useMemo } from "react";
import { useAdminContext, type ActivityLog } from "../context/AdminContext";
import AdminLayout from "../components/AdminLayout";

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const getRelativeTime = (dateStr: string) => {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const CalendarIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const PersonIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
  </svg>
);
const CheckCircleIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
  </svg>
);
const XCircleIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const WrenchIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);
const RefreshIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const InboxIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);
const ActivityIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const StarIcon = ({ size = 14, filled = false }: { size?: number; filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const MessageIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ─── Activity log type config ─────────────────────────────────────────────────

const typeConfig: Record<ActivityLog["type"], { icon: React.ReactNode; bg: string; color: string; label: string }> = {
  booking:      { icon: <CalendarIcon />,    bg: "#DBEAFE", color: "#1E40AF", label: "Booking" },
  registration: { icon: <PersonIcon />,      bg: "#D1FAE5", color: "#065F46", label: "Registration" },
  verification: { icon: <CheckCircleIcon />, bg: "#FEF3C7", color: "#92400E", label: "Verification" },
  cancellation: { icon: <XCircleIcon />,     bg: "#FEE2E2", color: "#991B1B", label: "Cancellation" },
  service:      { icon: <WrenchIcon />,      bg: "#EDE9FE", color: "#5B21B6", label: "Service" },
};

// ─── Star row helper ──────────────────────────────────────────────────────────

const StarRow: React.FC<{ rating: number; size?: number }> = ({ rating, size = 14 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
    {Array.from({ length: 5 }, (_, i) => <StarIcon key={i} size={size} filled={i < Math.round(rating)} />)}
  </div>
);

// ─── Reviews Panel ────────────────────────────────────────────────────────────

const ROWS_PER_PAGE = 10;

const ReviewsPanel: React.FC = () => {
  const { bookings, isLoading } = useAdminContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<"all" | "5" | "4" | "3" | "2" | "1">("all");
  const [sortBy, setSortBy] = useState<"date" | "rating_high" | "rating_low">("date");
  const [currentPage, setCurrentPage] = useState(1);

  const allReviews = useMemo(() =>
    bookings
      .filter((b) => typeof b.rating === "number" && b.rating > 0)
      .map((b) => ({
        id: b.id,
        ownerName: b.owner_name ?? b.ownerName ?? "Unknown",
        serviceName: b.service_name ?? b.serviceName ?? "Service",
        providerName: b.provider_name ?? b.providerName ?? "Provider",
        rating: b.rating as number,
        comment: b.review_comment ?? b.reviewComment ?? "",
        reviewDate: b.review_date ?? b.createdAt ?? new Date().toISOString(),
      })),
    [bookings]);

  const filtered = useMemo(() => {
    let result = allReviews.filter((r) => {
      if (ratingFilter !== "all" && Math.round(r.rating) !== parseInt(ratingFilter)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !r.ownerName.toLowerCase().includes(q) &&
          !r.serviceName.toLowerCase().includes(q) &&
          !r.providerName.toLowerCase().includes(q) &&
          !(r.comment ?? "").toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
    result.sort((a, b) => {
      if (sortBy === "rating_high") return b.rating - a.rating;
      if (sortBy === "rating_low") return a.rating - b.rating;
      return new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime();
    });
    return result;
  }, [allReviews, ratingFilter, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pagedReviews = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const handleSearch = (q: string) => { setSearchQuery(q); setCurrentPage(1); };
  const handleRatingFilter = (r: typeof ratingFilter) => { setRatingFilter(r); setCurrentPage(1); };

  const avgRating = allReviews.length
    ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    : 0;

  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: allReviews.filter(r => Math.round(r.rating) === star).length,
    pct: allReviews.length
      ? Math.round((allReviews.filter(r => Math.round(r.rating) === star).length / allReviews.length) * 100)
      : 0,
  }));

  const withComments = allReviews.filter(r => r.comment && r.comment.trim().length > 0).length;

  return (
    <div className="space-y-5">
      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 border md:col-span-2" style={{ background: "var(--fur-cream)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-6">
            <div className="text-center shrink-0">
              <p className="text-4xl font-900 mb-0.5" style={{ fontFamily: "'Fraunces', serif", color: "#92400E" }}>
                {avgRating > 0 ? avgRating.toFixed(1) : "—"}
              </p>
              <StarRow rating={avgRating} size={16} />
              <p className="text-xs mt-1" style={{ color: "var(--fur-slate-light)" }}>
                {allReviews.length} review{allReviews.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex-1 space-y-2">
              {ratingDist.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs font-700 w-3 shrink-0" style={{ color: "var(--fur-slate-mid)" }}>{star}</span>
                  <StarIcon size={11} filled />
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--fur-mist)" }}>
                    <div className="h-2 rounded-full transition-all"
                      style={{ width: `${pct}%`, background: star >= 4 ? "#10B981" : star === 3 ? "#F59E0B" : "#EF4444" }} />
                  </div>
                  <span className="text-xs w-8 text-right shrink-0" style={{ color: "var(--fur-slate-light)" }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-2xl p-5 border" style={{ background: "var(--fur-cream)", borderColor: "var(--border)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
            style={{ background: "#DBEAFE", color: "#1E40AF" }}>
            <MessageIcon />
          </div>
          <p className="text-3xl font-900 mb-1" style={{ fontFamily: "'Fraunces', serif", color: "#1E40AF" }}>{withComments}</p>
          <p className="text-sm font-700 mb-0.5" style={{ color: "var(--fur-slate)" }}>Written Comments</p>
          <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
            {allReviews.length > 0 ? Math.round((withComments / allReviews.length) * 100) : 0}% of reviews include a comment
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-5 border" style={{ background: "var(--fur-cream)", borderColor: "var(--border)" }}>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by owner, provider, service, or comment..."
              className="fur-input"
              style={{ paddingLeft: "2.5rem" }}
            />
            <span className="absolute left-3 top-3.5" style={{ color: "var(--fur-slate-light)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setCurrentPage(1); }}
              className="fur-input md:w-52 appearance-none pr-10"
              style={{ cursor: "pointer" }}
            >
              <option value="date">Sort: Most Recent</option>
              <option value="rating_high">Sort: Highest Rating</option>
              <option value="rating_low">Sort: Lowest Rating</option>
            </select>
            <span className="absolute right-3 top-3.5 pointer-events-none" style={{ color: "var(--fur-slate-light)" }}>
              <ChevronDownIcon />
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            { value: "all", label: "All Stars" },
            { value: "5",   label: "5 Stars" },
            { value: "4",   label: "4 Stars" },
            { value: "3",   label: "3 Stars" },
            { value: "2",   label: "2 Stars" },
            { value: "1",   label: "1 Star" },
          ] as { value: typeof ratingFilter; label: string }[]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleRatingFilter(opt.value)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-700 border-2 transition-all"
              style={ratingFilter === opt.value
                ? { background: "#F59E0B", color: "white", borderColor: "#F59E0B" }
                : { background: "white", color: "var(--fur-slate-mid)", borderColor: "var(--border)" }}
            >
              {opt.value !== "all" && <StarIcon size={11} filled={ratingFilter === opt.value} />}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)" }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-700" style={{ color: "var(--fur-slate-mid)" }}>
            {filtered.length} review{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse"
              style={{ background: "#FEF3C7", color: "#92400E" }}>
              <StarIcon size={22} filled />
            </div>
            <p className="font-700" style={{ color: "var(--fur-slate)" }}>Loading reviews...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--fur-mist)", color: "var(--fur-slate-light)" }}>
              <InboxIcon size={28} />
            </div>
            <p className="font-700" style={{ color: "var(--fur-slate)" }}>No reviews found</p>
            <p className="text-sm mt-1" style={{ color: "var(--fur-slate-light)" }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {pagedReviews.map((review) => (
                <div key={review.id} className="px-6 py-5 transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-cream)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-700 shrink-0"
                        style={{ background: "linear-gradient(135deg, var(--fur-teal), var(--fur-teal-dark))", fontSize: "0.9rem" }}>
                        {(review.ownerName || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-700 text-sm" style={{ color: "var(--fur-slate)" }}>{review.ownerName}</p>
                          <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>reviewed</span>
                          <p className="text-sm font-700 truncate" style={{ color: "var(--fur-teal)" }}>{review.serviceName}</p>
                        </div>
                        <p className="text-xs truncate" style={{ color: "var(--fur-slate-light)" }}>by {review.providerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="flex justify-end mb-0.5"><StarRow rating={review.rating} size={13} /></div>
                        <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                          {new Date(review.reviewDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-900"
                        style={{
                          fontFamily: "'Fraunces', serif", fontSize: "1rem",
                          background: review.rating >= 4 ? "#D1FAE5" : review.rating === 3 ? "#FEF3C7" : "#FEE2E2",
                          color: review.rating >= 4 ? "#065F46" : review.rating === 3 ? "#92400E" : "#991B1B",
                        }}>
                        {review.rating}
                      </div>
                    </div>
                  </div>
                  {review.comment && review.comment.trim() ? (
                    <div className="mt-3 p-3 rounded-xl border"
                      style={{
                        background: review.rating >= 4 ? "#F0FDF4" : review.rating === 3 ? "#FFFBEB" : "#FEF2F2",
                        borderColor: review.rating >= 4 ? "#BBF7D0" : review.rating === 3 ? "#FDE68A" : "#FCA5A5",
                      }}>
                      <div className="flex items-start gap-2">
                        <span style={{ color: review.rating >= 4 ? "#059669" : review.rating === 3 ? "#D97706" : "#DC2626", marginTop: 1, flexShrink: 0 }}>
                          <MessageIcon size={13} />
                        </span>
                        <p className="text-sm italic leading-relaxed"
                          style={{ color: review.rating >= 4 ? "#065F46" : review.rating === 3 ? "#92400E" : "#991B1B" }}>
                          "{review.comment}"
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs italic" style={{ color: "var(--fur-slate-light)" }}>
                      No written comment — rating only.
                    </p>
                  )}
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="px-6 py-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                  Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all disabled:opacity-40"
                    style={{ borderColor: "var(--border)", color: "var(--fur-slate-mid)" }}>
                    <ChevronLeftIcon />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce<(number | "...")[]>((acc, p, i, arr) => {
                      if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) => item === "..." ? (
                      <span key={`e-${idx}`} className="w-7 h-7 flex items-center justify-center text-xs"
                        style={{ color: "var(--fur-slate-light)" }}>…</span>
                    ) : (
                      <button key={item} onClick={() => setCurrentPage(item as number)}
                        className="w-7 h-7 rounded-lg text-xs font-700 border transition-all"
                        style={currentPage === item
                          ? { background: "var(--fur-teal)", color: "white", borderColor: "var(--fur-teal)" }
                          : { borderColor: "var(--border)", color: "var(--fur-slate-mid)" }}>
                        {item}
                      </button>
                    ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all disabled:opacity-40"
                    style={{ borderColor: "var(--border)", color: "var(--fur-slate-mid)" }}>
                    <ChevronRightIcon />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

type ActiveTab = "logs" | "reviews";

const LOGS_PER_PAGE = 10;

const SystemActivityPage: React.FC = () => {
  const { activityLogs, isLoading, refreshData } = useAdminContext();
  const [activeTab, setActiveTab] = useState<ActiveTab>("logs");
  const [filterType, setFilterType] = useState<ActivityLog["type"] | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [logsPage, setLogsPage] = useState(1);

  const filtered = useMemo(() => {
    return activityLogs.filter((log) => {
      if (filterType !== "all" && log.type !== filterType) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!log.description.toLowerCase().includes(q) && !(log.userName ?? "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [activityLogs, filterType, searchQuery]);

  const logsTotalPages = Math.max(1, Math.ceil(filtered.length / LOGS_PER_PAGE));
  const pagedLogs = filtered.slice((logsPage - 1) * LOGS_PER_PAGE, logsPage * LOGS_PER_PAGE);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: activityLogs.length };
    activityLogs.forEach((log) => { counts[log.type] = (counts[log.type] ?? 0) + 1; });
    return counts;
  }, [activityLogs]);

  const TABS: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: "logs",    label: "Activity Logs", icon: <ActivityIcon /> },
    { key: "reviews", label: "Reviews",        icon: <StarIcon size={16} filled /> },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-900 mb-1" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
              System Activity
            </h1>
            <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>
              Real-time overview of platform activity, events, and reviews.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-secondary flex items-center gap-2 px-4 py-2 disabled:opacity-60"
          >
            <span className={isRefreshing ? "animate-spin" : ""}><RefreshIcon /></span>
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        {/* Tab container */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)" }}>
          {/* Tab bar */}
          <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-6 py-4 text-sm font-700 border-b-2 transition-colors"
                style={activeTab === tab.key
                  ? { borderColor: "var(--fur-teal)", color: "var(--fur-teal)", background: "var(--fur-teal-light)" }
                  : { borderColor: "transparent", color: "var(--fur-slate-light)" }}>
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Activity Logs ── */}
          {activeTab === "logs" && (
            <>
              <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setLogsPage(1); }}
                      placeholder="Search activity..."
                      className="fur-input text-sm"
                      style={{ paddingLeft: "2.5rem" }}
                    />
                    <svg className="w-4 h-4 absolute left-3 top-3.5" style={{ color: "var(--fur-slate-light)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setFilterType("all"); setLogsPage(1); }}
                      className="px-3 py-1.5 rounded-full text-xs font-700 border-2 transition-all"
                      style={filterType === "all"
                        ? { background: "var(--fur-teal)", color: "white", borderColor: "var(--fur-teal)" }
                        : { background: "white", color: "var(--fur-slate-mid)", borderColor: "var(--border)" }}>
                      All ({typeCounts.all})
                    </button>
                    {(Object.keys(typeConfig) as ActivityLog["type"][]).map((type) => {
                      const cfg = typeConfig[type];
                      return (
                        <button
                          key={type}
                          onClick={() => { setFilterType(type); setLogsPage(1); }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-700 border-2 transition-all"
                          style={filterType === type
                            ? { background: "var(--fur-teal)", color: "white", borderColor: "var(--fur-teal)" }
                            : { background: "white", color: "var(--fur-slate-mid)", borderColor: "var(--border)" }}>
                          <span style={{ color: filterType === type ? "white" : cfg.color }}>{cfg.icon}</span>
                          {cfg.label} ({typeCounts[type] ?? 0})
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse"
                    style={{ background: "var(--fur-mist)", color: "var(--fur-slate-light)" }}>
                    <ActivityIcon size={22} />
                  </div>
                  <p className="font-700" style={{ color: "var(--fur-slate)" }}>Loading activity...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: "var(--fur-mist)", color: "var(--fur-slate-light)" }}>
                    <InboxIcon size={28} />
                  </div>
                  <p className="font-700" style={{ color: "var(--fur-slate)" }}>No activity found</p>
                </div>
              ) : (
                <>
                  <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                    {pagedLogs.map((log) => {
                      const cfg = typeConfig[log.type];
                      return (
                        <div key={log.id} className="px-6 py-4 flex items-start gap-4 transition-colors"
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-cream)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: cfg.bg, color: cfg.color }}>
                            {cfg.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-xs font-700 px-2 py-0.5 rounded-full"
                                style={{ background: cfg.bg, color: cfg.color }}>
                                {cfg.label}
                              </span>
                              <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                                {getRelativeTime(log.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm font-600" style={{ color: "var(--fur-slate)" }}>{log.description}</p>
                            {log.userName && (
                              <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--fur-slate-light)" }}>
                                <PersonIcon size={11} /> {log.userName}
                              </p>
                            )}
                          </div>
                          <div className="text-xs shrink-0" style={{ color: "var(--fur-slate-light)" }}>
                            {formatDate(log.createdAt)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {logsTotalPages > 1 && (
                    <div className="px-6 py-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                      <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                        Showing {(logsPage - 1) * LOGS_PER_PAGE + 1}–{Math.min(logsPage * LOGS_PER_PAGE, filtered.length)} of {filtered.length}
                      </p>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setLogsPage(p => Math.max(1, p - 1))} disabled={logsPage === 1}
                          className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all disabled:opacity-40"
                          style={{ borderColor: "var(--border)", color: "var(--fur-slate-mid)" }}>
                          <ChevronLeftIcon />
                        </button>
                        {Array.from({ length: logsTotalPages }, (_, i) => i + 1)
                          .filter(p => p === 1 || p === logsTotalPages || Math.abs(p - logsPage) <= 1)
                          .reduce<(number | "...")[]>((acc, p, i, arr) => {
                            if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("...");
                            acc.push(p);
                            return acc;
                          }, [])
                          .map((item, idx) => item === "..." ? (
                            <span key={`e-${idx}`} className="w-7 h-7 flex items-center justify-center text-xs"
                              style={{ color: "var(--fur-slate-light)" }}>…</span>
                          ) : (
                            <button key={item} onClick={() => setLogsPage(item as number)}
                              className="w-7 h-7 rounded-lg text-xs font-700 border transition-all"
                              style={logsPage === item
                                ? { background: "var(--fur-teal)", color: "white", borderColor: "var(--fur-teal)" }
                                : { borderColor: "var(--border)", color: "var(--fur-slate-mid)" }}>
                              {item}
                            </button>
                          ))}
                        <button onClick={() => setLogsPage(p => Math.min(logsTotalPages, p + 1))} disabled={logsPage === logsTotalPages}
                          className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all disabled:opacity-40"
                          style={{ borderColor: "var(--border)", color: "var(--fur-slate-mid)" }}>
                          <ChevronRightIcon />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ── Reviews ── */}
          {activeTab === "reviews" && (
            <div className="p-6">
              <ReviewsPanel />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SystemActivityPage;