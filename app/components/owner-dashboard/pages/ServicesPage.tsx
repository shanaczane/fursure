"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/app/contexts/AppContext";
import { useDashboard } from "@/app/hooks/useDashboard";
import { type Service } from "@/app/types";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import ServiceSearch from "../components/ServiceSearch";
import ServiceList from "../components/ServiceList";
import ServiceModal from "../components/ServiceModal";
import BookingForm from "../components/BookingForm";
import SuccessModal from "../components/SuccessModal";

const ServicesPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [serviceToBook, setServiceToBook] = useState<Service | null>(null);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
  const router = useRouter();
  const { user, services, bookings, pets, addBooking } = useAppContext();

  const {
    services: filteredServices,
    filters,
    handleFilterChange,
    handleResetFilters,
    handleSearchChange,
    selectedService,
    isServiceModalOpen,
    handleServiceClick,
    handleCloseServiceModal,
  } = useDashboard({ services, bookings, pets, user });

  const handleBookService = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;
    if (pets.length === 0) {
      alert("Please add a pet first before booking a service!");
      router.push("/owner/pets");
      return;
    }
    setServiceToBook(service);
    setIsBookingFormOpen(true);
    handleCloseServiceModal();
  };

  const handleConfirmBooking = (
    serviceId: string,
    petId: string,
    date: string,
    time: string,
    notes: string,
  ) => {
    const service = services.find((s) => s.id === serviceId);
    const pet = pets.find((p) => p.id === petId);
    if (!service || !pet) return;
    addBooking({
      serviceId: service.id,
      serviceName: service.name,
      providerName: service.provider,
      date,
      time,
      status: "pending",
      petName: pet.name,
      notes: notes || "Booked via services page",
    });
    setSuccessModal({
      isOpen: true,
      title: "Booking Confirmed!",
      message: `Successfully booked ${service.name} for ${pet.name} on ${date} at ${time}!`,
    });
    setTimeout(() => router.push("/owner/bookings"), 2500);
  };

  const upcomingCount = bookings.filter(
    (b) =>
      (b.status === "pending" || b.status === "confirmed") &&
      new Date(b.date + "T00:00:00") >=
        new Date(new Date().setHours(0, 0, 0, 0)),
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        upcomingBookingsCount={upcomingCount}
      />
      <div
        className={`transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : "lg:ml-0"}`}
      >
        <TopNavbar
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="p-4 md:p-6 mt-16">
          <div className="max-w-7xl mx-auto space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                Services
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Browse and book pet care services
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Find Services
              </h2>
              <ServiceSearch
                filters={filters}
                onFilterChange={handleFilterChange}
                onSearchChange={handleSearchChange}
                onResetFilters={handleResetFilters}
              />
            </div>
            <ServiceList
              services={filteredServices}
              onServiceClick={handleServiceClick}
            />
          </div>
        </main>
      </div>
      <ServiceModal
        service={selectedService}
        isOpen={isServiceModalOpen}
        onClose={handleCloseServiceModal}
        onBook={handleBookService}
      />
      <BookingForm
        service={serviceToBook}
        pets={pets}
        isOpen={isBookingFormOpen}
        onClose={() => setIsBookingFormOpen(false)}
        onBook={handleConfirmBooking}
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

export default ServicesPage;
