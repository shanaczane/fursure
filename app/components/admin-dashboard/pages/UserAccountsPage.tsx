"use client";

import React, { useState, useMemo } from "react";
import { useAdminContext, type UserRecord } from "../context/AdminContext";
import AdminLayout from "../components/AdminLayout";

const UserAccountsPage: React.FC = () => {
  const { users, deleteUser, isLoading } = useAdminContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "owner" | "provider" | "admin">("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "bookings">("date");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const filtered = useMemo(() => {
    let result = users.filter((u) => {
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
    admin: { bg: "#FEE2E2", color: "#991B1B" },
  };

  const ownerCount = users.filter((u) => u.role === "owner").length;
  const providerCount = users.filter((u) => u.role === "provider").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

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

        {/* Success Toast */}
        {successMsg && (
          <div className="flex items-center gap-3 p-4 rounded-xl border"
            style={{ background: "#D1FAE5", borderColor: "#6EE7B7", color: "#065F46" }}>
            <span className="text-sm font-700">{successMsg}</span>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: users.length, bg: "#DBEAFE", color: "#1E40AF", icon: "👥" },
            { label: "Pet Owners", value: ownerCount, bg: "var(--fur-teal-light)", color: "var(--fur-teal-dark)", icon: "🐾" },
            { label: "Providers", value: providerCount, bg: "#EDE9FE", color: "#5B21B6", icon: "🏢" },
            { label: "Admins", value: adminCount, bg: "#FEE2E2", color: "#991B1B", icon: "🔑" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-5 border" style={{ background: "white", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{ background: s.bg }}>
                  {s.icon}
                </div>
              </div>
              <p className="text-2xl font-900 mb-0.5" style={{ fontFamily: "'Fraunces', serif", color: s.color }}>{s.value}</p>
              <p className="text-xs font-600" style={{ color: "var(--fur-slate-light)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-2xl p-5 border" style={{ background: "white", borderColor: "var(--border)" }}>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="fur-input pl-10"
              />
              <svg className="w-4 h-4 absolute left-3 top-3.5" style={{ color: "var(--fur-slate-light)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="fur-input md:w-44">
              <option value="date">Newest First</option>
              <option value="name">Name A–Z</option>
              <option value="bookings">Most Bookings</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "owner", "provider", "admin"] as const).map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className="px-4 py-1.5 rounded-full text-sm font-700 border-2 transition-all capitalize"
                style={filterRole === role
                  ? { background: "var(--fur-teal)", color: "white", borderColor: "var(--fur-teal)" }
                  : { background: "white", color: "var(--fur-slate-mid)", borderColor: "var(--border)" }}
              >
                {role === "all" ? "🐾 All" : role === "owner" ? "🐾 Pet Owners" : role === "provider" ? "🏢 Providers" : "🔑 Admins"}
              </button>
            ))}
          </div>
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
              <p className="text-3xl mb-3 animate-pulse">👥</p>
              <p className="font-700" style={{ color: "var(--fur-slate)" }}>Loading users...</p>
            </div>
          ) : (
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
                  {filtered.map((user) => {
                    const rc = roleColors[user.role] ?? roleColors.owner;
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-700 flex-shrink-0"
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
                                className="text-xs font-700 px-3 py-1.5 rounded-lg text-white transition-colors disabled:opacity-60"
                                style={{ background: "#EF4444" }}>
                                {actionLoading === user.id ? "..." : "Confirm"}
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="text-xs font-700 px-3 py-1.5 rounded-lg border transition-colors"
                                style={{ borderColor: "var(--border)", color: "var(--fur-slate-mid)" }}>
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(user.id)}
                              className="text-xs font-700 px-3 py-1.5 rounded-lg border transition-colors"
                              style={{ borderColor: "#FCA5A5", color: "#991B1B", background: "#FEE2E2" }}>
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <p className="text-4xl mb-3">🔍</p>
                        <p className="font-700" style={{ color: "var(--fur-slate)" }}>No users found</p>
                        <p className="text-sm mt-1" style={{ color: "var(--fur-slate-light)" }}>Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserAccountsPage;