"use client";

import React from "react";
import Link from "next/link";
import { type Pet } from "@/app/types";

interface QuickActionsProps {
  pets: Pet[];
}

const QuickActions: React.FC<QuickActionsProps> = ({ pets }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Link
        href="/owner/pets"
        className="bg-white border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg p-6 text-center transition-all duration-200 hover:shadow-md group"
      >
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center text-2xl transition-colors">
            ➕
          </div>
          <h3 className="font-semibold text-gray-900">Add New Pet</h3>
          <p className="text-sm text-gray-500">Register a new pet profile</p>
        </div>
      </Link>

      <Link
        href="/owner/pets"
        className="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-lg p-6 text-center transition-all duration-200 hover:shadow-md group"
      >
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 bg-purple-100 group-hover:bg-purple-200 rounded-full flex items-center justify-center text-2xl transition-colors">
            🐾
          </div>
          <h3 className="font-semibold text-gray-900">Manage Pets</h3>
          <p className="text-sm text-gray-500">
            {pets.length} pet{pets.length !== 1 ? "s" : ""} registered
          </p>
        </div>
      </Link>

      <Link
        href="/owner/bookings"
        className="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-lg p-6 text-center transition-all duration-200 hover:shadow-md group"
      >
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 bg-green-100 group-hover:bg-green-200 rounded-full flex items-center justify-center text-2xl transition-colors">
            📅
          </div>
          <h3 className="font-semibold text-gray-900">All Bookings</h3>
          <p className="text-sm text-gray-500">View booking history</p>
        </div>
      </Link>
    </div>
  );
};

export default QuickActions;
