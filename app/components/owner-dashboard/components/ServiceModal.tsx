"use client";

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
              <p className="text-lg text-gray-600 flex items-center space-x-2">
                <span>🏢</span>
                <span>{service.provider}</span>
              </p>
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
                  ${service.price}
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
