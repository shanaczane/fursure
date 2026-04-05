"use client";

import React, { useState, useMemo } from "react";
import { useAdminContext } from "../context/AdminContext";
import AdminLayout from "../components/AdminLayout";

const StarIcon = ({ size = 14, filled = false }: { size?: number; filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
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
const InboxIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);
const MessageIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const StarRow: React.FC<{ rating: number; size?: number }> = ({ rating, size = 14 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
    {Array.from({ length: 5 }, (_, i) => <StarIcon key={i} size={size} filled={i < Math.round(rating)} />)}
  </div>
);

const ROWS_PER_PAGE = 10;

const ReviewsPage: React.FC = () => {
  const { bookings, providers, isLoading } = useAdminContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<"all" | "5" | "4" | "3" | "2" | "1">("all");
  const [sortBy, setSortBy] = useState<"date" | "rating_high" | "rating_low">("date");
  const [currentPage, setCurrentPage] = useState(1);

  // Derive reviews from bookings
  const allReviews = useMemo(() => {
    return (bookings ?? [])
      .filter((b: any) => typeof b.rating === "number" && b.rating > 0)
      .map((b: any) => ({
        id: b.id,
        ownerName: b.owner_name ?? b.ownerName ?? "Unknown",
        ownerEmail: b.owner_email ?? b.ownerEmail ?? "",
        serviceName: b.service_name ?? b.serviceName ?? "Service",
        providerName: b.provider_name ?? b.providerName ?? "Provider",
        rating: b.rating as number,
        comment: b.review_comment ?? b.reviewComment ?? "",
        reviewDate: b.review_date ?? b.createdAt ?? new Date().toISOString(),
        bookingDate: b.date ?? "",
      }));
  }, [bookings]);

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

  // Aggregate stats
  const avgRating = allReviews.length
    ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    : 0;

  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: allReviews.filter(r => Math.round(r.rating) === star).length,
    pct: allReviews.length ? Math.round((allReviews.filter(r => Math.round(r.rating) === star).length / allReviews.length) * 100) : 0,
  }));

  const withComments = allReviews.filter(r => r.comment && r.comment.trim().length > 0).length;

  return (
    <AdminLayout>
      <div className="space-y-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-900 mb-1" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
            Reviews
          </h1>
          <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>
            All owner ratings and comments submitted across the platform.
          </p>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rating breakdown card */}
          <div className="rounded-2xl p-5 border md:col-span-2" style={{ background: "white", borderColor: "var(--border)" }}>
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
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: star >= 4 ? "#10B981" : star === 3 ? "#F59E0B" : "#EF4444"
                        }}
                      />
                    </div>
                    <span className="text-xs w-8 text-right shrink-0" style={{ color: "var(--fur-slate-light)" }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comments stat */}
          <div className="rounded-2xl p-5 border" style={{ background: "white", borderColor: "var(--border)" }}>
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
        <div className="rounded-2xl p-5 border" style={{ background: "white", borderColor: "var(--border)" }}>
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
              <span className="absolute left-3 top-3.5" style={{ color: "var(--fur-slate-light)" }}><SearchIcon /></span>
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

          {/* Star filter */}
          <div className="flex flex-wrap gap-2">
            {([
              { value: "all", label: "All Stars" },
              { value: "5", label: "5 Stars" },
              { value: "4", label: "4 Stars" },
              { value: "3", label: "3 Stars" },
              { value: "2", label: "2 Stars" },
              { value: "1", label: "1 Star" },
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

        {/* Reviews table */}
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
                      {/* Left: reviewer info */}
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
                          <p className="text-xs truncate" style={{ color: "var(--fur-slate-light)" }}>
                            by {review.providerName}
                          </p>
                        </div>
                      </div>

                      {/* Right: rating + date */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="flex justify-end mb-0.5">
                            <StarRow rating={review.rating} size={13} />
                          </div>
                          <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                            {new Date(review.reviewDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-900"
                          style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: "1rem",
                            background: review.rating >= 4 ? "#D1FAE5" : review.rating === 3 ? "#FEF3C7" : "#FEE2E2",
                            color: review.rating >= 4 ? "#065F46" : review.rating === 3 ? "#92400E" : "#991B1B",
                          }}>
                          {review.rating}
                        </div>
                      </div>
                    </div>

                    {/* Comment */}
                    {review.comment && review.comment.trim() ? (
                      <div className="mt-3 ml-0 sm:ml-13 p-3 rounded-xl border"
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                  <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                    Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all disabled:opacity-40"
                      style={{ borderColor: "var(--border)", color: "var(--fur-slate-mid)" }}
                    ><ChevronLeftIcon /></button>
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
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all disabled:opacity-40"
                      style={{ borderColor: "var(--border)", color: "var(--fur-slate-mid)" }}
                    ><ChevronRightIcon /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReviewsPage;