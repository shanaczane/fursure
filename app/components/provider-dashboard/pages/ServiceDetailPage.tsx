"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/app/contexts/AppContext";
import { type Service } from "@/app/types";
import BookingForm from "@/app/components/owner-dashboard/components/BookingForm";
import SuccessModal from "@/app/components/owner-dashboard/components/SuccessModal";

interface ServiceDetailPageProps {
  serviceId: string;
}

const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({ serviceId }) => {
  const router = useRouter();
  const { services, pets, addBooking } = useAppContext();
  const [service, setService] = useState<Service | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: "", message: "" });
  const [activeTab, setActiveTab] = useState<"about" | "features" | "availability">("about");

  useEffect(() => {
    const found = services.find(s => s.id === serviceId);
    setService(found || null);
  }, [serviceId, services]);

  const handleBook = () => {
    if (pets.length === 0) {
      router.push("/owner/pets");
      return;
    }
    setIsBookingOpen(true);
  };

  const handleConfirmBooking = (serviceId: string, petId: string, date: string, time: string, notes: string) => {
    const svc = services.find(s => s.id === serviceId);
    const pet = pets.find(p => p.id === petId);
    if (!svc || !pet) return;
    addBooking({
      serviceId: svc.id,
      serviceName: svc.name,
      providerName: svc.provider,
      date,
      time,
      status: "pending",
      petName: pet.name,
      notes: notes || "Booked via service details",
      requiresDownPayment: false,
      downPaymentDeadlineHours: 24,
      downPaymentPaid: false,
      editCancelGracePeriodHours: 24,
      editRequestStatus: "none",
      cancelRequestStatus: "none",
    });
    setIsBookingOpen(false);
    setSuccessModal({
      isOpen: true,
      title: "Booking Confirmed! 🎉",
      message: `Successfully booked ${svc.name} for ${pet.name} on ${date} at ${time}!`,
    });
    setTimeout(() => router.push("/owner/bookings"), 2500);
  };

  if (!service) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-700 text-lg" style={{ color: "var(--fur-slate)" }}>Service not found</p>
          <button onClick={() => router.back()} className="btn-secondary mt-4">Go back</button>
        </div>
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    grooming: "var(--fur-amber-light)",
    veterinary: "var(--fur-teal-light)",
    training: "#EDE9FE",
    boarding: "#E0E7FF",
    walking: "#D1FAE5",
    daycare: "#FEF3C7",
  };
  const bgColor = categoryColors[service.category] || "var(--fur-sand)";

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Hero banner */}
      <div className="rounded-2xl overflow-hidden mb-6 relative" style={{ background: bgColor, minHeight: 200 }}>
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.5) 0%, transparent 60%)"
        }} />
        <div className="relative p-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl shadow-lg bg-white">
              {service.image}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-700 uppercase tracking-widest px-3 py-1 rounded-full bg-white"
                  style={{ color: "var(--fur-slate-mid)" }}>
                  {service.category}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-900 mb-1" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
                {service.name}
              </h1>
              <p className="font-600" style={{ color: "var(--fur-slate-mid)" }}>🏢 {service.provider}</p>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
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
              { icon: "⭐", label: "Rating", value: `${service.rating}/5`, sub: `${service.reviews} reviews` },
              { icon: "📍", label: "Distance", value: service.distance, sub: service.location },
              { icon: "⏱️", label: "Response", value: "~2 hrs", sub: service.responseTime.replace("Usually responds within ", "") },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-4 text-center border" style={{ background: "white", borderColor: "var(--border)" }}>
                <span className="text-2xl block mb-2">{stat.icon}</span>
                <p className="font-900 text-base mb-0.5" style={{ color: "var(--fur-slate)" }}>{stat.value}</p>
                <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="rounded-2xl overflow-hidden border" style={{ background: "white", borderColor: "var(--border)" }}>
            <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
              {(["about", "features", "availability"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-3.5 text-sm font-700 capitalize border-b-2 transition-colors"
                  style={activeTab === tab
                    ? { borderColor: "var(--fur-teal)", color: "var(--fur-teal)", background: "var(--fur-teal-light)" }
                    : { borderColor: "transparent", color: "var(--fur-slate-light)" }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "about" && (
                <div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--fur-slate-mid)" }}>{service.description}</p>
                </div>
              )}

              {activeTab === "features" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--fur-cream)" }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "var(--fur-teal-light)" }}>
                        <svg className="w-3.5 h-3.5" style={{ color: "var(--fur-teal)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm font-600" style={{ color: "var(--fur-slate)" }}>{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "availability" && (
                <div className="space-y-3">
                  {service.availability.map((slot, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--fur-cream)" }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--fur-teal-light)" }}>
                        🕐
                      </div>
                      <span className="text-sm font-600" style={{ color: "var(--fur-slate)" }}>{slot}</span>
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
              <p className="text-4xl font-900 mb-1" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
                ₱{service.price}
              </p>
              <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>{service.priceUnit}</p>
            </div>

            <button
              onClick={handleBook}
              className="btn-primary w-full py-4 text-base mb-3"
            >
              📅 Book This Service
            </button>

            <button
              onClick={() => router.back()}
              className="btn-secondary w-full py-3 text-sm"
            >
              ← Back to Services
            </button>

            <div className="mt-4 p-4 rounded-xl" style={{ background: "var(--fur-teal-light)" }}>
              <p className="text-xs font-700 mb-1" style={{ color: "var(--fur-teal-dark)" }}>💬 {service.responseTime}</p>
              <p className="text-xs" style={{ color: "var(--fur-teal)" }}>Instant confirmation once accepted</p>
            </div>
          </div>
        </div>
      </div>

      <BookingForm
        service={service}
        pets={pets}
        policy={null}
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
  );
};

export default ServiceDetailPage;