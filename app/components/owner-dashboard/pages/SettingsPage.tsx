"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/app/contexts/AppContext";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import ConfirmDialog from "../components/Confirmdialog";
import SuccessModal from "../components/SuccessModal";

const SettingsPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, bookings } = useAppContext();
  const router = useRouter();
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const upcomingCount = bookings.filter(
    (b) =>
      (b.status === "pending" || b.status === "confirmed") &&
      new Date(b.date + "T00:00:00") >=
        new Date(new Date().setHours(0, 0, 0, 0)),
  ).length;

  const handleResetData = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Reset All Data",
      message:
        "Are you sure you want to reset all data? This will clear all your bookings, pets, and profile changes. This action cannot be undone.",
      onConfirm: () => {
        localStorage.removeItem("petcare_user");
        localStorage.removeItem("petcare_bookings");
        localStorage.removeItem("petcare_pets");
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        setSuccessModal({
          isOpen: true,
          title: "Data Reset",
          message: "All data has been reset. The page will reload.",
        });
        setTimeout(() => window.location.reload(), 2000);
      },
    });
  };

  const handleClearBookings = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Clear All Bookings",
      message:
        "Are you sure you want to clear all bookings? This action cannot be undone.",
      onConfirm: () => {
        localStorage.setItem("petcare_bookings", JSON.stringify([]));
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        setSuccessModal({
          isOpen: true,
          title: "Bookings Cleared",
          message: "All bookings have been cleared. The page will reload.",
        });
        setTimeout(() => window.location.reload(), 2000);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        upcomingBookingsCount={upcomingCount}
      />
      <div
        className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : "ml-0"}`}
      >
        <TopNavbar
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="p-4 md:p-6 mt-16">
          <div className="max-w-4xl mx-auto space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                Settings
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Manage your application settings
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Data Management
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    💾 Data Persistence
                  </h3>
                  <p className="text-sm text-blue-800">
                    Your data is saved locally in your browser. All changes will
                    persist even after refreshing the page.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Clear All Bookings
                      </h3>
                      <p className="text-sm text-gray-600">
                        Remove all booking history
                      </p>
                    </div>
                    <button
                      onClick={handleClearBookings}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Clear Bookings
                    </button>
                  </div>
                </div>
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-red-900">
                        Reset All Data
                      </h3>
                      <p className="text-sm text-red-700">
                        Clear all data and restore defaults (bookings, pets,
                        profile)
                      </p>
                    </div>
                    <button
                      onClick={handleResetData}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Reset All
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push("/owner/profile")}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              ← Back to Profile
            </button>
          </div>
        </main>
      </div>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmColor="red"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() =>
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        }
      />
      <SuccessModal
        isOpen={successModal.isOpen}
        title={successModal.title}
        message={successModal.message}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
      />
    </div>
  );
};

export default SettingsPage;
