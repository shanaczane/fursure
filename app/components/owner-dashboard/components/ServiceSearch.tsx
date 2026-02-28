"use client";

import React, { useState } from "react";
import { type ServiceFilters, SERVICE_CATEGORIES } from "@/app/types";

interface ServiceSearchProps {
  filters: ServiceFilters;
  onFilterChange: (filters: Partial<ServiceFilters>) => void;
  onSearchChange: (query: string) => void;
  onResetFilters: () => void;
}

const ServiceSearch: React.FC<ServiceSearchProps> = ({
  filters,
  onFilterChange,
  onSearchChange,
  onResetFilters,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.priceRange.min > 0 ||
    filters.priceRange.max < 500 ||
    filters.minRating > 0 ||
    filters.maxDistance < 100;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search services, providers, or categories..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-4 top-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
              •
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => onFilterChange({ category: cat.value })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.category === cat.value
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Price Range: ${filters.priceRange.min} - ${filters.priceRange.max}
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="500"
                value={filters.priceRange.min}
                onChange={(e) =>
                  onFilterChange({
                    priceRange: {
                      ...filters.priceRange,
                      min: parseInt(e.target.value),
                    },
                  })
                }
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max="500"
                value={filters.priceRange.max}
                onChange={(e) =>
                  onFilterChange({
                    priceRange: {
                      ...filters.priceRange,
                      max: parseInt(e.target.value),
                    },
                  })
                }
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Minimum Rating
            </label>
            <div className="flex space-x-2">
              {[0, 3, 4, 4.5, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => onFilterChange({ minRating: rating })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.minRating === rating
                      ? "bg-yellow-400 text-gray-900 shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  {rating === 0 ? "Any" : `${rating}+ ⭐`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Maximum Distance: {filters.maxDistance} km
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={filters.maxDistance}
              onChange={(e) =>
                onFilterChange({ maxDistance: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 km</span>
              <span>50 km</span>
              <span>100 km</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onFilterChange({
                  sortBy: e.target.value as "rating" | "price" | "distance",
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="rating">Highest Rating</option>
              <option value="price">Lowest Price</option>
              <option value="distance">Nearest Location</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors"
            >
              Reset All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ServiceSearch;
