"use client";

import React, { useState } from "react";
import { useAppContext } from "@/app/contexts/AppContext";
import { useDashboard } from "@/app/hooks/useDashboard";
import { type Booking } from "@/app/types";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import UpcomingBookings from "../components/UpcomingBookings";
import BookingHistory from "../components/BookingHistory";
import BookingForm from "../components/BookingForm";
import ReviewForm from "../components/ReviewForm";
import ConfirmDialog from "../components/ConfirmDialog";
import SuccessModal from "../components/SuccessModal";

const BookingsPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(
    null,
  );
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [bookAgainBooking, setBookAgainBooking] = useState<Booking | null>(
    null,
  );
  const [isBookAgainFormOpen, setIsBookAgainFormOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmColor: "blue" as "blue" | "red" | "yellow" | "green",
    onConfirm: () => {},
  });
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const {
    user,
    services,
    bookings,
    pets,
    updateBooking,
    deleteBooking,
    cancelBooking,
    addBooking,
  } = useAppContext();
  const { upcomingBookings, pastBookings } = useDashboard({
    services,
    bookings,
    pets,
    user,
  });

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setIsEditFormOpen(true);
  };

  const handleCancelBooking = (bookingId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Cancel Booking",
      message: "Are you sure you want to cancel this booking?",
      confirmColor: "yellow",
      onConfirm: () => {
        cancelBooking(bookingId);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        setSuccessModal({
          isOpen: true,
          title: "Booking Cancelled",
          message: "Your booking has been cancelled successfully.",
        });
      },
    });
  };

  const handleDeleteBooking = (bookingId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Booking",
      message:
        "Are you sure you want to delete this booking? This action cannot be undone.",
      confirmColor: "red",
      onConfirm: () => {
        deleteBooking(bookingId);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        setSuccessModal({
          isOpen: true,
          title: "Booking Deleted",
          message: "The booking has been removed from your history.",
        });
      },
    });
  };

  const handleUpdateBooking = (
    serviceId: string,
    petId: string,
    date: string,
    time: string,
    notes: string,
  ) => {
    if (!editingBooking) return;
    const pet = pets.find((p) => p.id === petId);
    if (!pet) return;
    updateBooking(editingBooking.id, { date, time, petName: pet.name, notes });
    setIsEditFormOpen(false);
    setEditingBooking(null);
    setSuccessModal({
      isOpen: true,
      title: "Booking Updated",
      message: "Your booking has been updated successfully!",
    });
  };

  const handleBookAgain = (booking: Booking) => {
    setBookAgainBooking(booking);
    setIsBookAgainFormOpen(true);
  };

  const handleConfirmBookAgain = (
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
      notes: notes || "Rebooked service",
    });
    setIsBookAgainFormOpen(false);
    setBookAgainBooking(null);
    setSuccessModal({
      isOpen: true,
      title: "Booking Confirmed",
      message: `Successfully booked ${service.name} for ${pet.name} on ${date}!`,
    });
  };

  const handleLeaveReview = (booking: Booking) => {
    setReviewingBooking(booking);
    setIsReviewFormOpen(true);
  };

  const handleSubmitReview = (
    bookingId: string,
    rating: number,
    comment: string,
  ) => {
    console.log("Review submitted:", { bookingId, rating, comment });
    setIsReviewFormOpen(false);
    setReviewingBooking(null);
    setSuccessModal({
      isOpen: true,
      title: "Review Submitted",
      message: `Thank you for your ${rating}-star review! Your feedback helps others.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        upcomingBookingsCount={upcomingBookings.length}
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
                My Bookings
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Manage your appointments and booking history
              </p>
            </div>
            {upcomingBookings.length > 0 ? (
              <UpcomingBookings
                bookings={upcomingBookings}
                showViewAll={false}
                onEdit={handleEditBooking}
                onCancel={handleCancelBooking}
                onDelete={handleDeleteBooking}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No upcoming bookings
                </h3>
                <p className="text-gray-500 mb-4">
                  Book a service to get started
                </p>
                <a
                  href="/owner/services"
                  className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Browse Services
                </a>
              </div>
            )}
            <BookingHistory
              bookings={pastBookings}
              onEdit={handleEditBooking}
              onDelete={handleDeleteBooking}
              onCancel={handleCancelBooking}
              onBookAgain={handleBookAgain}
              onLeaveReview={handleLeaveReview}
            />
          </div>
        </main>
      </div>

      <BookingForm
        service={
          editingBooking
            ? services.find((s) => s.id === editingBooking.serviceId) || null
            : null
        }
        pets={pets}
        isOpen={isEditFormOpen}
        onClose={() => {
          setIsEditFormOpen(false);
          setEditingBooking(null);
        }}
        onBook={handleUpdateBooking}
      />
      <BookingForm
        service={
          bookAgainBooking
            ? services.find((s) => s.id === bookAgainBooking.serviceId) || null
            : null
        }
        pets={pets}
        isOpen={isBookAgainFormOpen}
        onClose={() => {
          setIsBookAgainFormOpen(false);
          setBookAgainBooking(null);
        }}
        onBook={handleConfirmBookAgain}
      />
      <ReviewForm
        booking={reviewingBooking}
        isOpen={isReviewFormOpen}
        onClose={() => {
          setIsReviewFormOpen(false);
          setReviewingBooking(null);
        }}
        onSubmit={handleSubmitReview}
      />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmColor={confirmDialog.confirmColor}
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

export default BookingsPage;
