"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/app/contexts/AppContext";
import { MOCK_PET_SHOPS, getServicesByShopId, type PetShop } from "@/app/data/mockData";
import { type Service } from "@/app/types";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import BookingForm from "../components/BookingForm";
import SuccessModal from "../components/SuccessModal";

const CATEGORY_META: Record<string, { emoji: string; bg: string; color: string }> = {
  grooming:   { emoji: "✂️", bg: "#EFF6FF", color: "#1D4ED8" },
  veterinary: { emoji: "🏥", bg: "#F0FDF4", color: "#15803D" },
  training:   { emoji: "🎓", bg: "#FAF5FF", color: "#7C3AED" },
  boarding:   { emoji: "🏠", bg: "#FFF7ED", color: "#C2410C" },
  walking:    { emoji: "🚶", bg: "#F0FDF4", color: "#166534" },
  daycare:    { emoji: "🎾", bg: "#FFFBEB", color: "#B45309" },
};

interface ShopProfilePageProps {
  shopId: string;
}

const ShopProfilePage: React.FC<ShopProfilePageProps> = ({ shopId }) => {
  const router = useRouter();
  const { user, services, bookings, pets, addBooking } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [serviceToBook, setServiceToBook] = useState<Service | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: "", message: "" });

  const shop: PetShop | undefined = MOCK_PET_SHOPS.find(s => s.id === shopId);
  const shopServices = shop ? getServicesByShopId(shopId, services) : [];

  const upcomingCount = bookings.filter(
    b => (b.status === "pending" || b.status === "confirmed") &&
      new Date(b.date + "T00:00:00") >= new Date(new Date().setHours(0, 0, 0, 0))
  ).length;

  const shopCategories = [...new Set(shopServices.map(s => s.category))];

  const filteredServices = selectedCategory === "all"
    ? shopServices
    : shopServices.filter(s => s.category === selectedCategory);

  const handleBook = (service: Service) => {
    if (pets.length === 0) {
      router.push("/owner/pets");
      return;
    }
    setServiceToBook(service);
    setIsBookingOpen(true);
  };

  const handleConfirmBooking = (
    serviceId: string, petId: string, date: string, time: string, notes: string
  ) => {
    const svc = services.find(s => s.id === serviceId);
    const pet = pets.find(p => p.id === petId);
    if (!svc || !pet) return;
    addBooking({
      serviceId: svc.id,
      serviceName: svc.name,
      providerName: svc.provider,
      date, time, status: "pending",
      petName: pet.name,
      notes: notes || `Booked from ${shop?.name}`,
    });
    setIsBookingOpen(false);
    setServiceToBook(null);
    setSuccessModal({
      isOpen: true,
      title: "Booking Confirmed! 🎉",
      message: `Successfully booked ${svc.name} for ${pet.name} on ${date} at ${time}!`,
    });
  };

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--fur-cream)" }}>
        <div className="text-center">
          <p className="text-5xl mb-4">🏪</p>
          <p className="font-700 text-lg mb-4" style={{ color: "var(--fur-slate)" }}>Shop not found</p>
          <button onClick={() => router.back()} className="btn-secondary px-6 py-2">Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--fur-cream)", fontFamily: "'Nunito', sans-serif" }}>
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        upcomingBookingsCount={upcomingCount}
      />
      <div className={`transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : "lg:ml-0"}`}>
        <TopNavbar
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="p-4 md:p-6 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => router.push("/owner/services")}
                className="font-600 hover:underline"
                style={{ color: "var(--fur-teal)" }}
              >
                Find Pet Care
              </button>
              <span style={{ color: "var(--fur-slate-light)" }}>›</span>
              <span className="font-700" style={{ color: "var(--fur-slate)" }}>{shop.name}</span>
            </div>

            {/* Shop Hero */}
            <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
              {/* Cover */}
              <div className="h-48 relative flex items-end px-8 pb-6"
                style={{ background: `linear-gradient(135deg, ${shop.coverColor}, #EFF6FF)` }}>
                <div className="absolute inset-0" style={{
                  backgroundImage: "radial-gradient(circle at 90% 10%, rgba(255,255,255,0.7) 0%, transparent 50%)"
                }} />
                {shop.isVerified && (
                  <span className="absolute top-5 right-6 text-xs font-700 px-3 py-1.5 rounded-full bg-white"
                    style={{ color: "#1D4ED8" }}>
                    ✓ Verified Shop
                  </span>
                )}
                <div className="relative z-10 flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl bg-white shadow-lg border-4 border-white">
                    {shop.image}
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-900 mb-1"
                      style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
                      {shop.name}
                    </h1>
                    <p className="text-sm font-600" style={{ color: "var(--fur-slate-mid)" }}>
                      📍 {shop.location} · {shop.distance} away
                    </p>
                  </div>
                </div>
              </div>

              {/* Info bar */}
              <div className="p-6 bg-white grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: "⭐", label: "Rating", value: `${shop.rating} / 5`, sub: `${shop.reviews} reviews` },
                  { icon: "🕐", label: "Hours", value: shop.hours.split(",")[0], sub: shop.hours.split(",")[1]?.trim() || "" },
                  { icon: "💬", label: "Response", value: shop.responseTime.replace("Usually responds within ", ""), sub: "typical wait" },
                  { icon: "📞", label: "Phone", value: shop.phone || "—", sub: "call us" },
                ].map(info => (
                  <div key={info.label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: "var(--fur-mist)" }}>
                      {info.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-700 text-sm truncate" style={{ color: "var(--fur-slate)" }}>{info.value}</p>
                      <p className="text-xs truncate" style={{ color: "var(--fur-slate-light)" }}>{info.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="rounded-2xl p-6 border bg-white" style={{ borderColor: "var(--border)" }}>
              <h2 className="font-800 text-base mb-3" style={{ color: "var(--fur-slate)" }}>
                About {shop.name}
              </h2>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--fur-slate-mid)" }}>
                {shop.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {shop.categories.map(cat => {
                  const meta = CATEGORY_META[cat] || { bg: "#EFF6FF", color: "#1D4ED8", emoji: "🐾" };
                  return (
                    <span key={cat}
                      className="text-xs font-700 px-3 py-1.5 rounded-full capitalize"
                      style={{ background: meta.bg, color: meta.color }}>
                      {meta.emoji} {cat}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Services */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-xl font-900"
                    style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
                    Our Services
                  </h2>
                  <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>
                    {filteredServices.length} service{filteredServices.length !== 1 ? "s" : ""} available
                  </p>
                </div>

                {/* Category filter tabs */}
                {shopCategories.length > 1 && (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className="px-3 py-1.5 rounded-full text-xs font-700 border-2 transition-all"
                      style={selectedCategory === "all"
                        ? { background: "var(--fur-teal)", color: "white", borderColor: "var(--fur-teal)" }
                        : { background: "white", color: "var(--fur-slate-mid)", borderColor: "var(--border)" }}
                    >
                      All
                    </button>
                    {shopCategories.map(cat => {
                      const meta = CATEGORY_META[cat] || { emoji: "🐾" };
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-700 border-2 transition-all capitalize"
                          style={selectedCategory === cat
                            ? { background: "var(--fur-teal)", color: "white", borderColor: "var(--fur-teal)" }
                            : { background: "white", color: "var(--fur-slate-mid)", borderColor: "var(--border)" }}
                        >
                          {meta.emoji} {cat}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredServices.map(service => {
                  const meta = CATEGORY_META[service.category] || { bg: "#EFF6FF", color: "#1D4ED8", emoji: "🐾" };
                  return (
                    <div key={service.id}
                      className="rounded-2xl overflow-hidden border"
                      style={{ background: "white", borderColor: "var(--border)" }}>
                      {/* Image */}
                      <div className="h-32 flex items-center justify-center relative"
                        style={{ background: meta.bg }}>
                        <div className="absolute inset-0 opacity-30" style={{
                          backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.9) 0%, transparent 60%)"
                        }} />
                        <span className="text-5xl relative z-10">{service.image}</span>
                        <span className="absolute top-3 right-3 text-xs font-700 px-2.5 py-1 rounded-full bg-white capitalize"
                          style={{ color: meta.color }}>
                          {meta.emoji} {service.category}
                        </span>
                      </div>

                      <div className="p-5">
                        <h3 className="font-800 text-base mb-2" style={{ color: "var(--fur-slate)" }}>
                          {service.name}
                        </h3>
                        <p className="text-xs mb-3 line-clamp-2 leading-relaxed"
                          style={{ color: "var(--fur-slate-mid)" }}>
                          {service.description}
                        </p>

                        {/* Rating & distance */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1">
                            <span>⭐</span>
                            <span className="font-700 text-sm" style={{ color: "var(--fur-slate)" }}>
                              {service.rating}
                            </span>
                            <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                              ({service.reviews})
                            </span>
                          </div>
                          <span className="text-xs font-600" style={{ color: "var(--fur-slate-light)" }}>
                            📍 {service.distance}
                          </span>
                        </div>

                        {/* Features preview */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {service.features.slice(0, 3).map((f, i) => (
                            <span key={i}
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: "var(--fur-mist)", color: "var(--fur-slate-mid)" }}>
                              {f}
                            </span>
                          ))}
                          {service.features.length > 3 && (
                            <span className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: "var(--fur-mist)", color: "var(--fur-slate-mid)" }}>
                              +{service.features.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* Price + Book */}
                        <div className="flex items-center justify-between pt-4 border-t"
                          style={{ borderColor: "var(--border)" }}>
                          <div>
                            <span className="text-xl font-900"
                              style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
                              ₱{service.price}
                            </span>
                            <span className="text-xs ml-1" style={{ color: "var(--fur-slate-light)" }}>
                              {service.priceUnit}
                            </span>
                          </div>
                          <button
                            onClick={() => handleBook(service)}
                            className="btn-primary px-5 py-2 text-sm"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </main>
      </div>

      <BookingForm
        service={serviceToBook}
        pets={pets}
        isOpen={isBookingOpen}
        onClose={() => { setIsBookingOpen(false); setServiceToBook(null); }}
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

export default ShopProfilePage;