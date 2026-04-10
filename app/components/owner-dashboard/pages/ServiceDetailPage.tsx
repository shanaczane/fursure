"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/app/contexts/AppContext";
import { type Service } from "@/app/types";
import { fetchProviderPolicy, fetchProviderContactInfo } from "@/app/lib/api";
import type { ProviderPolicy } from "@/app/components/provider-dashboard/types";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import BookingForm from "../components/BookingForm";
import SuccessModal from "../components/SuccessModal";

interface ServiceDetailPageProps {
  serviceId: string;
}

const StarIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);

const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({ serviceId }) => {
  const router = useRouter();
  const { user, services, pets, bookings, addBooking } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [service, setService] = useState<Service | null>(null);
  const [policy, setPolicy] = useState<ProviderPolicy | null>(null);
  const [providerContact, setProviderContact] = useState<{
    providerPhone?: string;
    providerEmail?: string;
    providerContactLink?: string;
  }>({});
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: "", message: "" });
  const [activeTab, setActiveTab] = useState<"about" | "features" | "availability">("about");

  useEffect(() => {
    const found = services.find(s => s.id === serviceId);
    setService(found || null);
    setPolicy(null);
    setProviderContact({});
    if (found?.providerUserId) {
      fetchProviderPolicy(found.providerUserId).then(p => setPolicy(p)).catch(() => {});
      fetchProviderContactInfo(found.providerUserId).then(c => setProviderContact(c)).catch(() => {});
    }
  }, [serviceId, services]);

  const handleBook = () => {
    if (pets.length === 0) {
      setSuccessModal({
        isOpen: true,
        title: "No Pets Added Yet",
        message: "You need to add a pet first before booking a service. Redirecting you to My Pets...",
      });
      setTimeout(() => router.push("/owner/pets"), 2500);
      return;
    }
    setIsBookingOpen(true);
  };

  const handleConfirmBooking = async (serviceId: string, petId: string, date: string, time: string, notes: string) => {
    const svc = services.find(s => s.id === serviceId);
    const pet = pets.find(p => p.id === petId);
    if (!svc || !pet) return;
    try {
      await addBooking({
        serviceId: svc.id,
        serviceName: svc.name,
        providerName: svc.provider,
        providerUserId: svc.providerUserId,
        date,
        time,
        status: "pending",
        petId: pet.id,
        petName: pet.name,
        notes: notes || "Booked via service details",
        requiresDownPayment: false,
        downPaymentDeadlineHours: 0,
        downPaymentPaid: false,
        editCancelGracePeriodHours: 0,
        editRequestStatus: "none",
        cancelRequestStatus: "none",
        ...providerContact,
      });
      setIsBookingOpen(false);
      setSuccessModal({
        isOpen: true,
        title: "Booking Confirmed!",
        message: `Successfully booked ${svc.name} for ${pet.name} on ${date} at ${time}!`,
      });
      setTimeout(() => router.push("/owner/bookings"), 2500);
    } catch (err) {
      console.error("Booking failed:", err);
      setIsBookingOpen(false);
      setSuccessModal({
        isOpen: true,
        title: "Booking Failed",
        message: "Something went wrong while creating your booking. Please try again.",
      });
    }
  };

  const upcomingCount = bookings.filter(
    b => (b.status === "pending" || b.status === "confirmed") &&
      new Date(b.date + "T00:00:00") >= new Date(new Date().setHours(0, 0, 0, 0))
  ).length;

  const categoryColors: Record<string, { bg: string; accent: string }> = {
    grooming:   { bg: "var(--fur-amber-light)",  accent: "var(--fur-amber-dark)" },
    veterinary: { bg: "var(--fur-teal-light)",   accent: "var(--fur-teal-dark)" },
    training:   { bg: "#EDE9FE",                 accent: "#5B21B6" },
    boarding:   { bg: "#E0E7FF",                 accent: "#3730A3" },
    walking:    { bg: "#D1FAE5",                 accent: "#065F46" },
    daycare:    { bg: "#FEF3C7",                 accent: "#92400E" },
  };

  if (!service) {
    return (
      <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--fur-cream)", fontFamily: "'Nunito', sans-serif" }}>
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} upcomingBookingsCount={upcomingCount} />
        <div style={{ marginLeft: isSidebarOpen ? "16rem" : "0", transition: "margin-left 300ms ease-in-out" }}>
          <TopNavbar user={user} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
          <main className="p-4 md:p-6 mt-16 flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "var(--fur-mist)", color: "var(--fur-slate-light)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <p className="font-bold text-lg mb-4" style={{ color: "var(--fur-slate)" }}>Service not found</p>
              <button onClick={() => router.back()} className="btn-secondary">Go back</button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const colors = categoryColors[service.category] || { bg: "var(--fur-sand)", accent: "var(--fur-brown)" };

  const handleProviderClick = () => {
    if (service.providerUserId) {
      router.push(`/owner/providers/${service.providerUserId}`);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--fur-cream)", fontFamily: "'Nunito', sans-serif" }}>
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} upcomingBookingsCount={upcomingCount} />
      <div style={{ marginLeft: isSidebarOpen ? "16rem" : "0", transition: "margin-left 300ms ease-in-out" }}>
        <TopNavbar user={user} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
        <main className="p-4 md:p-6 mt-16">
          <div className="max-w-5xl mx-auto">

            {/* Hero banner */}
            <div className="rounded-2xl overflow-hidden mb-6 relative" style={{ background: colors.bg, minHeight: 180 }}>
              <div className="absolute inset-0" style={{
                backgroundImage: "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.5) 0%, transparent 60%)"
              }} />
              <div className="relative p-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl shadow-sm bg-white shrink-0">
                    {service.image}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white inline-block mb-2"
                      style={{ color: colors.accent }}>
                      {service.category}
                    </span>
                    <h1 className="text-2xl md:text-3xl font-black mb-1" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
                      {service.name}
                    </h1>

                    {/* Clickable provider name */}
                    <button
                      onClick={handleProviderClick}
                      className="flex items-center gap-1.5 group"
                      style={{ color: "var(--fur-slate-mid)" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      <span
                        className="text-sm font-bold transition-all group-hover:underline"
                        style={{ color: "var(--fur-teal)" }}
                      >
                        {service.provider}
                      </span>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: "var(--fur-teal)" }}>
                        <path d="M7 17L17 7M7 7h10v10"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-all shrink-0"
                  style={{ color: "var(--fur-slate-mid)" }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      icon: <StarIcon filled />,
                      label: "Rating",
                      value: `${service.rating}/5`,
                      sub: `${service.reviews} reviews`,
                    },
                    {
                      icon: <PinIcon />,
                      label: "Location",
                      value: service.location || "—",
                      sub: service.provider,
                    },
                    {
                      icon: <ClockIcon />,
                      label: "Duration",
                      value: `${Math.floor(service.duration / 60)}h${service.duration % 60 > 0 ? ` ${service.duration % 60}m` : ""}`.trim(),
                      sub: `${service.duration} mins`,
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl p-4 text-center border"
                      style={{ background: "white", borderColor: "var(--border)" }}>
                      <div className="flex justify-center mb-2" style={{ color: "var(--fur-teal)" }}>{stat.icon}</div>
                      <p className="font-black text-base mb-0.5" style={{ color: "var(--fur-slate)" }}>{stat.value}</p>
                      <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>{stat.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Tabs */}
                <div className="rounded-2xl overflow-hidden border" style={{ background: "white", borderColor: "var(--border)" }}>
                  <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
                    {(["about", "features", "availability"] as const).map((tab) => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        className="flex-1 py-3.5 text-sm font-bold capitalize border-b-2 transition-colors"
                        style={activeTab === tab
                          ? { borderColor: "var(--fur-teal)", color: "var(--fur-teal)", background: "var(--fur-teal-light)" }
                          : { borderColor: "transparent", color: "var(--fur-slate-light)" }}>
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="p-6">
                    {activeTab === "about" && (
                      <div className="space-y-4">
                        <p className="text-sm leading-relaxed" style={{ color: "var(--fur-slate-mid)" }}>{service.description}</p>

                        {/* Provider card inside About tab */}
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--fur-slate-mid)" }}>
                            About the Provider
                          </p>
                          <button
                            onClick={handleProviderClick}
                            className="w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all hover:shadow-sm group"
                            style={{ borderColor: "var(--border)", background: "var(--fur-cream)" }}
                          >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
                              style={{ background: "linear-gradient(135deg, #3B4F6B, #1A2332)", fontFamily: "'Fraunces', serif" }}>
                              {service.provider.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate group-hover:underline" style={{ color: "var(--fur-teal)" }}>
                                {service.provider}
                              </p>
                              <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>View full profile →</p>
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                              strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--fur-slate-light)" }}>
                              <path d="M9 18l6-6-6-6"/>
                            </svg>
                          </button>

                          {/* Social / Contact Link */}
                          {providerContact.providerContactLink && (
                            <a
                              href={providerContact.providerContactLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 flex items-center gap-3 p-3.5 rounded-xl border transition-all hover:shadow-sm"
                              style={{ borderColor: "var(--border)", background: "var(--fur-cream)", textDecoration: "none" }}
                            >
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: "#E0E7FF" }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3730A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold mb-0.5" style={{ color: "var(--fur-slate-mid)" }}>Social / Contact Link</p>
                                <p className="text-sm font-bold truncate hover:underline" style={{ color: "#3730A3" }}>
                                  {providerContact.providerContactLink.replace(/^https?:\/\//, "")}
                                </p>
                              </div>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3730A3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M7 17L17 7M7 7h10v10"/>
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === "features" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {service.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--fur-cream)" }}>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                              style={{ background: "var(--fur-teal-light)" }}>
                              <svg className="w-3.5 h-3.5" style={{ color: "var(--fur-teal)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-sm font-semibold" style={{ color: "var(--fur-slate)" }}>{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === "availability" && (
                      <div className="space-y-3">
                        {service.availability.map((slot, i) => (
                          <div key={i} className="flex items-center gap-3 p-4 rounded-xl border"
                            style={{ borderColor: "var(--border)", background: "var(--fur-cream)" }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ background: "var(--fur-teal-light)", color: "var(--fur-teal)" }}>
                              <ClockIcon />
                            </div>
                            <span className="text-sm font-semibold" style={{ color: "var(--fur-slate)" }}>{slot}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking sidebar */}
              <div className="space-y-4">
                <div className="rounded-2xl p-6 border sticky top-24" style={{ background: "white", borderColor: "var(--border)" }}>
                  <div className="text-center mb-6 pb-6 border-b" style={{ borderColor: "var(--border)" }}>
                    <p className="text-4xl font-black mb-1" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
                      ₱{service.price}
                    </p>
                    <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>{service.priceUnit}</p>
                  </div>

                  <button onClick={handleBook} className="btn-primary w-full py-3.5 text-sm mb-3 flex items-center justify-center gap-2">
                    <CalendarIcon />
                    Book This Service
                  </button>

                  <button onClick={() => router.back()} className="btn-secondary w-full py-3 text-sm">
                    ← Back to Services
                  </button>

                  <div className="mt-4 p-4 rounded-xl" style={{ background: "var(--fur-teal-light)" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <ClockIcon />
                      <p className="text-xs font-bold" style={{ color: "var(--fur-teal-dark)" }}>{service.responseTime}</p>
                    </div>
                    <p className="text-xs" style={{ color: "var(--fur-teal)" }}>Instant confirmation once accepted</p>
                  </div>
                </div>
              </div>
            </div>

            <BookingForm
              service={service}
              pets={pets}
              policy={policy}
              isOpen={isBookingOpen}
              onClose={() => setIsBookingOpen(false)}
              onBook={handleConfirmBooking}
            />
            <SuccessModal
              isOpen={successModal.isOpen}
              title={successModal.title}
              message={successModal.message}
              onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ServiceDetailPage;