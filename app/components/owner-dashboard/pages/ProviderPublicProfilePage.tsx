"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/app/contexts/AppContext";
import {
  fetchPublicProviderProfile,
  fetchProviderContactInfo,
  type PublicProviderProfile,
} from "@/app/lib/api";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

const PROFILE_STORAGE_KEY = "provider_profile_data";

const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-xl ${className ?? ""}`}
    style={{ background: "var(--fur-mist)" }}
  />
);

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg
        key={s}
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill={s <= Math.round(rating) ? "#F59E0B" : "none"}
        stroke="#F59E0B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

const categoryColors: Record<string, { bg: string; accent: string }> = {
  grooming:   { bg: "var(--fur-amber-light)", accent: "var(--fur-amber-dark)" },
  veterinary: { bg: "var(--fur-teal-light)",  accent: "var(--fur-teal-dark)" },
  training:   { bg: "#EDE9FE",                accent: "#5B21B6" },
  boarding:   { bg: "#E0E7FF",                accent: "#3730A3" },
  walking:    { bg: "#D1FAE5",                accent: "#065F46" },
  daycare:    { bg: "#FEF3C7",                accent: "#92400E" },
};

// Helper: safely read any field from an object, trying multiple key names
function pickField(obj: any, ...keys: string[]): string | null {
  if (!obj) return null;
  for (const key of keys) {
    const val = obj[key];
    if (val && typeof val === "string" && val.trim() !== "") return val.trim();
  }
  return null;
}

export default function ProviderPublicProfilePage({
  providerUserId,
}: {
  providerUserId: string;
}) {
  const router = useRouter();
  const { user, bookings } = useAppContext();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<PublicProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"about" | "services">("about");
  const [providerContact, setProviderContact] = useState<{
    providerEmail?: string;
    providerPhone?: string;
    providerContactLink?: string;
  }>({});

  const [localProfile, setLocalProfile] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    businessName?: string;
    businessAddress?: string;
    bio?: string;
    contactLink?: string;
  }>({});

  // ── Load localStorage once ──────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) setLocalProfile(JSON.parse(saved));
    } catch {}
  }, []);

  // ── Fetch profile + contact info whenever providerUserId changes ────────────
  useEffect(() => {
    if (!providerUserId) return;
    setLoading(true);
    setError(null);
    setProfile(null);
    setProviderContact({});

    Promise.allSettled([
      fetchPublicProviderProfile(providerUserId),
      fetchProviderContactInfo(providerUserId),
    ]).then(([profileResult, contactResult]) => {
      // Profile
      if (profileResult.status === "fulfilled") {
        if (!profileResult.value) {
          setError("Provider not found.");
        } else {
          setProfile(profileResult.value);
        }
      } else {
        console.error("[ProviderProfile] fetchPublicProviderProfile failed:", profileResult.reason);
        setError("Failed to load provider profile.");
      }

      // Contact info (non-critical — don't block on failure)
      if (contactResult.status === "fulfilled") {
        setProviderContact(contactResult.value ?? {});
      } else {
        console.warn("[ProviderProfile] fetchProviderContactInfo failed:", contactResult.reason);
      }

      setLoading(false);
    });
  }, [providerUserId]);

  // ── Diagnostic log ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.group(`[ProviderProfile] providerUserId=${providerUserId}`);
      console.log("profile:", profile);
      console.log("profile keys:", profile ? Object.keys(profile) : "null");
      console.log("providerContact:", providerContact);
      console.log("localProfile:", localProfile);
      console.groupEnd();
    }
  }, [providerUserId, profile, providerContact, localProfile]);

  // ── Guard: only use localStorage data if it belongs to THIS provider ────────
  const isLocalProfileMine = useMemo(() => {
    if (!profile || !localProfile || Object.keys(localProfile).length === 0) return false;
    const p = profile as any;
    const nameMatch =
      (localProfile.name && (localProfile.name === p.name || localProfile.name === p.businessName)) ||
      (localProfile.businessName && (localProfile.businessName === p.name || localProfile.businessName === p.businessName));
    const emailMatch =
      localProfile.email &&
      p.email &&
      localProfile.email === p.email;
    return !!(nameMatch || emailMatch);
  }, [profile, localProfile]);

  // ── Derived email ────────────────────────────────────────────────────────────
  // Tries every plausible field name the API might return
  const derivedEmail = useMemo(() => {
    // 1. Dedicated contact-info endpoint
    if (providerContact.providerEmail) return providerContact.providerEmail;
    // 2. Profile record — try every known field name
    const fromProfile = pickField(
      profile,
      "email",
      "providerEmail",
      "contactEmail",
      "businessEmail",
      "userEmail",
    );
    if (fromProfile) return fromProfile;
    // 3. localStorage — only if it's the same provider
    if (isLocalProfileMine && localProfile.email) return localProfile.email;
    // 4. Bookings fallback — match by ID or name
    const p = profile as any;
    const fromBooking = bookings.find(
      (b) =>
        (b.providerUserId === providerUserId ||
          b.providerName === p?.name ||
          b.providerName === p?.businessName) &&
        b.providerEmail
    )?.providerEmail;
    if (fromBooking) return fromBooking;
    return null;
  }, [providerContact, profile, isLocalProfileMine, localProfile, bookings, providerUserId]);

  // ── Derived phone ────────────────────────────────────────────────────────────
  const derivedPhone = useMemo(() => {
    if (providerContact.providerPhone) return providerContact.providerPhone;
    const fromProfile = pickField(
      profile,
      "phone",
      "providerPhone",
      "contactPhone",
      "phoneNumber",
      "contactNumber",
      "mobileNumber",
      "mobile",
      "telephone",
    );
    if (fromProfile) return fromProfile;
    if (isLocalProfileMine && localProfile.phone) return localProfile.phone;
    const p = profile as any;
    const fromBooking = bookings.find(
      (b) =>
        (b.providerUserId === providerUserId ||
          b.providerName === p?.name ||
          b.providerName === p?.businessName) &&
        (b as any).providerPhone
    )?.providerPhone;
    if (fromBooking) return fromBooking;
    return null;
  }, [providerContact, profile, isLocalProfileMine, localProfile, bookings, providerUserId]);

  // ── Derived contact link ────────────────────────────────────────────────────
  const derivedContactLink = useMemo(() => {
    if (providerContact.providerContactLink) return providerContact.providerContactLink;
    const fromProfile = pickField(
      profile,
      "contactLink",
      "providerContactLink",
      "socialLink",
      "website",
      "facebookLink",
      "instagramLink",
      "websiteUrl",
      "socialMediaLink",
    );
    if (fromProfile) return fromProfile;
    if (isLocalProfileMine && localProfile.contactLink) return localProfile.contactLink;
    return null;
  }, [providerContact, profile, isLocalProfileMine, localProfile]);

  // ── Derived address ─────────────────────────────────────────────────────────
  const derivedAddress = useMemo(() => {
    const fromProfile = pickField(
      profile,
      "address",
      "businessAddress",
      "location",
      "serviceArea",
      "city",
      "fullAddress",
      "providerAddress",
    );
    if (fromProfile) return fromProfile;
    if (isLocalProfileMine && localProfile.businessAddress) return localProfile.businessAddress;
    return null;
  }, [profile, isLocalProfileMine, localProfile]);

  // ── Derived bio ─────────────────────────────────────────────────────────────
  const derivedBio = useMemo(() => {
    const p = profile as any;
    const raw =
      p?.bio ||
      p?.description ||
      p?.about ||
      p?.providerBio ||
      (isLocalProfileMine ? localProfile.bio : undefined) ||
      null;
    if (!raw) return null;
    const trimmed = raw.trim();
    if (trimmed === "" || trimmed === p?.businessName || trimmed === p?.name) return null;
    return trimmed;
  }, [profile, isLocalProfileMine, localProfile]);

  // ── Live rating from local bookings ─────────────────────────────────────────
  const { liveRating, liveReviewCount } = useMemo(() => {
    const p = profile as any;
    const reviewed = bookings.filter((b) => {
      const nameMatch = p?.name && b.providerName === p.name;
      const businessNameMatch = p?.businessName && b.providerName === p.businessName;
      const idMatch = b.providerUserId === providerUserId;
      return (
        (nameMatch || businessNameMatch || idMatch) &&
        b.status === "completed" &&
        typeof b.rating === "number" &&
        b.rating > 0
      );
    });
    const count = reviewed.length;
    const avg =
      count > 0
        ? Math.round(
            (reviewed.reduce((sum, b) => sum + (b.rating ?? 0), 0) / count) * 10
          ) / 10
        : 0;
    return { liveRating: avg, liveReviewCount: count };
  }, [bookings, providerUserId, profile]);

  const upcomingCount = bookings.filter(
    (b) =>
      (b.status === "pending" || b.status === "confirmed") &&
      new Date(b.date + "T00:00:00") >= new Date(new Date().setHours(0, 0, 0, 0))
  ).length;

  const handleServiceClick = (serviceId: string) =>
    router.push(`/owner/services/${serviceId}`);
  const handleBack = () => router.back();

  // ── Shared layout wrapper ────────────────────────────────────────────────────
  const Layout = ({ children }: { children: React.ReactNode }) => (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "var(--fur-cream)", fontFamily: "'Nunito', sans-serif" }}
    >
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        upcomingBookingsCount={upcomingCount}
      />
      <div
        style={{
          marginLeft: isSidebarOpen ? "16rem" : "0",
          transition: "margin-left 300ms ease-in-out",
        }}
      >
        <TopNavbar
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="p-6 mt-16">{children}</main>
      </div>
    </div>
  );

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Layout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </Layout>
    );
  }

  // ── Error / not found ────────────────────────────────────────────────────────
  if (error || !profile) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <div className="text-5xl">🐾</div>
          <p
            className="font-bold text-lg"
            style={{ color: "var(--fur-slate)" }}
          >
            {error ?? "Provider not found."}
          </p>
          <button
            onClick={handleBack}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "var(--fur-teal)" }}
          >
            ← Go Back
          </button>
        </div>
      </Layout>
    );
  }

  const p = profile as any;
  const initials = profile.name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="space-y-4">

        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-bold px-3.5 py-2 rounded-xl border transition-all hover:shadow-sm"
          style={{
            color: "var(--fur-slate-mid)",
            borderColor: "var(--border)",
            background: "white",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to Services
        </button>

        {/* ── Hero card ── */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: "white", borderColor: "var(--border)" }}
        >
          <div className="px-6 pt-5">
            <div
              className="w-20 h-20 rounded-2xl border-4 flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #3B4F6B, #1A2332)",
                borderColor: "white",
                fontFamily: "'Fraunces', serif",
                letterSpacing: "-0.5px",
              }}
            >
              {profile.avatar && profile.avatar !== "👤" ? profile.avatar : initials}
            </div>
          </div>

          <div className="px-6 pt-3 pb-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1
                  className="text-xl font-black leading-tight"
                  style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}
                >
                  {profile.name}
                </h1>
                {profile.isVerified && (
                  <span
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-bold shrink-0"
                    style={{
                      background: "var(--fur-teal-light)",
                      color: "var(--fur-teal-dark)",
                    }}
                  >
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>
              {profile.businessName && profile.businessName !== profile.name && (
                <p
                  className="text-sm mt-0.5 truncate"
                  style={{ color: "var(--fur-slate-light)" }}
                >
                  {profile.businessName}
                </p>
              )}
            </div>

            {/* Stats strip */}
            <div
              className="mt-4 grid grid-cols-3 rounded-xl overflow-hidden"
              style={{ background: "var(--fur-cream)" }}
            >
              {/* Rating */}
              <div
                className="flex flex-col items-center py-3 px-2 gap-0.5"
                style={{ borderRight: "1px solid var(--border)" }}
              >
                <p
                  className="text-2xl font-black leading-none"
                  style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}
                >
                  {liveRating > 0 ? liveRating.toFixed(1) : "—"}
                </p>
                <Stars rating={liveRating} />
                <p className="text-xs mt-0.5" style={{ color: "var(--fur-slate-light)" }}>
                  {liveReviewCount} {liveReviewCount === 1 ? "review" : "reviews"}
                </p>
              </div>

              {/* Active Services */}
              <div
                className="flex flex-col items-center justify-center py-3 px-2 gap-0.5"
                style={{ borderRight: "1px solid var(--border)" }}
              >
                <p
                  className="text-2xl font-black leading-none"
                  style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}
                >
                  {profile.services.length}
                </p>
                <p className="text-xs text-center" style={{ color: "var(--fur-slate-light)" }}>
                  Active Services
                </p>
              </div>

              {/* Verified badge */}
              <div className="flex flex-col items-center justify-center py-3 px-2 gap-0.5">
                {profile.isVerified ? (
                  <>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: "var(--fur-teal-light)" }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--fur-teal-dark)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p
                      className="text-xs font-bold mt-0.5"
                      style={{ color: "var(--fur-teal-dark)" }}
                    >
                      Verified Pro
                    </p>
                  </>
                ) : (
                  <>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: "#F1F5F9" }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#94A3B8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--fur-slate-light)" }}>
                      Not Verified
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs card ── */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: "white", borderColor: "var(--border)" }}
        >
          {/* Tab headers */}
          <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
            {(["about", "services"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold border-b-2 transition-all"
                style={
                  activeTab === tab
                    ? {
                        borderColor: "var(--fur-teal)",
                        color: "var(--fur-teal)",
                        background: "var(--fur-teal-light)",
                      }
                    : {
                        borderColor: "transparent",
                        color: "var(--fur-slate-light)",
                        background: "transparent",
                      }
                }
              >
                {tab === "about" ? (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
                  </svg>
                ) : (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                )}
                {tab === "about" ? "About" : `Services (${profile.services.length})`}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* ── About tab ── */}
            {activeTab === "about" && (
              <div className="space-y-5">

                {/* Bio */}
                {derivedBio ? (
                  <div>
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-2"
                      style={{ color: "var(--fur-slate-mid)" }}
                    >
                      About
                    </p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--fur-slate)" }}
                    >
                      {derivedBio}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm italic" style={{ color: "var(--fur-slate-light)" }}>
                    This provider hasn't added a bio yet.
                  </p>
                )}

                {/* Contact Information */}
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-3"
                    style={{ color: "var(--fur-slate-mid)" }}
                  >
                    Contact Information
                  </p>
                  <div className="space-y-2">

                    {/* Email */}
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl border"
                      style={{ borderColor: "var(--border)", background: "var(--fur-cream)" }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "var(--fur-teal-light)" }}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--fur-teal-dark)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-xs font-bold leading-none mb-0.5"
                          style={{ color: "var(--fur-slate-mid)" }}
                        >
                          Email
                        </p>
                        {derivedEmail ? (
                          <a
                            href={`mailto:${derivedEmail}`}
                            className="text-sm font-bold truncate block hover:underline"
                            style={{ color: "var(--fur-teal)" }}
                          >
                            {derivedEmail}
                          </a>
                        ) : (
                          <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>
                            Not provided
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl border"
                      style={{ borderColor: "var(--border)", background: "var(--fur-cream)" }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "#D1FAE5" }}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#059669"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.02-.93a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </div>
                      <div>
                        <p
                          className="text-xs font-bold leading-none mb-0.5"
                          style={{ color: "var(--fur-slate-mid)" }}
                        >
                          Phone
                        </p>
                        {derivedPhone ? (
                          <a
                            href={`tel:${derivedPhone}`}
                            className="text-sm font-bold hover:underline"
                            style={{ color: "#059669" }}
                          >
                            {derivedPhone}
                          </a>
                        ) : (
                          <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>
                            Not provided
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl border"
                      style={{ borderColor: "var(--border)", background: "var(--fur-cream)" }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "#FEF3C7" }}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#92400E"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-xs font-bold leading-none mb-0.5"
                          style={{ color: "var(--fur-slate-mid)" }}
                        >
                          Address
                        </p>
                        {derivedAddress ? (
                          <p className="text-sm font-bold" style={{ color: "var(--fur-slate)" }}>
                            {derivedAddress}
                          </p>
                        ) : (
                          <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>
                            Not provided
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Social / Contact Link */}
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl border"
                      style={{ borderColor: "var(--border)", background: "var(--fur-cream)" }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "#E0E7FF" }}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#3730A3"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-xs font-bold leading-none mb-0.5"
                          style={{ color: "var(--fur-slate-mid)" }}
                        >
                          Social / Contact Link
                        </p>
                        {derivedContactLink ? (
                          <a
                            href={derivedContactLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold truncate block hover:underline"
                            style={{ color: "#3730A3" }}
                          >
                            {derivedContactLink.replace(/^https?:\/\//, "")}
                          </a>
                        ) : (
                          <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>
                            Not provided
                          </p>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* ── Services tab ── */}
            {activeTab === "services" && (
              <div>
                {profile.services.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-4xl block mb-3">🐾</span>
                    <p className="font-bold" style={{ color: "var(--fur-slate)" }}>
                      No active services yet
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.services.map((svc) => {
                      const colors = categoryColors[svc.category] ?? {
                        bg: "var(--fur-sand)",
                        accent: "var(--fur-brown)",
                      };
                      return (
                        <div
                          key={svc.id}
                          onClick={() => handleServiceClick(svc.id)}
                          className="rounded-2xl overflow-hidden border cursor-pointer"
                          style={{
                            background: "white",
                            borderColor: "var(--border)",
                            transition: "all 200ms ease",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLDivElement).style.boxShadow =
                              "0 4px 20px rgba(0,0,0,0.08)";
                            (e.currentTarget as HTMLDivElement).style.transform =
                              "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                            (e.currentTarget as HTMLDivElement).style.transform = "none";
                          }}
                        >
                          {/* Service image strip */}
                          <div
                            className="h-28 flex items-center justify-center relative"
                            style={{ background: colors.bg }}
                          >
                            <div
                              className="absolute inset-0 opacity-30"
                              style={{
                                backgroundImage:
                                  "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.8) 0%, transparent 60%)",
                              }}
                            />
                            <span className="text-4xl relative z-10">{svc.image}</span>
                            <span
                              className="absolute top-2.5 right-2.5 text-xs font-bold px-2.5 py-1 rounded-full bg-white capitalize"
                              style={{ color: colors.accent }}
                            >
                              {svc.category}
                            </span>
                          </div>

                          {/* Service details */}
                          <div className="p-4">
                            <h3
                              className="font-extrabold text-sm mb-1 truncate"
                              style={{ color: "var(--fur-slate)" }}
                            >
                              {svc.name}
                            </h3>
                            <p
                              className="text-xs mb-3 line-clamp-2"
                              style={{ color: "var(--fur-slate-light)" }}
                            >
                              {svc.description || "No description provided."}
                            </p>

                            <div className="flex items-center justify-between">
                              {svc.rating > 0 ? (
                                <div className="flex items-center gap-1">
                                  <svg
                                    width="11"
                                    height="11"
                                    viewBox="0 0 24 24"
                                    fill="#F59E0B"
                                    stroke="#F59E0B"
                                    strokeWidth="1"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                  </svg>
                                  <span
                                    className="text-xs font-bold"
                                    style={{ color: "var(--fur-slate)" }}
                                  >
                                    {svc.rating}
                                  </span>
                                  <span
                                    className="text-xs"
                                    style={{ color: "var(--fur-slate-light)" }}
                                  >
                                    ({svc.reviews})
                                  </span>
                                </div>
                              ) : (
                                <span
                                  className="text-xs"
                                  style={{ color: "var(--fur-slate-light)" }}
                                >
                                  No reviews yet
                                </span>
                              )}
                              <div>
                                <span
                                  className="text-base font-black"
                                  style={{
                                    fontFamily: "'Fraunces', serif",
                                    color: "var(--fur-slate)",
                                  }}
                                >
                                  ₱{svc.price}
                                </span>
                                <span
                                  className="text-xs ml-1"
                                  style={{ color: "var(--fur-slate-light)" }}
                                >
                                  {svc.priceUnit}
                                </span>
                              </div>
                            </div>

                            <div
                              className="mt-3 pt-3 border-t flex items-center justify-between"
                              style={{ borderColor: "var(--border)" }}
                            >
                              <span
                                className="text-xs flex items-center gap-1"
                                style={{ color: "var(--fur-slate-light)" }}
                              >
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                                {svc.duration} mins
                              </span>
                              <span
                                className="text-xs font-bold px-2.5 py-1 rounded-lg text-white"
                                style={{ background: "var(--fur-teal)" }}
                              >
                                Book →
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}