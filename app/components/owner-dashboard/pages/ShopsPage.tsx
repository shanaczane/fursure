"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/app/contexts/AppContext";
import { MOCK_PET_SHOPS, type PetShop } from "@/app/data/mockData";
import { SERVICE_CATEGORIES } from "@/app/types";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

const CATEGORY_META: Record<string, { emoji: string; bg: string; color: string }> = {
  grooming:   { emoji: "✂️", bg: "#EFF6FF", color: "#1D4ED8" },
  veterinary: { emoji: "🏥", bg: "#F0FDF4", color: "#15803D" },
  training:   { emoji: "🎓", bg: "#FAF5FF", color: "#7C3AED" },
  boarding:   { emoji: "🏠", bg: "#FFF7ED", color: "#C2410C" },
  walking:    { emoji: "🚶", bg: "#F0FDF4", color: "#166534" },
  daycare:    { emoji: "🎾", bg: "#FFFBEB", color: "#B45309" },
};

const ShopsPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"rating" | "distance" | "reviews">("rating");
  const router = useRouter();
  const { user, services, bookings } = useAppContext();

  const upcomingCount = bookings.filter(
    b => (b.status === "pending" || b.status === "confirmed") &&
      new Date(b.date + "T00:00:00") >= new Date(new Date().setHours(0, 0, 0, 0))
  ).length;

  const filteredShops = useMemo(() => {
    let shops = [...MOCK_PET_SHOPS];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      shops = shops.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.categories.some(c => c.includes(q))
      );
    }
    if (selectedCategory !== "all") {
      shops = shops.filter(s => s.categories.includes(selectedCategory));
    }
    shops.sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "reviews") return b.reviews - a.reviews;
      return parseFloat(a.distance) - parseFloat(b.distance);
    });
    return shops;
  }, [searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen" style={{ background: "var(--fur-cream)", fontFamily: "'Nunito', sans-serif" }}>
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        upcomingBookingsCount={upcomingCount}
      />
      <div style={{ marginLeft: isSidebarOpen ? "16rem" : "0", transition: "margin-left 300ms ease-in-out" }}>
        <TopNavbar
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="p-4 md:p-6 mt-16">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div>
              <h1 className="text-2xl md:text-3xl font-900 mb-1"
                style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
                Find Pet Care
              </h1>
              <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>
                Browse trusted pet shops near you
              </p>
            </div>

            {/* Search & Filters */}
            <div className="rounded-2xl p-5 border" style={{ background: "white", borderColor: "var(--border)" }}>
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search pet shops, locations..."
                    className="fur-input pl-10"
                  />
                  <svg className="w-4 h-4 absolute left-3 top-3.5"
                    style={{ color: "var(--fur-slate-light)" }}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-3 text-xs font-700"
                      style={{ color: "var(--fur-slate-light)" }}>
                      ✕
                    </button>
                  )}
                </div>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  className="fur-input md:w-44"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="distance">Nearest First</option>
                  <option value="reviews">Most Reviewed</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="px-4 py-1.5 rounded-full text-sm font-700 border-2 transition-all"
                  style={selectedCategory === "all"
                    ? { background: "var(--fur-teal)", color: "white", borderColor: "var(--fur-teal)" }
                    : { background: "white", color: "var(--fur-slate-mid)", borderColor: "var(--border)" }}
                >
                  🐾 All
                </button>
                {SERVICE_CATEGORIES.filter(c => c.value !== "all").map(cat => {
                  const meta = CATEGORY_META[cat.value];
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-700 border-2 transition-all"
                      style={selectedCategory === cat.value
                        ? { background: "var(--fur-teal)", color: "white", borderColor: "var(--fur-teal)" }
                        : { background: "white", color: "var(--fur-slate-mid)", borderColor: "var(--border)" }}
                    >
                      {meta?.emoji} {cat.label}
                    </button>
                  );
                })}
                {(selectedCategory !== "all" || searchQuery) && (
                  <button
                    onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
                    className="px-4 py-1.5 rounded-full text-sm font-700 border-2 transition-all"
                    style={{ background: "var(--fur-rose-light)", color: "var(--fur-rose)", borderColor: "#FCA5A5" }}
                  >
                    ✕ Reset
                  </button>
                )}
              </div>
            </div>

            {/* Results */}
            <p className="text-sm font-600" style={{ color: "var(--fur-slate-mid)" }}>
              {filteredShops.length} pet shop{filteredShops.length !== 1 ? "s" : ""} found
            </p>

            {filteredShops.length === 0 ? (
              <div className="rounded-2xl p-16 text-center border"
                style={{ background: "white", borderColor: "var(--border)" }}>
                <p className="text-5xl mb-4">🔍</p>
                <p className="font-700 text-lg mb-2" style={{ color: "var(--fur-slate)" }}>No pet shops found</p>
                <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>Try a different search or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredShops.map(shop => (
                  <ShopCard
                    key={shop.id}
                    shop={shop}
                    allServices={services}
                    onClick={() => router.push(`/owner/shops/${shop.id}`)}
                  />
                ))}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

const ShopCard: React.FC<{
  shop: PetShop;
  allServices: ReturnType<typeof useAppContext>["services"];
  onClick: () => void;
}> = ({ shop, allServices, onClick }) => {
  const shopServices = allServices.filter(s => shop.serviceIds.includes(s.id));

  return (
    <div
      onClick={onClick}
      className="rounded-2xl overflow-hidden border cursor-pointer card-hover"
      style={{ background: "white", borderColor: "var(--border)" }}
    >
      <div className="h-36 flex items-center justify-between px-6 relative"
        style={{ background: shop.coverColor }}>
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: "radial-gradient(circle at 85% 15%, rgba(255,255,255,0.9) 0%, transparent 55%)"
        }} />
        <span className="relative z-10 text-5xl">{shop.image}</span>
        <div className="relative z-10 text-right">
          {shop.isVerified && (
            <span className="text-xs font-700 px-2.5 py-1 rounded-full bg-white block mb-1.5"
              style={{ color: "#1D4ED8" }}>
              ✓ Verified
            </span>
          )}
          <div className="flex items-center justify-end gap-1">
            <span>⭐</span>
            <span className="font-800 text-base"
              style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
              {shop.rating}
            </span>
            <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>({shop.reviews})</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-800 text-base mb-0.5 truncate" style={{ color: "var(--fur-slate)" }}>
          {shop.name}
        </h3>
        <p className="text-xs mb-3" style={{ color: "var(--fur-slate-light)" }}>
          📍 {shop.location} · {shop.distance}
        </p>
        <p className="text-xs mb-4 line-clamp-2 leading-relaxed" style={{ color: "var(--fur-slate-mid)" }}>
          {shop.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {shop.categories.map(cat => {
            const meta = CATEGORY_META[cat] || { bg: "#EFF6FF", color: "#1D4ED8", emoji: "🐾" };
            return (
              <span key={cat}
                className="text-xs font-700 px-2.5 py-1 rounded-full capitalize"
                style={{ background: meta.bg, color: meta.color }}>
                {meta.emoji} {cat}
              </span>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t"
          style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-1.5">
            {shopServices.slice(0, 4).map(svc => (
              <span key={svc.id} className="text-base" title={svc.name}>{svc.image}</span>
            ))}
            {shopServices.length > 4 && (
              <span className="text-xs font-700 px-2 py-0.5 rounded-full"
                style={{ background: "var(--fur-mist)", color: "var(--fur-slate-mid)" }}>
                +{shopServices.length - 4}
              </span>
            )}
          </div>
          <span className="text-xs font-700" style={{ color: "var(--fur-teal)" }}>
            {shopServices.length} service{shopServices.length !== 1 ? "s" : ""} →
          </span>
        </div>
      </div>
    </div>
  );
};

export default ShopsPage;