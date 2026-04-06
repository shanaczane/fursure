"use client";

import React, { useState, useMemo } from "react";
import { useAdminContext } from "../context/AdminContext";
import AdminLayout from "../components/AdminLayout";

const UsersIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const PersonIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
  </svg>
);
const BuildingIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
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
const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const ROWS_PER_PAGE = 8;

const UserAccountsPage: React.FC = () => {
  const { users, deleteUser, isLoading } = useAdminContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "owner" | "provider">("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "bookings">("date");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    let result = users.filter((u) => {
      if (u.role === "admin") return false;
      if (filterRole !== "all" && u.role !== filterRole) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "bookings") return (b.bookingCount ?? 0) - (a.bookingCount ?? 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [users, filterRole, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pagedUsers = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const handleFilterChange = (role: typeof filterRole) => {
    setFilterRole(role);
    setCurrentPage(1);
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDelete = async (userId: string, userName: string) => {
    setActionLoading(userId);
    try {
      await deleteUser(userId);
      setConfirmDelete(null);
      showSuccess(`User "${userName}" has been removed.`);
    } catch {
      showSuccess("Failed to delete user.");
    } finally {
      setActionLoading(null);
    }
  };

  const roleColors: Record<string, { bg: string; color: string }> = {
    owner: { bg: "var(--fur-teal-light)", color: "var(--fur-teal-dark)" },
    provider: { bg: "#EDE9FE", color: "#5B21B6" },
  };

  const roleCounts = {
    all: users.filter(u => u.role !== "admin").length,
    owner: users.filter(u => u.role === "owner").length,
    provider: users.filter(u => u.role === "provider").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-900 mb-1" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
            User Accounts
          </h1>
          <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>
            Monitor and manage all registered user accounts.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Users", value: roleCounts.all, color: "#3B82F6", bg: "#DBEAFE", icon: <UsersIcon size={16} /> },
            { label: "Pet Owners", value: roleCounts.owner, color: "var(--fur-teal-dark)", bg: "var(--fur-teal-light)", icon: <PersonIcon size={16} /> },
            { label: "Providers", value: roleCounts.provider, color: "#5B21B6", bg: "#EDE9FE", icon: <BuildingIcon size={16} /> },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 border" style={{ background: "white", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              </div>
              <p className="text-2xl font-900 mb-0.5" style={{ fontFamily: "'Fraunces', serif", color: s.color }}>{s.value}</p>
              <p className="text-xs font-600" style={{ color: "var(--fur-slate-light)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Success Toast */}
        {successMsg && (
          <div className="flex items-center gap-3 p-4 rounded-xl border"
            style={{ background: "#D1FAE5", borderColor: "#6EE7B7", color: "#065F46" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="font-700 text-sm">{successMsg}</span>
          </div>
        )}

        {/* Filters */}
        <div className="rounded-2xl p-5 border" style={{ background: "white", borderColor: "var(--border)" }}>
          {/* Search + Sort row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="fur-input"
                style={{ paddingLeft: "2.5rem" }}
              />
              <span className="absolute left-3 top-3.5" style={{ color: "var(--fur-slate-light)" }}><SearchIcon /></span>
              {searchQuery && (
                <button
                  onClick={() => handleSearch("")}
                  className="absolute right-3 top-3.5"
                  style={{ color: "var(--fur-slate-light)", background: "none", border: "none", cursor: "pointer" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setCurrentPage(1); }}
                className="fur-input md:w-52 appearance-none pr-10"
                style={{ cursor: "pointer" }}
              >
                <option value="date">Sort: Newest First</option>
                <option value="name">Sort: Name A–Z</option>
                <option value="bookings">Sort: Most Bookings</option>
              </select>
              <span className="absolute right-3 top-3.5 pointer-events-none" style={{ color: "var(--fur-slate-light)" }}>
                <ChevronDownIcon />
              </span>
            </div>
          </div>

          {/* Role filter pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all" as const, label: "All Users", count: roleCounts.all, icon: <UsersIcon size={13} /> },
              { value: "owner" as const, label: "Pet Owners", count: roleCounts.owner, icon: <PersonIcon size={13} /> },
              { value: "provider" as const, label: "Providers", count: roleCounts.provider, icon: <BuildingIcon size={13} /> },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleFilterChange(opt.value)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-700 border-2 transition-all"
                style={filterRole === opt.value
                  ? { background: "var(--fur-teal)", color: "white", borderColor: "var(--fur-teal)" }
                  : { background: "white", color: "var(--fur-slate-mid)", borderColor: "var(--border)" }}
              >
                {opt.icon}
                {opt.label}
                <span className="text-xs font-700 px-1.5 py-0.5 rounded-full"
                  style={filterRole === opt.value
                    ? { background: "rgba(255,255,255,0.25)", color: "white" }
                    : { background: "var(--fur-mist)", color: "var(--fur-slate-mid)" }}>
                  {opt.count}
                </span>
              </button>
            ))}
          </div>

          {/* Active filter indicator */}
          {(searchQuery || filterRole !== "all") && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-600" style={{ color: "var(--fur-slate-light)" }}>
                <FilterIcon /> Showing {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                {searchQuery && ` for "${searchQuery}"`}
                {filterRole !== "all" && ` · ${filterRole}`}
              </span>
              <button
                onClick={() => { handleSearch(""); handleFilterChange("all"); }}
                className="text-xs font-700 px-2 py-0.5 rounded-full transition-all"
                style={{ background: "var(--fur-rose-light)", color: "var(--fur-rose)" }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* User Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)" }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm font-700" style={{ color: "var(--fur-slate-mid)" }}>
              {filtered.length} user{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse"
                style={{ background: "#DBEAFE", color: "#3B82F6" }}>
                <UsersIcon size={22} />
              </div>
              <p className="font-700" style={{ color: "var(--fur-slate)" }}>Loading users...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["User", "Role", "Phone", "Bookings", "Joined", "Actions"].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-700 uppercase tracking-wide"
                          style={{ color: "var(--fur-slate-light)" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                    {pagedUsers.map((user) => {
                      const rc = roleColors[user.role] ?? roleColors.owner;
                      return (
                        <tr key={user.id}
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-cream)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-700 shrink-0"
                                style={{ background: "linear-gradient(135deg, var(--fur-teal), var(--fur-teal-dark))" }}>
                                {(user.name || "?").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-700 text-sm" style={{ color: "var(--fur-slate)" }}>{user.name}</p>
                                <p className="text-xs truncate max-w-[180px]" style={{ color: "var(--fur-slate-light)" }}>{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-700 px-2 py-1 rounded-full capitalize"
                              style={{ background: rc.bg, color: rc.color }}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm" style={{ color: "var(--fur-slate-mid)" }}>
                              {user.phone ?? "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>
                              {user.bookingCount ?? 0}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                              {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {confirmDelete === user.id ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleDelete(user.id, user.name)}
                                  disabled={actionLoading === user.id}
                                  className="text-xs font-700 px-3 py-1.5 rounded-xl text-white transition-colors disabled:opacity-60"
                                  style={{ background: "#EF4444" }}>
                                  {actionLoading === user.id ? "..." : "Confirm"}
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="text-xs font-700 px-3 py-1.5 rounded-xl border transition-colors"
                                  style={{ borderColor: "var(--border)", color: "var(--fur-slate-mid)" }}>
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelete(user.id)}
                                className="text-xs font-700 px-3 py-1.5 rounded-xl border transition-colors"
                                style={{ borderColor: "#FCA5A5", color: "#991B1B", background: "#FEE2E2" }}>
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {pagedUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                            style={{ background: "var(--fur-mist)", color: "var(--fur-slate-light)" }}>
                            <SearchIcon />
                          </div>
                          <p className="font-700" style={{ color: "var(--fur-slate)" }}>No users found</p>
                          <p className="text-sm mt-1" style={{ color: "var(--fur-slate-light)" }}>Try adjusting your search or filters</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
                    >
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
                        <span key={`ellipsis-${idx}`} className="w-7 h-7 flex items-center justify-center text-xs"
                          style={{ color: "var(--fur-slate-light)" }}>…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setCurrentPage(item as number)}
                          className="w-7 h-7 rounded-lg text-xs font-700 border transition-all"
                          style={currentPage === item
                            ? { background: "var(--fur-teal)", color: "white", borderColor: "var(--fur-teal)" }
                            : { borderColor: "var(--border)", color: "var(--fur-slate-mid)" }}
                        >
                          {item}
                        </button>
                      ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all disabled:opacity-40"
                      style={{ borderColor: "var(--border)", color: "var(--fur-slate-mid)" }}
                    >
                      <ChevronRightIcon />
                    </button>
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

export default UserAccountsPage;