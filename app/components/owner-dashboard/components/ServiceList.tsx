"use client";

import React from "react";
import { type Service } from "@/app/types";

interface ServiceListProps {
  services: Service[];
  onServiceClick: (service: Service) => void;
}

const ServiceList: React.FC<ServiceListProps> = ({ services, onServiceClick }) => {
  if (services.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
        <p className="text-gray-500">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm mb-4" style={{ color: "var(--fur-slate-light)" }}>
        {services.length} service{services.length !== 1 ? "s" : ""} found
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => onServiceClick(service)}
            className="rounded-2xl border overflow-hidden cursor-pointer transition-all"
            style={{
              background: "white",
              borderColor: "var(--border)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)";
              (e.currentTarget as HTMLDivElement).style.borderColor = "var(--fur-teal)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
              (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
            }}
          >
            {/* Image area */}
            <div className="relative h-44 flex items-center justify-center text-6xl"
              style={{ background: "var(--fur-mist)" }}>
              {service.image}
              <span
                className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-700 capitalize"
                style={{ background: "white", color: "var(--fur-slate-mid)", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
              >
                {service.category}
              </span>
            </div>

            <div className="p-4 space-y-3">
              {/* Name + provider */}
              <div>
                <h3 className="font-800 text-base mb-0.5 truncate" style={{ color: "var(--fur-slate)", fontFamily: "'Fraunces', serif" }}>
                  {service.name}
                </h3>
                <p className="text-xs flex items-center gap-1" style={{ color: "var(--fur-slate-light)" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  <span className="truncate">{service.provider}</span>
                </p>
              </div>

              {/* Address — prominent pill */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "var(--fur-teal-light)", border: "1px solid var(--fur-teal)" }}
              >
                <svg className="shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="var(--fur-teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span className="text-xs font-700 truncate" style={{ color: "var(--fur-teal-dark)" }}>
                  {service.location || "Address not specified"}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span className="text-xs font-700" style={{ color: "var(--fur-slate)" }}>{service.rating}</span>
                <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>({service.reviews} reviews)</span>
              </div>

              {/* Price + CTA */}
              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <div>
                  <span className="text-xl font-900" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
                    ₱{service.price}
                  </span>
                  <span className="text-xs ml-1" style={{ color: "var(--fur-slate-light)" }}>
                    {service.priceUnit}
                  </span>
                </div>
                <button
                  className="px-3.5 py-2 rounded-xl text-xs font-700 text-white transition-opacity hover:opacity-90"
                  style={{ background: "var(--fur-teal)" }}
                >
                  View Details →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceList;