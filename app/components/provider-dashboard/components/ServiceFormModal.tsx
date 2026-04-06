"use client";

import React, { useState, useEffect } from "react";
import type { ProviderService, ProviderServiceCategory } from "../types";
import { PROVIDER_SERVICE_CATEGORIES } from "../types";

const PROFILE_STORAGE_KEY = "provider_profile_data";

interface ServiceFormModalProps {
  service: ProviderService | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ProviderService, "id" | "totalBookings" | "rating" | "reviews" | "createdAt">) => void;
  // ✅ Pass business address directly from context — reliable, no localStorage timing issues
  businessAddress?: string;
}

const PRICE_UNITS = ["per session", "per hour", "per day", "per week", "per visit"];

// Fallback: try localStorage if no prop was passed
function getSavedBusinessAddress(): string {
  if (typeof window === "undefined") return "";
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.businessAddress || "";
    }
  } catch {}
  return "";
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  service,
  isOpen,
  onClose,
  onSave,
  businessAddress,
}) => {
  // ✅ Context prop takes priority, localStorage is the fallback
  const resolveAddress = () =>
    businessAddress?.trim() || getSavedBusinessAddress();

  const getDefaultForm = () => ({
    name: "",
    category: "grooming" as ProviderServiceCategory,
    description: "",
    price: 0,
    priceUnit: "per session",
    duration: 60,
    image: "🐾",
    location: resolveAddress(),
    features: [""],
    availability: ["Mon-Sat: 9AM-6PM"],
    isActive: true,
  });

  const [form, setForm] = useState(getDefaultForm());
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Re-runs whenever modal opens OR businessAddress prop updates
  useEffect(() => {
    const address = resolveAddress();
    if (service) {
      setForm({
        name: service.name,
        category: service.category,
        description: service.description,
        price: service.price,
        priceUnit: service.priceUnit,
        duration: service.duration,
        image: service.image,
        location: address,
        features: service.features.length > 0 ? service.features : [""],
        availability: service.availability.length > 0 ? service.availability : ["Mon-Sat: 9AM-6PM"],
        isActive: service.isActive,
      });
    } else {
      setForm({ ...getDefaultForm(), location: address });
    }
    setErrors({});
  }, [service, isOpen, businessAddress]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Service name is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (form.price <= 0) errs.price = "Price must be greater than 0";
    if (form.duration <= 0) errs.duration = "Duration must be greater than 0";
    const validFeatures = form.features.filter((f) => f.trim());
    if (validFeatures.length === 0) errs.features = "At least one feature is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      ...form,
      location: resolveAddress(),
      features: form.features.filter((f) => f.trim()),
      availability: form.availability.filter((a) => a.trim()),
    });
    onClose();
  };

  const updateFeature = (idx: number, val: string) => {
    const updated = [...form.features];
    updated[idx] = val;
    setForm({ ...form, features: updated });
  };
  const addFeature = () => setForm({ ...form, features: [...form.features, ""] });
  const removeFeature = (idx: number) =>
    setForm({ ...form, features: form.features.filter((_, i) => i !== idx) });

  const updateAvailability = (idx: number, val: string) => {
    const updated = [...form.availability];
    updated[idx] = val;
    setForm({ ...form, availability: updated });
  };
  const addAvailability = () => setForm({ ...form, availability: [...form.availability, ""] });
  const removeAvailability = (idx: number) =>
    setForm({ ...form, availability: form.availability.filter((_, i) => i !== idx) });

  const EMOJI_OPTIONS = ["🐕", "🐈", "😺", "🐶", "🐾", "✂️", "🏥", "🎓", "🏠", "🚶", "🎾", "🦴", "🛁", "🚐", "📸"];
  const displayAddress = resolveAddress();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-gray-900">
              {service ? "Edit Service" : "Add New Service"}
            </h2>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Emoji + Name */}
            <div className="flex items-start space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Icon</label>
                <div className="flex flex-wrap gap-2 max-w-[160px]">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setForm({ ...form, image: emoji })}
                      className={`w-9 h-9 text-xl rounded-lg border-2 transition-all ${
                        form.image === emoji ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Premium Dog Grooming"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {PROVIDER_SERVICE_CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat.value as ProviderServiceCategory })}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      form.category === cat.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Describe your service in detail..."
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm ${
                  errors.description ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>

            {/* Price + Duration */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₱) *</label>
                <input
                  type="number" min="0" step="0.01" value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? "border-red-400" : "border-gray-300"}`}
                />
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price Unit</label>
                <select
                  value={form.priceUnit}
                  onChange={(e) => setForm({ ...form, priceUnit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PRICE_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (min) *</label>
                <input
                  type="number" min="15" step="15" value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 60 })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.duration ? "border-red-400" : "border-gray-300"}`}
                />
                {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration}</p>}
              </div>
            </div>

            {/* ✅ Location — read-only, driven by profile business address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Location / Area</label>
              {displayAddress ? (
                <>
                  <div className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{displayAddress}</span>
                  </div>
                  <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#059669" }}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Auto-filled from your business address. To change it, go to <strong>&nbsp;Profile → Business</strong>.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-full px-3 py-2.5 border border-dashed border-amber-300 rounded-lg bg-amber-50 text-amber-700 text-sm">
                    No business address set yet.
                  </div>
                  <p className="text-xs mt-1.5 text-amber-600">
                    ⚠️ Go to <strong>Profile → Business</strong>, enter your address and hit <strong>Save Changes</strong> — it will appear here automatically.
                  </p>
                </>
              )}
            </div>

            {/* Features */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Features *</label>
                <button type="button" onClick={addFeature} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add Feature</button>
              </div>
              {errors.features && <p className="text-xs text-red-500 mb-1">{errors.features}</p>}
              <div className="space-y-2">
                {form.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="text" value={feat}
                      onChange={(e) => updateFeature(idx, e.target.value)}
                      placeholder={`Feature ${idx + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    {form.features.length > 1 && (
                      <button type="button" onClick={() => removeFeature(idx)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Availability</label>
                <button type="button" onClick={addAvailability} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add Schedule</button>
              </div>
              <div className="space-y-2">
                {form.availability.map((avail, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="text" value={avail}
                      onChange={(e) => updateAvailability(idx, e.target.value)}
                      placeholder="e.g. Mon-Fri: 9AM-6PM"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    {form.availability.length > 1 && (
                      <button type="button" onClick={() => removeAvailability(idx)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Service Status</p>
                <p className="text-xs text-gray-500">{form.isActive ? "Visible to pet owners for booking" : "Hidden from pet owners"}</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex space-x-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              {service ? "Save Changes" : "Add Service"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceFormModal;