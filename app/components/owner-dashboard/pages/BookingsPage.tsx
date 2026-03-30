"use client";

import React, { useState } from "react";
import { useAppContext } from "@/app/contexts/AppContext";
import { useDashboard } from "@/app/hooks/useDashboard";
import { type Booking, getBookingPermissions } from "@/app/types";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import UpcomingBookings from "../components/UpcomingBookings";
import BookingHistory from "../components/BookingHistory";
import BookingForm from "../components/BookingForm";
import ReviewForm from "../components/ReviewForm";
import ConfirmDialog from "../components/ConfirmDialog";
import SuccessModal from "../components/SuccessModal";
import {
  submitServiceReview,
  requestBookingEdit,
  requestBookingCancel,
  payDownPayment,
  updateBookingRecord,
  confirmReschedule,
  declineReschedule,
} from "@/app/lib/api";

const BookingsPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [bookAgainBooking, setBookAgainBooking] = useState<Booking | null>(null);
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
  const { upcomingBookings, pastBookings } = useDashboard({ services, bookings, pets, user });

  // Make sure rescheduled bookings always appear in upcoming even if useDashboard
  // doesn't include them — merge them in so the owner can respond to the proposal.
  const rescheduledPending = bookings.filter(
    (b) =>
      b.status === "rescheduled" &&
      !!b.rescheduleDate &&
      !!b.rescheduleTime &&
      !upcomingBookings.find((u) => u.id === b.id)
  );
  const visibleUpcoming = [...upcomingBookings, ...rescheduledPending];

  const closeConfirm = () => setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  const showSuccess = (title: string, message: string) =>
    setSuccessModal({ isOpen: true, title, message });

  // ── Edit ───────────────────────────────────────────────────────────────────

  const handleEditBooking = (booking: Booking) => {
    const { canEdit, editNeedsProviderApproval } = getBookingPermissions(booking);
    if (!canEdit) return;

    if (booking.editRequestStatus === "approved") {
      setEditingBooking(booking);
      setIsEditFormOpen(true);
      return;
    }

    if (editNeedsProviderApproval) {
      setConfirmDialog({
        isOpen: true,
        title: "Request Edit",
        message:
          "Your booking is already confirmed. Sending an edit request will notify the provider — changes take effect only after they approve. Continue?",
        confirmColor: "blue",
        onConfirm: async () => {
          closeConfirm();
          try {
            await requestBookingEdit(booking.id);
            updateBooking(booking.id, { editRequestStatus: "pending" });
            showSuccess(
              "Edit Request Sent",
              "Your edit request has been sent to the provider. You'll be notified once they respond."
            );
          } catch {
            showSuccess("Error", "Failed to send edit request. Please try again.");
          }
        },
      });
    } else {
      setEditingBooking(booking);
      setIsEditFormOpen(true);
    }
  };

  // ── Cancel ─────────────────────────────────────────────────────────────────

  const handleCancelBooking = (bookingId: string, needsApproval: boolean) => {
    if (needsApproval) {
      setConfirmDialog({
        isOpen: true,
        title: "Request Cancellation",
        message:
          "Your booking is confirmed. Sending a cancellation request will notify the provider — the booking is cancelled only after they approve. Continue?",
        confirmColor: "yellow",
        onConfirm: async () => {
          closeConfirm();
          try {
            await requestBookingCancel(bookingId);
            updateBooking(bookingId, { cancelRequestStatus: "pending" });
            showSuccess(
              "Cancellation Requested",
              "Your cancellation request has been sent to the provider. You'll be notified once they respond."
            );
          } catch {
            showSuccess("Error", "Failed to send cancellation request. Please try again.");
          }
        },
      });
    } else {
      setConfirmDialog({
        isOpen: true,
        title: "Cancel Booking",
        message: "Are you sure you want to cancel this booking?",
        confirmColor: "yellow",
        onConfirm: () => {
          cancelBooking(bookingId);
          closeConfirm();
          showSuccess("Booking Cancelled", "Your booking has been cancelled successfully.");
        },
      });
    }
  };

  const handleCancelBookingById = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    const { cancelNeedsProviderApproval } = getBookingPermissions(booking);
    handleCancelBooking(bookingId, cancelNeedsProviderApproval);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDeleteBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    const { canDelete } = getBookingPermissions(booking);
    if (!canDelete) {
      showSuccess("Cannot Delete", "You can only delete bookings that are cancelled or completed.");
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: "Delete Booking",
      message: "Are you sure you want to delete this booking? This action cannot be undone.",
      confirmColor: "red",
      onConfirm: () => {
        deleteBooking(bookingId);
        closeConfirm();
        showSuccess("Booking Deleted", "The booking has been removed from your history.");
      },
    });
  };

  // ── Down payment ───────────────────────────────────────────────────────────

  const handlePayDownPayment = (bookingId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Pay Down Payment",
      message:
        "You'll be redirected to complete the down payment. Once paid, your booking will be submitted to the provider for confirmation.",
      confirmColor: "green",
      onConfirm: async () => {
        closeConfirm();
        try {
          await payDownPayment(bookingId);
          updateBooking(bookingId, {
            downPaymentPaid: true,
            downPaymentPaidAt: new Date().toISOString(),
            status: "pending",
          });
          showSuccess(
            "Down Payment Received",
            "Your down payment was successful. The provider will now review and confirm your booking."
          );
        } catch {
          showSuccess("Payment Failed", "Unable to process payment. Please try again.");
        }
      },
    });
  };

  // ── Confirm reschedule proposal ────────────────────────────────────────────

  const handleConfirmReschedule = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking?.rescheduleDate || !booking.rescheduleTime) return;

    setConfirmDialog({
      isOpen: true,
      title: "Confirm New Schedule",
      message: `Accept the provider's proposed time: ${booking.rescheduleDate} at ${booking.rescheduleTime}? This will become your confirmed appointment.`,
      confirmColor: "green",
      onConfirm: async () => {
        closeConfirm();
        try {
          await confirmReschedule(bookingId, booking.rescheduleDate!, booking.rescheduleTime!);
          // Promote proposed date/time → actual booking date/time, keep status confirmed
          updateBooking(bookingId, {
            status: "confirmed",
            date: booking.rescheduleDate!,
            time: booking.rescheduleTime!,
            rescheduleDate: undefined,
            rescheduleTime: undefined,
            rescheduleStatus: "confirmed",
          });
          showSuccess(
            "Schedule Confirmed",
            "Your appointment has been confirmed with the new time. See you then!"
          );
        } catch {
          showSuccess("Error", "Failed to confirm the new schedule. Please try again.");
        }
      },
    });
  };

  // ── Decline reschedule proposal ────────────────────────────────────────────

  const handleDeclineReschedule = (bookingId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Decline Reschedule",
      message:
        "Are you sure you want to decline the provider's reschedule proposal? The booking will be cancelled.",
      confirmColor: "red",
      onConfirm: async () => {
        closeConfirm();
        try {
          await declineReschedule(bookingId);
          // Mark as cancelled AND clear reschedule fields so it moves to history
          updateBooking(bookingId, {
            status: "cancelled",
            rescheduleDate: undefined,
            rescheduleTime: undefined,
            rescheduleStatus: "declined",
          });
          showSuccess(
            "Reschedule Declined",
            "You've declined the new schedule. The booking has been cancelled."
          );
        } catch {
          showSuccess("Error", "Failed to decline the reschedule. Please try again.");
        }
      },
    });
  };

  // ── Update booking (from edit form) ───────────────────────────────────────

  const handleUpdateBooking = async (
    serviceId: string,
    petId: string,
    date: string,
    time: string,
    notes: string
  ) => {
    if (!editingBooking) return;
    const pet = pets.find((p) => p.id === petId);
    if (!pet) return;

    const wasApprovedEdit = editingBooking.editRequestStatus === "approved";

    const localUpdates: Partial<Booking> = {
      date,
      time,
      petName: pet.name,
      notes,
      ...(wasApprovedEdit && {
        status: "pending",
        editRequestStatus: "none",
      }),
    };

    try {
      await updateBookingRecord(editingBooking.id, localUpdates);
      updateBooking(editingBooking.id, localUpdates);

      setIsEditFormOpen(false);
      setEditingBooking(null);

      if (wasApprovedEdit) {
        showSuccess(
          "Booking Updated — Awaiting Re-confirmation",
          "Your changes have been saved. The provider will review and re-confirm your updated booking."
        );
      } else {
        showSuccess("Booking Updated", "Your booking has been updated successfully!");
      }
    } catch {
      showSuccess("Error", "Failed to update the booking. Please try again.");
    }
  };

  // ── Book again ─────────────────────────────────────────────────────────────

  const handleBookAgain = (booking: Booking) => {
    setBookAgainBooking(booking);
    setIsBookAgainFormOpen(true);
  };

  const handleConfirmBookAgain = (
    serviceId: string,
    petId: string,
    date: string,
    time: string,
    notes: string
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
      createdAt: new Date().toISOString(),
    });
    setIsBookAgainFormOpen(false);
    setBookAgainBooking(null);
    showSuccess(
      "Booking Confirmed",
      `Successfully booked ${service.name} for ${pet.name} on ${date}!`
    );
  };

  // ── Review ─────────────────────────────────────────────────────────────────

  const handleLeaveReview = (booking: Booking) => {
    setReviewingBooking(booking);
    setIsReviewFormOpen(true);
  };

  const handleSubmitReview = (bookingId: string, rating: number, _comment: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking?.serviceId) {
      submitServiceReview(booking.serviceId, rating).catch(console.error);
    }
    setIsReviewFormOpen(false);
    setReviewingBooking(null);
    showSuccess(
      "Review Submitted",
      `Thank you for your ${rating}-star review! Your feedback helps others.`
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        upcomingBookingsCount={visibleUpcoming.length}
      />
      <div
        style={{
          marginLeft: isSidebarOpen ? "16rem" : "0",
          transition: "margin-left 300ms ease-in-out",
        }}
      >
        <TopNavbar
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="p-4 md:p-6 mt-16">
          <div className="max-w-7xl mx-auto space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">My Bookings</h1>
              <p className="text-gray-600 text-sm md:text-base">
                Manage your appointments and booking history
              </p>
            </div>

            {visibleUpcoming.length > 0 ? (
              <UpcomingBookings
                bookings={visibleUpcoming}
                showViewAll={false}
                onEdit={handleEditBooking}
                onCancel={handleCancelBooking}
                onDelete={handleDeleteBooking}
                onPayDownPayment={handlePayDownPayment}
                onConfirmReschedule={handleConfirmReschedule}
                onDeclineReschedule={handleDeclineReschedule}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No upcoming bookings</h3>
                <p className="text-gray-500 mb-4">Book a service to get started</p>
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
              onCancel={handleCancelBookingById}
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
        policy={null}
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
        policy={null}
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
        onCancel={closeConfirm}
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