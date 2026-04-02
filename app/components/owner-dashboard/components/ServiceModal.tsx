"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { type Service } from "@/app/types";

interface ServiceModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onBook?: (serviceId: string) => void;
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  service,
  isOpen,
  onClose,
  onBook,
}) => {
  const router = useRouter();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !service) return null;

  // ── Navigate to provider profile ───────────────────────────────────────────
  const handleProviderClick = () => {
    if (!service.providerUserId) return;
    onClose(); // close modal first so the back button returns to the services list
    router.push(`/owner/providers/${service.providerUserId}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="h-64 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
            <span className="text-9xl">{service.image}</span>
          </div>

          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {service.name}
              </h2>

              {/* ── Provider name — clickable if providerUserId exists ─────── */}
              <div className="flex items-center space-x-2">
                <span>🏢</span>
                {service.providerUserId ? (
                  <button
                    onClick={handleProviderClick}
                    className="text-lg font-semibold hover:underline transition-colors flex items-center gap-1.5 group"
                    style={{
                      color: "var(--fur-teal)",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    {service.provider}
                    {/* external-link icon hint */}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: "var(--fur-teal)" }}
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </button>
                ) : (
                  <span className="text-lg text-gray-600">{service.provider}</span>
                )}
              </div>
              {service.providerUserId && (
                <p className="text-xs mt-1 ml-6" style={{ color: "var(--fur-slate-light)" }}>
                  Click provider name to view profile &amp; all services
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {service.rating}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {service.reviews} reviews
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  ₱{service.price}
                </div>
                <p className="text-sm text-gray-600">{service.priceUnit}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <span>📍</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {service.distance}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{service.location}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                About This Service
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {service.description}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                What&apos;s Included
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {service.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-gray-700"
                  >
                    <svg
                      className="w-5 h-5 text-green-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Availability
              </h3>
              <div className="space-y-2">
                {service.availability.map((schedule, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-gray-700"
                  >
                    <span className="text-blue-600">🕐</span>
                    <span>{schedule}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 flex items-center space-x-2">
                <span>⏱️</span>
                <span>
                  <strong>Response Time:</strong> {service.responseTime}
                </span>
              </p>
            </div>

            {/* ── View provider profile CTA ─────────────────────────────────── */}
            {service.providerUserId && (
              <div
                className="flex items-center justify-between p-4 rounded-xl border mb-6"
                style={{
                  background: "var(--fur-teal-light)",
                  borderColor: "var(--fur-teal)",
                }}
              >
                <div>
                  <p className="text-sm font-700" style={{ color: "var(--fur-teal-dark)" }}>
                    Want to learn more about {service.provider}?
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--fur-teal-dark)", opacity: 0.75 }}>
                    View their full profile, contact info, and all services
                  </p>
                </div>
                <button
                  onClick={handleProviderClick}
                  className="shrink-0 px-4 py-2 rounded-xl text-sm font-700 text-white transition-opacity hover:opacity-90"
                  style={{ background: "var(--fur-teal)" }}
                >
                  View Profile →
                </button>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => onBook && onBook(service.id)}
                className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors duration-200"
              >
                Book This Service
              </button>
              <button
                onClick={onClose}
                className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;