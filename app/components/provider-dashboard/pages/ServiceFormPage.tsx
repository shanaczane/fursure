"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProviderContext } from "../context/ProviderAppContext";
import type { ProviderService, ProviderServiceCategory } from "../types";
import { PROVIDER_SERVICE_CATEGORIES } from "../types";
import ProviderLayout from "../components/ProviderLayout";

interface ServiceFormPageProps {
  serviceId?: string; // if editing
}

const PRICE_UNITS = ["per session", "per hour", "per day", "per week", "per visit"];
const EMOJI_OPTIONS = ["🐕", "🐈", "😺", "🐶", "🐾", "✂️", "🏥", "🎓", "🏠", "🚶", "🎾", "🦴", "🛁", "🚐", "📸"];

const DEFAULT_FORM = {
  name: "",
  category: "grooming" as ProviderServiceCategory,
  description: "",
  price: 0,
  priceUnit: "per session",
  duration: 60,
  image: "🐾",
  location: "",
  features: [""],
  availability: ["Mon-Sat: 9AM-6PM"],
  isActive: true,
};

const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; bg: string; color: string }> = {
  grooming: { label: "Grooming", emoji: "✂️", bg: "var(--fur-amber-light)", color: "var(--fur-amber-dark)" },
  veterinary: { label: "Veterinary", emoji: "🏥", bg: "var(--fur-teal-light)", color: "var(--fur-teal-dark)" },
  training: { label: "Training", emoji: "🎓", bg: "#EDE9FE", color: "#5B21B6" },
  boarding: { label: "Boarding", emoji: "🏠", bg: "#E0E7FF", color: "#3730A3" },
  walking: { label: "Walking", emoji: "🚶", bg: "#D1FAE5", color: "#065F46" },
  daycare: { label: "Daycare", emoji: "🎾", bg: "#FEF3C7", color: "#92400E" },
};

const ServiceFormPage: React.FC<ServiceFormPageProps> = ({ serviceId }) => {
  const router = useRouter();
  const { services, addService, updateService } = useProviderContext();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const isEditing = !!serviceId;

  useEffect(() => {
    if (serviceId) {
      const existing = services.find(s => s.id === serviceId);
      if (existing) {
        setForm({
          name: existing.name,
          category: existing.category,
          description: existing.description,
          price: existing.price,
          priceUnit: existing.priceUnit,
          duration: existing.duration,
          image: existing.image,
          location: existing.location ?? "",
          features: existing.features.length > 0 ? existing.features : [""],
          availability: existing.availability.length > 0 ? existing.availability : ["Mon-Sat: 9AM-6PM"],
          isActive: existing.isActive,
        });
      }
    }
  }, [serviceId, services]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Service name is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (form.price <= 0) errs.price = "Price must be greater than 0";
    if (form.duration <= 0) errs.duration = "Duration must be greater than 0";
    const validFeatures = form.features.filter(f => f.trim());
    if (validFeatures.length === 0) errs.features = "At least one feature is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const data = { ...form, features: form.features.filter(f => f.trim()), availability: form.availability.filter(a => a.trim()) };
    if (isEditing && serviceId) {
      updateService(serviceId, data);
    } else {
      addService(data);
    }
    setSaved(true);
    setTimeout(() => router.push("/provider/services"), 1500);
  };

  const updateFeature = (idx: number, val: string) => {
    const updated = [...form.features];
    updated[idx] = val;
    setForm({ ...form, features: updated });
  };

  const updateAvailability = (idx: number, val: string) => {
    const updated = [...form.availability];
    updated[idx] = val;
    setForm({ ...form, availability: updated });
  };

  const currentCategory = CATEGORY_CONFIG[form.category] || CATEGORY_CONFIG.grooming;

  if (saved) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
              style={{ background: "var(--fur-teal-light)" }}>✓</div>
            <h2 className="text-xl font-800 mb-2" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
              {isEditing ? "Service Updated!" : "Service Created!"}
            </h2>
            <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>Redirecting to your services...</p>
          </div>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="max-w-4xl mx-auto" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-xl border transition-all hover:shadow-sm"
                style={{ borderColor: "var(--border)", background: "white", color: "var(--fur-slate-mid)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-600" style={{ color: "var(--fur-slate-light)" }}>My Services</span>
              <span style={{ color: "var(--fur-slate-light)" }}>›</span>
              <span className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>
                {isEditing ? "Edit Service" : "New Service"}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-900" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
              {isEditing ? "Edit Your Service" : "Add New Service"}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--fur-slate-light)" }}>
              {isEditing ? "Update your service details below" : "Fill in the details to list a new service"}
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 p-3 rounded-xl border"
            style={{ background: "white", borderColor: "var(--border)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: currentCategory.bg }}>
              {form.image}
            </div>
            <div>
              <p className="text-xs font-700" style={{ color: "var(--fur-slate)" }}>{form.name || "Service Name"}</p>
              <p className="text-xs" style={{ color: currentCategory.color }}>
                {currentCategory.emoji} {currentCategory.label}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="rounded-2xl p-6 border" style={{ background: "white", borderColor: "var(--border)" }}>
              <h2 className="font-800 text-base mb-5" style={{ color: "var(--fur-slate)" }}>📋 Basic Information</h2>

              {/* Icon picker */}
              <div className="mb-5">
                <label className="block text-sm font-700 mb-3" style={{ color: "var(--fur-slate)" }}>Service Icon</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setForm({ ...form, image: emoji })}
                      className="w-10 h-10 text-xl rounded-xl border-2 transition-all"
                      style={form.image === emoji
                        ? { borderColor: "var(--fur-teal)", background: "var(--fur-teal-light)" }
                        : { borderColor: "var(--border)", background: "var(--fur-cream)" }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-700 mb-2" style={{ color: "var(--fur-slate)" }}>Service Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Premium Dog Grooming"
                    className="fur-input"
                    style={errors.name ? { borderColor: "var(--fur-rose)" } : {}}
                  />
                  {errors.name && <p className="text-xs mt-1" style={{ color: "var(--fur-rose)" }}>{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-700 mb-2" style={{ color: "var(--fur-slate)" }}>Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    placeholder="Describe your service in detail..."
                    className="fur-input resize-none"
                    style={errors.description ? { borderColor: "var(--fur-rose)" } : {}}
                  />
                  {errors.description && <p className="text-xs mt-1" style={{ color: "var(--fur-rose)" }}>{errors.description}</p>}
                  <p className="text-xs mt-1" style={{ color: "var(--fur-slate-light)" }}>{form.description.length} / 500 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-700 mb-2" style={{ color: "var(--fur-slate)" }}>Location / Area</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Makati City, BGC, Quezon City"
                    className="fur-input"
                  />
                  <p className="text-xs mt-1" style={{ color: "var(--fur-slate-light)" }}>Where is your service available?</p>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="rounded-2xl p-6 border" style={{ background: "white", borderColor: "var(--border)" }}>
              <h2 className="font-800 text-base mb-5" style={{ color: "var(--fur-slate)" }}>🏷️ Category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PROVIDER_SERVICE_CATEGORIES.filter(c => c.value !== "all").map((cat) => {
                  const cfg = CATEGORY_CONFIG[cat.value] || { bg: "var(--fur-sand)", color: "var(--fur-brown)", emoji: cat.emoji };
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat.value as ProviderServiceCategory })}
                      className="flex items-center gap-3 p-3 rounded-xl border-2 transition-all"
                      style={form.category === cat.value
                        ? { borderColor: cfg.color, background: cfg.bg }
                        : { borderColor: "var(--border)", background: "var(--fur-cream)" }}
                    >
                      <span className="text-xl">{cat.emoji}</span>
                      <span className="font-700 text-sm" style={{ color: form.category === cat.value ? cfg.color : "var(--fur-slate-mid)" }}>
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pricing & Duration */}
            <div className="rounded-2xl p-6 border" style={{ background: "white", borderColor: "var(--border)" }}>
              <h2 className="font-800 text-base mb-5" style={{ color: "var(--fur-slate)" }}>💰 Pricing & Duration</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-700 mb-2" style={{ color: "var(--fur-slate)" }}>Price (₱) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    className="fur-input"
                    style={errors.price ? { borderColor: "var(--fur-rose)" } : {}}
                  />
                  {errors.price && <p className="text-xs mt-1" style={{ color: "var(--fur-rose)" }}>{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-700 mb-2" style={{ color: "var(--fur-slate)" }}>Price Unit</label>
                  <select
                    value={form.priceUnit}
                    onChange={(e) => setForm({ ...form, priceUnit: e.target.value })}
                    className="fur-input"
                  >
                    {PRICE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-700 mb-2" style={{ color: "var(--fur-slate)" }}>Duration (min) *</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 60 })}
                    className="fur-input"
                    style={errors.duration ? { borderColor: "var(--fur-rose)" } : {}}
                  />
                  {errors.duration && <p className="text-xs mt-1" style={{ color: "var(--fur-rose)" }}>{errors.duration}</p>}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="rounded-2xl p-6 border" style={{ background: "white", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-800 text-base" style={{ color: "var(--fur-slate)" }}>✅ What's Included</h2>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, features: [...form.features, ""] })}
                  className="text-sm font-700 px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: "var(--fur-teal-light)", color: "var(--fur-teal-dark)" }}
                >
                  + Add Feature
                </button>
              </div>
              {errors.features && <p className="text-xs mb-3" style={{ color: "var(--fur-rose)" }}>{errors.features}</p>}
              <div className="space-y-3">
                {form.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                      style={{ background: "var(--fur-teal-light)" }}>
                      <span className="text-xs font-700" style={{ color: "var(--fur-teal)" }}>{idx + 1}</span>
                    </div>
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => updateFeature(idx, e.target.value)}
                      placeholder={`Feature ${idx + 1}`}
                      className="fur-input flex-1"
                    />
                    {form.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, features: form.features.filter((_, i) => i !== idx) })}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "var(--fur-rose)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-rose-light)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="rounded-2xl p-6 border" style={{ background: "white", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-800 text-base" style={{ color: "var(--fur-slate)" }}>🕐 Availability</h2>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, availability: [...form.availability, ""] })}
                  className="text-sm font-700 px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: "var(--fur-amber-light)", color: "var(--fur-amber-dark)" }}
                >
                  + Add Schedule
                </button>
              </div>
              <div className="space-y-3">
                {form.availability.map((avail, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-base"
                      style={{ background: "var(--fur-amber-light)" }}>
                      📅
                    </div>
                    <input
                      type="text"
                      value={avail}
                      onChange={(e) => updateAvailability(idx, e.target.value)}
                      placeholder="e.g. Mon-Fri: 9AM-6PM"
                      className="fur-input flex-1"
                    />
                    {form.availability.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, availability: form.availability.filter((_, i) => i !== idx) })}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "var(--fur-rose)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-rose-light)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Preview card */}
            <div className="rounded-2xl overflow-hidden border sticky top-24" style={{ borderColor: "var(--border)" }}>
              <div className="p-4 border-b" style={{ borderColor: "var(--border)", background: "white" }}>
                <p className="font-700 text-sm" style={{ color: "var(--fur-slate)" }}>Service Preview</p>
              </div>
              <div>
                <div className="h-28 flex items-center justify-center" style={{ background: currentCategory.bg }}>
                  <span className="text-4xl">{form.image}</span>
                </div>
                <div className="p-4" style={{ background: "white" }}>
                  <p className="font-800 text-sm truncate mb-1" style={{ color: "var(--fur-slate)" }}>
                    {form.name || "Service Name"}
                  </p>
                  <p className="text-xs mb-3 truncate" style={{ color: "var(--fur-slate-light)" }}>
                    {form.description || "Service description..."}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-900 text-lg" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
                        ₱{form.price || 0}
                      </span>
                      <span className="text-xs ml-1" style={{ color: "var(--fur-slate-light)" }}>{form.priceUnit}</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: currentCategory.bg, color: currentCategory.color }}>
                      {form.duration} min
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status toggle */}
            <div className="rounded-2xl p-5 border" style={{ background: "white", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-700 text-sm mb-0.5" style={{ color: "var(--fur-slate)" }}>Service Status</p>
                  <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                    {form.isActive ? "Visible to pet owners" : "Hidden from pet owners"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  style={{ background: form.isActive ? "var(--fur-teal)" : "#CBD5E0" }}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    form.isActive ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button onClick={handleSubmit} className="btn-primary w-full py-3.5">
                {isEditing ? "💾 Save Changes" : "🚀 Publish Service"}
              </button>
              <button onClick={() => router.back()} className="btn-secondary w-full py-3">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
};

export default ServiceFormPage;