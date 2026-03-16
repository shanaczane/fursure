"use client";

import React, { useState, useMemo } from "react";
import { useProviderContext } from "../context/ProviderAppContext";
import type { ProviderService } from "../types";
import { PROVIDER_SERVICE_CATEGORIES } from "../types";
import { formatCurrency } from "../utils/providerUtils";
import ProviderLayout from "../components/ProviderLayout";
import ServiceFormModal from "../components/ServiceFormModal";

const MyServicesPage: React.FC = () => {
  const { services, addService, updateService, deleteService, toggleServiceActive } =
    useProviderContext();

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(true);
  const [editingService, setEditingService] = useState<ProviderService | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const filtered = useMemo(() => {
    return services.filter((s) => {
      if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
      if (!showInactive && !s.isActive) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [services, categoryFilter, searchQuery, showInactive]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleAdd = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEdit = (service: ProviderService) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleSave = (data: Omit<ProviderService, "id" | "totalBookings" | "rating" | "reviews" | "createdAt">) => {
    if (editingService) {
      updateService(editingService.id, data);
      showSuccess("Service updated successfully!");
    } else {
      addService(data);
      showSuccess("Service added successfully!");
    }
  };

  const handleDelete = (id: string) => {
    deleteService(id);
    setDeleteConfirmId(null);
    showSuccess("Service deleted.");
  };

  const handleToggle = (id: string, name: string, isActive: boolean) => {
    toggleServiceActive(id);
    showSuccess(`"${name}" is now ${!isActive ? "active" : "inactive"}.`);
  };

  const activeCount = services.filter((s) => s.isActive).length;

  return (
    <ProviderLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">My Services</h1>
            <p className="text-gray-500 text-sm">
              {activeCount} active · {services.length} total
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <span>➕</span>
            <span>Add New Service</span>
          </button>
        </div>

        {/* Success Toast */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-2">
            <span>✓</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showInactive"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="showInactive" className="text-sm text-gray-600 whitespace-nowrap">
                Show inactive
              </label>
            </div>
          </div>
          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            {PROVIDER_SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  categoryFilter === cat.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-5xl mb-3">🐾</p>
            <p className="font-semibold text-gray-700">No services found</p>
            <p className="text-gray-500 text-sm mt-1">
              {services.length === 0 ? "Add your first service to get started" : "Try adjusting your filters"}
            </p>
            {services.length === 0 && (
              <button
                onClick={handleAdd}
                className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Add First Service
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((service) => (
              <div
                key={service.id}
                className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all ${
                  service.isActive ? "border-gray-200 hover:border-blue-300" : "border-dashed border-gray-300 opacity-70"
                }`}
              >
                {/* Card Header */}
                <div className="h-28 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative">
                  <span className="text-5xl">{service.image}</span>
                  {!service.isActive && (
                    <span className="absolute top-2 right-2 bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      Inactive
                    </span>
                  )}
                  {service.isActive && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      Active
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="font-bold text-gray-900 text-base line-clamp-1">{service.name}</h3>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-xs text-gray-500 capitalize">{service.category}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-500">{service.duration} min</span>
                      {service.rating > 0 && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-yellow-600">⭐ {service.rating} ({service.reviews})</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{service.description}</p>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 mb-3">
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(service.price)}
                      </p>
                      <p className="text-xs text-gray-500">{service.priceUnit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-700">{service.totalBookings}</p>
                      <p className="text-xs text-gray-500">bookings</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggle(service.id, service.name, service.isActive)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        service.isActive
                          ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          : "bg-green-50 hover:bg-green-100 text-green-700"
                      }`}
                    >
                      {service.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(service.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete service"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Delete Confirm Inline */}
                {deleteConfirmId === service.id && (
                  <div className="bg-red-50 border-t border-red-200 px-4 py-3">
                    <p className="text-sm text-red-700 font-medium mb-2">
                      Delete "{service.name}"? This cannot be undone.
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="flex-1 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ServiceFormModal
        service={editingService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </ProviderLayout>
  );
};

export default MyServicesPage;