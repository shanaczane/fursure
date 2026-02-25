"use client";

import React from "react";
import { type User } from "@/app/types";

interface WelcomeSectionProps {
  user: User;
  stats: {
    upcomingBookings: number;
    completedBookings: number;
    totalPets: number;
    totalServices: number;
  };
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ user, stats }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-4 md:p-6 text-white">
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            {getGreeting()}, {user.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-blue-100 text-sm md:text-base">
            Ready to take care of your furry friends today?
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-3 text-center shadow-md">
            <p className="text-xl md:text-2xl font-bold text-blue-600">
              {stats.upcomingBookings}
            </p>
            <p className="text-xs md:text-sm text-gray-600 font-medium">
              Upcoming
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-md">
            <p className="text-xl md:text-2xl font-bold text-purple-600">
              {stats.totalPets}
            </p>
            <p className="text-xs md:text-sm text-gray-600 font-medium">
              My Pets
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-md">
            <p className="text-xl md:text-2xl font-bold text-green-600">
              {stats.totalServices}
            </p>
            <p className="text-xs md:text-sm text-gray-600 font-medium">
              Services
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-md">
            <p className="text-xl md:text-2xl font-bold text-orange-600">
              {stats.completedBookings}
            </p>
            <p className="text-xs md:text-sm text-gray-600 font-medium">
              Completed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;
