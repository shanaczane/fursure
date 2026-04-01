"use client";

import React, { useState, useMemo } from "react";
import { useAdminContext } from "../context/AdminContext";
import AdminLayout from "../components/AdminLayout";

type ModerationCategory = "services" | "bookings" | "providers";

// SVG Icons
const WrenchIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);
const CalendarIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const BuildingIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const ClockIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const AlertIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const InboxIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);
const StarIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
const TrophyIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
  </svg>
);

const ContentModerationPage: React.FC = () => {
  const { providers, users, stats, isLoading } = useAdminContext();
  const [activeTab, setActiveTab] = useState<ModerationCategory>("services");

  const inactiveProviders = useMemo(() =>
    providers.filter((p) => p.serviceCount === 0 && p.isVerified), [providers]);
  const noBookingProviders = useMemo(() =>
    providers.filter((p) => p.bookingCount === 0 && p.serviceCount > 0), [providers]);
  const unverifiedProviders = useMemo(() =>
    providers.filter((p) => !p.isVerified), [providers]);
  const powerUsers = useMemo(() =>
    users.filter((u) => (u.bookingCount ?? 0) >= 3).sort((a, b) => (b.bookingCount ?? 0) - (a.bookingCount ?? 0)),
    [users]);

  const moderationItems = {
    services: {
      title: "Service Moderation",
      description: "Review provider services that may need attention",
      sections: [
        {
          title: "Verified Providers with No Services",
          subtitle: "These providers are verified but haven't listed any services yet.",
          items: inactiveProviders,
          icon: <AlertIcon />,
          bg: "#FEF3C7", color: "#92400E",
          empty: "All verified providers have services listed.",
        },
        {
          title: "Providers with No Bookings",
          subtitle: "Providers with services but no bookings — may need promotion support.",
          items: noBookingProviders,
          icon: <InboxIcon />,
          bg: "#EDE9FE", color: "#5B21B6",
          empty: "All providers have received bookings.",
        },
      ],
    },
    bookings: {
      title: "Booking Moderation",
      description: "Review booking metrics and identify anomalies",
      sections: [],
    },
    providers: {
      title: "Provider Status",
      description: "Overview of provider compliance and status",
      sections: [
        {
          title: "Pending Verification",
          subtitle: "These providers have registered but haven't been verified yet.",
          items: unverifiedProviders,
          icon: <ClockIcon />,
          bg: "#FEE2E2", color: "#991B1B",
          empty: "All providers are verified!",
        },
      ],
    },
  };

  const current = moderationItems[activeTab];

  const TABS: { key: ModerationCategory; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "services", label: "Services", icon: <WrenchIcon />, count: inactiveProviders.length },
    { key: "bookings", label: "Bookings", icon: <CalendarIcon /> },
    { key: "providers", label: "Providers", icon: <BuildingIcon />, count: unverifiedProviders.length },
  ];

  const overviewCards = [
    { label: "Unverified Providers", value: stats.pendingVerifications, icon: <ClockIcon size={18} />, bg: "#FEF3C7", color: "#92400E", alert: stats.pendingVerifications > 0 },
    { label: "Providers No Services", value: inactiveProviders.length, icon: <AlertIcon size={18} />, bg: "#FEE2E2", color: "#991B1B", alert: inactiveProviders.length > 0 },
    { label: "Providers No Bookings", value: noBookingProviders.length, icon: <InboxIcon size={18} />, bg: "#EDE9FE", color: "#5B21B6", alert: false },
    { label: "Power Users", value: powerUsers.length, icon: <StarIcon size={18} />, bg: "var(--fur-teal-light)", color: "var(--fur-teal-dark)", alert: false },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-900 mb-1" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
            Content Moderation
          </h1>
          <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>
            Identify and manage content or accounts that need attention.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {overviewCards.map((s) => (
            <div key={s.label} className="rounded-2xl p-5 border relative"
              style={{ background: "white", borderColor: s.alert ? s.color : "var(--border)" }}>
              {s.alert && (
                <span className="absolute top-3 right-3 w-2 h-2 rounded-full animate-pulse" style={{ background: s.color }} />
              )}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <p className="text-2xl font-900 mb-0.5" style={{ fontFamily: "'Fraunces', serif", color: s.color }}>{s.value}</p>
              <p className="text-xs font-600" style={{ color: "var(--fur-slate-light)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Power Users */}
        {powerUsers.length > 0 && (
          <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)" }}>
            <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
              <span style={{ color: "#F59E0B" }}><TrophyIcon /></span>
              <div>
                <h2 className="font-800 text-base" style={{ color: "var(--fur-slate)" }}>Top Active Users</h2>
                <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>Users with 3+ bookings — your most engaged customers.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["User", "Role", "Bookings", "Member Since"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-700 uppercase tracking-wide"
                        style={{ color: "var(--fur-slate-light)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {powerUsers.slice(0, 6).map((user, idx) => (
                    <tr key={user.id}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-cream)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-700"
                            style={{ background: idx === 0 ? "#F59E0B" : idx === 1 ? "#9CA3AF" : idx === 2 ? "#CD7F32" : "var(--fur-teal)" }}>
                            {idx < 3
                              ? <span className="text-xs font-900">{idx + 1}</span>
                              : (user.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-700 text-sm" style={{ color: "var(--fur-slate)" }}>{user.name}</p>
                            <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-700 px-2 py-1 rounded-full capitalize"
                          style={{ background: "var(--fur-teal-light)", color: "var(--fur-teal-dark)" }}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 rounded-full w-24" style={{ background: "var(--fur-mist)" }}>
                            <div className="h-2 rounded-full" style={{
                              width: `${Math.min(100, ((user.bookingCount ?? 0) / (powerUsers[0].bookingCount ?? 1)) * 100)}%`,
                              background: "var(--fur-teal)"
                            }} />
                          </div>
                          <span className="font-700 text-sm" style={{ color: "var(--fur-slate)" }}>{user.bookingCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                          {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Moderation Tabs */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)" }}>
          <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-5 py-4 text-sm font-700 border-b-2 transition-colors"
                style={activeTab === tab.key
                  ? { borderColor: "var(--fur-teal)", color: "var(--fur-teal)", background: "var(--fur-teal-light)" }
                  : { borderColor: "transparent", color: "var(--fur-slate-light)" }}>
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{ background: "#FEE2E2", color: "#991B1B" }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            <p className="text-sm mb-6" style={{ color: "var(--fur-slate-light)" }}>{current.description}</p>

            {activeTab === "bookings" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Total Bookings", value: stats.totalBookings, icon: <CalendarIcon size={22} />, bg: "#DBEAFE", color: "#1E40AF" },
                    { label: "Completed", value: stats.completedBookings, icon: <CheckCircleIcon size={22} />, bg: "#D1FAE5", color: "#065F46" },
                    { label: "Cancelled", value: stats.cancelledBookings, icon: <XCircleIcon size={22} />, bg: "#FEE2E2", color: "#991B1B" },
                  ].map((s) => (
                    <div key={s.label} className="p-5 rounded-xl border flex items-center gap-4"
                      style={{ borderColor: "var(--border)", background: "var(--fur-cream)" }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: s.bg, color: s.color }}>
                        {s.icon}
                      </div>
                      <div>
                        <p className="text-2xl font-900" style={{ fontFamily: "'Fraunces', serif", color: s.color }}>{s.value}</p>
                        <p className="text-xs font-600" style={{ color: "var(--fur-slate-light)" }}>{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-5 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--fur-cream)" }}>
                  <p className="font-700 text-sm mb-3" style={{ color: "var(--fur-slate)" }}>Cancellation Rate</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 rounded-full" style={{ background: "var(--border)" }}>
                      <div className="h-3 rounded-full"
                        style={{
                          width: `${stats.totalBookings > 0 ? (stats.cancelledBookings / stats.totalBookings) * 100 : 0}%`,
                          background: stats.totalBookings > 0 && (stats.cancelledBookings / stats.totalBookings) > 0.3 ? "#EF4444" : "#10B981"
                        }} />
                    </div>
                    <span className="font-800 text-sm" style={{ color: "var(--fur-slate)" }}>
                      {stats.totalBookings > 0 ? Math.round((stats.cancelledBookings / stats.totalBookings) * 100) : 0}%
                    </span>
                  </div>
                  <p className="text-xs mt-2 flex items-center gap-1" style={{ color: "var(--fur-slate-light)" }}>
                    {stats.totalBookings > 0 && (stats.cancelledBookings / stats.totalBookings) > 0.3
                      ? <><AlertIcon size={12} /> High cancellation rate — investigate provider quality.</>
                      : <><CheckCircleIcon size={12} /> Cancellation rate is within acceptable range.</>}
                  </p>
                </div>
              </div>
            ) : (
              current.sections.map((section, idx) => (
                <div key={idx} className={idx > 0 ? "mt-8 pt-8 border-t" : ""} style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: section.bg, color: section.color }}>
                      {section.icon}
                    </div>
                    <div>
                      <h3 className="font-800 text-sm" style={{ color: "var(--fur-slate)" }}>{section.title}</h3>
                      <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>{section.subtitle}</p>
                    </div>
                    <span className="ml-auto text-xs font-700 px-2 py-0.5 rounded-full"
                      style={{ background: section.bg, color: section.color }}>
                      {section.items.length}
                    </span>
                  </div>

                  {section.items.length === 0 ? (
                    <div className="p-8 rounded-xl text-center" style={{ background: "var(--fur-cream)" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                        style={{ background: "#D1FAE5", color: "#059669" }}>
                        <CheckCircleIcon size={18} />
                      </div>
                      <p className="text-sm font-600" style={{ color: "var(--fur-slate-mid)" }}>{section.empty}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {section.items.map((provider) => (
                        <div key={provider.id} className="flex items-center gap-4 p-4 rounded-xl border"
                          style={{ borderColor: "var(--border)", background: "var(--fur-cream)" }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: section.bg, color: section.color }}>
                            <BuildingIcon />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-700 text-sm truncate" style={{ color: "var(--fur-slate)" }}>{provider.businessName}</p>
                            <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                              {provider.email} · {provider.serviceCount} services · {provider.bookingCount} bookings
                            </p>
                          </div>
                          <span className="text-xs font-700 px-2 py-1 rounded-full flex items-center gap-1"
                            style={provider.isVerified
                              ? { background: "#D1FAE5", color: "#065F46" }
                              : { background: "#FEF3C7", color: "#92400E" }}>
                            {provider.isVerified
                              ? <><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Verified</>
                              : <>Pending</>}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ContentModerationPage;
