"use client";

import React from "react";
import { type Service } from "@/app/types";

interface ServiceListProps {
  services: Service[];
  onServiceClick: (service: Service) => void;
}

const ServiceList: React.FC<ServiceListProps> = ({
  services,
  onServiceClick,
}) => {
  if (services.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No services found
        </h3>
        <p className="text-gray-500">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Available Services ({services.length})
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => onServiceClick(service)}
            className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-500 overflow-hidden group"
          >
            <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300">
              {service.image}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center space-x-1">
                    <span>🏢</span>
                    <span className="line-clamp-1">{service.provider}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-semibold text-gray-900">
                    {service.rating}
                  </span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-600">
                  {service.reviews} reviews
                </span>
              </div>
              <div className="flex items-center justify-between mb-3 text-sm">
                <span className="text-gray-600 flex items-center space-x-1">
                  <span>📍</span>
                  <span>{service.location}</span>
                </span>
                <span className="text-blue-600 font-medium">
                  {service.distance}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {service.description}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    ${service.price}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    {service.priceUnit}
                  </span>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200">
                  View Details
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3 flex items-center space-x-1">
                <span>⏱️</span>
                <span>{service.responseTime}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceList;
