"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useProviderContext } from "../context/ProviderAppContext";
import { getProviderDashboardStats, formatCurrency } from "../utils/providerUtils";
import { upsertProviderProfileData } from "@/app/lib/api";
import { supabase } from "@/app/lib/supabase";
import ProviderLayout from "../components/ProviderLayout";

const getStorageKey = (userId: string) => `provider_profile_data_${userId}`;

const ProviderProfilePage: React.FC = () => {
  const router = useRouter();
  const { user, services, bookings, updateUser } = useProviderContext();
  const stats = getProviderDashboardStats(bookings, services);

  const { liveRating, liveReviewCount } = useMemo(() => {
    const reviewed = bookings.filter(
      (b) => b.status === "completed" && typeof b.rating === "number" && b.rating > 0
    );
    const count = reviewed.length;
    const avg =
      count > 0
        ? Math.round((reviewed.reduce((sum, b) => sum + (b.rating ?? 0), 0) / count) * 10) / 10
        : 0;
    return { liveRating: avg, liveReviewCount: count };
  }, [bookings]);

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    businessName: user.businessName || "",
    businessAddress: user.businessAddress || "",
    bio: user.bio || "",
    contactLink: user.contactLink || "",
  });

  useEffect(() => {
    const fetchProviderData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const [{ data: userRow }, { data: provRow }] = await Promise.all([
        supabase
          .from("users")
          .select("name, email, phone, avatar")
          .eq("id", authUser.id)
          .maybeSingle(),
        supabase
          .from("providers")
          .select("bio, business_name, business_address, contact_link, phone, email")
          .eq("user_id", authUser.id)
          .maybeSingle(),
      ]);

      const resolvedEmail =
        provRow?.email && provRow.email.trim() !== ""
          ? provRow.email
          : userRow?.email && userRow.email.trim() !== ""
          ? userRow.email
          : authUser.email ?? "";

      let localData: Record<string, string> | null = null;
      try {
        const saved = localStorage.getItem(getStorageKey(authUser.id));
        if (saved) localData = JSON.parse(saved);
      } catch {}

      setFormData({
        name: localData?.name ?? userRow?.name ?? user.name ?? "",
        email: localData?.email ?? resolvedEmail,
        phone: localData?.phone ?? provRow?.phone ?? userRow?.phone ?? user.phone ?? "",
        businessName: localData?.businessName ?? provRow?.business_name ?? user.businessName ?? "",
        businessAddress: localData?.businessAddress ?? provRow?.business_address ?? user.businessAddress ?? "",
        bio: localData?.bio ?? provRow?.bio ?? user.bio ?? "",
        contactLink: localData?.contactLink ?? provRow?.contact_link ?? user.contactLink ?? "",
      });
    };

    fetchProviderData();
  }, [user.id]);

  const [passwordData, setPasswordData] = useState({ current: "", next: "", confirm: "" });
  const [successMsg, setSuccessMsg] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "business" | "security" | "policies">("profile");

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setSaveError(null);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      return alert("Name and email are required");
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("Not authenticated");

      await upsertProviderProfileData(authUser.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        businessName: formData.businessName,
        businessAddress: formData.businessAddress,
        bio: formData.bio,
        contactLink: formData.contactLink,
      });

      try {
        localStorage.setItem(getStorageKey(authUser.id), JSON.stringify(formData));
      } catch {}

      updateUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        businessName: formData.businessName,
        businessAddress: formData.businessAddress,
        bio: formData.bio,
        contactLink: formData.contactLink,
      });

      showSuccess("Profile updated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save profile.";
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = () => {
    if (!passwordData.current || !passwordData.next || !passwordData.confirm) {
      return alert("Please fill in all password fields");
    }
    if (passwordData.next !== passwordData.confirm) {
      return alert("New passwords do not match");
    }
    if (passwordData.next.length < 6) {
      return alert("Password must be at least 6 characters");
    }
    setPasswordData({ current: "", next: "", confirm: "" });
    showSuccess("Password changed successfully!");
  };

  const TAB_ICONS = {
    profile: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
      </svg>
    ),
    business: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
    security: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    policies: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  };

  const TABS = [
    { id: "profile" as const, label: "Personal Info" },
    { id: "business" as const, label: "Business" },
    { id: "security" as const, label: "Security" },
    { id: "policies" as const, label: "Policies" },
  ];

  return (
    <ProviderLayout>
      <div className="space-y-5 max-w-4xl">
        <div>
          <h1 style={{ fontSize: "1.65rem", fontWeight: 400, color: "var(--fur-slate)", marginBottom: 3 }}>Profile</h1>
          <p className="text-gray-500 text-sm">Manage your account and business settings</p>
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

        {saveError && (
          <div className="flex items-center gap-3 p-4 rounded-xl border"
            style={{ background: "#FEE2E2", borderColor: "#FCA5A5", color: "#991B1B" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="font-700 text-sm">{saveError}</span>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="rounded-2xl border p-6" style={{ background: "white", borderColor: "var(--border)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-900 shrink-0"
              style={{ background: "linear-gradient(135deg, #3B4F6B, #1A2332)", fontFamily: "'Fraunces', serif" }}>
              {user.avatar || formData.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-900" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>{formData.name}</h2>
                {user.isVerified && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-700 flex items-center gap-1"
                    style={{ background: "var(--fur-teal-light)", color: "var(--fur-teal-dark)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm mt-0.5" style={{ color: "var(--fur-slate-light)" }}>{formData.businessName}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--fur-slate-light)" }}>{formData.email}</p>
            </div>
            <div className="flex sm:flex-col gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
                style={{ background: "#FFFBEB", borderColor: "#FCD34D" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="text-sm font-700" style={{ color: "#92400E" }}>
                  {liveRating > 0 ? liveRating.toFixed(1) : "—"}
                </span>
                <span className="text-xs" style={{ color: "#B45309" }}>({liveReviewCount})</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
                style={{ background: "#D1FAE5", borderColor: "#6EE7B7" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span className="text-sm font-700" style={{ color: "#065F46" }}>{formatCurrency(stats.totalEarnings)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
            {[
              { label: "Total Bookings", value: stats.totalBookings },
              { label: "Completed", value: stats.completedBookings },
              { label: "Active Services", value: stats.activeServices },
              { label: "This Month", value: formatCurrency(stats.monthlyEarnings) },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-900" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--fur-slate-light)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)" }}>
          <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === "policies") {
                    router.push("/provider/policies"); // ← adjust to your actual route
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className="flex items-center gap-2 px-5 py-3.5 text-sm font-700 border-b-2 transition-colors"
                style={activeTab === tab.id
                  ? { borderColor: "var(--fur-teal)", color: "var(--fur-teal)", background: "var(--fur-teal-light)" }
                  : { borderColor: "transparent", color: "var(--fur-slate-light)" }}
              >
                {TAB_ICONS[tab.id]}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">

            {activeTab === "profile" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-700 uppercase tracking-wide mb-1.5" style={{ color: "var(--fur-slate-mid)" }}>Full Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="fur-input" suppressHydrationWarning />
                  </div>
                  <div>
                    <label className="block text-xs font-700 uppercase tracking-wide mb-1.5" style={{ color: "var(--fur-slate-mid)" }}>Email Address</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="fur-input" suppressHydrationWarning />
                  </div>
                  <div>
                    <label className="block text-xs font-700 uppercase tracking-wide mb-1.5" style={{ color: "var(--fur-slate-mid)" }}>Phone Number</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="fur-input" suppressHydrationWarning />
                  </div>
                  <div>
                    <label className="block text-xs font-700 uppercase tracking-wide mb-1.5" style={{ color: "var(--fur-slate-mid)" }}>Role</label>
                    <input type="text" defaultValue="Service Provider" disabled className="fur-input opacity-50 cursor-not-allowed" suppressHydrationWarning />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button onClick={handleSaveProfile} disabled={isSaving} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60">
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "business" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-700 uppercase tracking-wide mb-1.5" style={{ color: "var(--fur-slate-mid)" }}>Business Name</label>
                  <input type="text" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} className="fur-input" suppressHydrationWarning />
                </div>
                <div>
                  <label className="block text-xs font-700 uppercase tracking-wide mb-1.5" style={{ color: "var(--fur-slate-mid)" }}>Business Address</label>
                  <input type="text" value={formData.businessAddress} onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })} placeholder="123 Main St, City, State ZIP" className="fur-input" suppressHydrationWarning />
                </div>
                <div>
                  <label className="block text-xs font-700 uppercase tracking-wide mb-1.5" style={{ color: "var(--fur-slate-mid)" }}>Bio / About</label>
                  <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={4} placeholder="Tell pet owners about your experience and approach..." className="fur-input resize-none" suppressHydrationWarning />
                  <p className="text-xs mt-1" style={{ color: "var(--fur-slate-light)" }}>{formData.bio.length}/500 characters</p>
                </div>
                <div>
                  <label className="block text-xs font-700 uppercase tracking-wide mb-1.5" style={{ color: "var(--fur-slate-mid)" }}>Contact / Social Link</label>
                  <input type="url" value={formData.contactLink} onChange={(e) => setFormData({ ...formData, contactLink: e.target.value })} placeholder="https://facebook.com/yourpage" className="fur-input" suppressHydrationWarning />
                  <p className="text-xs mt-1" style={{ color: "var(--fur-slate-light)" }}>Pet owners will see this on your public profile.</p>
                </div>
                <div className="flex justify-end pt-2">
                  <button onClick={handleSaveProfile} disabled={isSaving} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60">
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-700 uppercase tracking-wide mb-1.5" style={{ color: "var(--fur-slate-mid)" }}>Current Password</label>
                  <input type="password" value={passwordData.current} onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })} className="fur-input" suppressHydrationWarning />
                </div>
                <div>
                  <label className="block text-xs font-700 uppercase tracking-wide mb-1.5" style={{ color: "var(--fur-slate-mid)" }}>New Password</label>
                  <input type="password" value={passwordData.next} onChange={(e) => setPasswordData({ ...passwordData, next: e.target.value })} className="fur-input" suppressHydrationWarning />
                </div>
                <div>
                  <label className="block text-xs font-700 uppercase tracking-wide mb-1.5" style={{ color: "var(--fur-slate-mid)" }}>Confirm New Password</label>
                  <input type="password" value={passwordData.confirm} onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })} className="fur-input" suppressHydrationWarning />
                </div>
                <div className="rounded-xl p-3 border text-sm font-600"
                  style={{ background: "var(--fur-teal-light)", borderColor: "var(--fur-teal)", color: "var(--fur-teal-dark)" }}>
                  Password must be at least 6 characters long.
                </div>
                <div className="flex justify-end pt-2">
                  <button onClick={handleChangePassword} className="btn-primary px-6 py-2.5 text-sm">Change Password</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </ProviderLayout>
  );
};

export default ProviderProfilePage;