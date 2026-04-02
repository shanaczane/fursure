// ─────────────────────────────────────────────────────────────
// PET
// ─────────────────────────────────────────────────────────────

export interface Pet {
  id: string;
  name: string;
  type: "dog" | "cat" | "bird" | "rabbit" | "other";
  breed: string;
  age: number;
  weight?: string;
  gender?: "male" | "female" | "unknown";
  color?: string;
  medicalNotes?: string;
  imageUrl?: string;
}

// ─────────────────────────────────────────────────────────────
// VACCINATION
// ─────────────────────────────────────────────────────────────

export interface Vaccination {
  id: string;
  petId: string;
  name: string;
  dateGiven: string;
  nextDueDate?: string;
  vetName?: string;
  notes?: string;
}

// ─────────────────────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "owner" | "provider";
}

// ─────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────

export type ServiceCategory =
  | "grooming"
  | "veterinary"
  | "training"
  | "boarding"
  | "walking"
  | "daycare"
  | "all";

export interface Service {
  id: string;
  name: string;
  provider: string;
  providerUserId?: string;
  category: ServiceCategory;
  rating: number;
  reviews: number;
  price: number;
  priceUnit: string;
  location: string;
  distance?: string;
  duration: number;
  image: string;
  description: string;
  features: string[];
  availability: string[];
  responseTime?: string;
}

// ─────────────────────────────────────────────────────────────
// SERVICE CATEGORIES  (was missing — fixes ServiceSearch.tsx)
// ─────────────────────────────────────────────────────────────

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string; emoji: string }[] = [
  { value: "all",        label: "All",        emoji: "🐾" },
  { value: "grooming",   label: "Grooming",   emoji: "✂️" },
  { value: "veterinary", label: "Veterinary", emoji: "🏥" },
  { value: "training",   label: "Training",   emoji: "🎓" },
  { value: "boarding",   label: "Boarding",   emoji: "🏠" },
  { value: "walking",    label: "Walking",    emoji: "🚶" },
  { value: "daycare",    label: "Daycare",    emoji: "🎾" },
];

// ─────────────────────────────────────────────────────────────
// BOOKING STATUS
// ─────────────────────────────────────────────────────────────

export type BookingStatus =
  | "pending"
  | "awaiting_downpayment"
  | "payment_submitted"
  | "confirmed"
  | "rescheduled"
  | "completed"
  | "cancelled"
  | "declined";

// ─────────────────────────────────────────────────────────────
// BOOKING
// ─────────────────────────────────────────────────────────────

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  providerName: string;
  providerUserId?: string;

  price?: number;

  date: string;
  time: string;

  status: BookingStatus;

  petName: string;
  notes?: string;

  providerPhone?: string;
  providerEmail?: string;
  providerContactLink?: string;

  // ─── Down Payment Policy ─────────────────────────────────

  requiresDownPayment: boolean;
  downPaymentDeadlineHours: number;

  downPaymentPaid: boolean;
  downPaymentPaidAt?: string;

  downPaymentConfirmed?: boolean;
  downPaymentConfirmedAt?: string;

  // ─── Grace Period / Edit Cancel ─────────────────────────

  editCancelGracePeriodHours: number;

  editRequestStatus: "none" | "pending" | "approved" | "rejected";
  cancelRequestStatus: "none" | "pending" | "approved" | "rejected";

  // ─── Reschedule Proposal ────────────────────────────────

  rescheduleDate?: string;
  rescheduleTime?: string;
  rescheduleStatus?: "pending" | "confirmed" | "declined";

  // ─── Metadata ───────────────────────────────────────────

  createdAt?: string;
}

// ─────────────────────────────────────────────────────────────
// FILTERS
// ─────────────────────────────────────────────────────────────

export type SortOption =
  | "rating"
  | "price_asc"
  | "price_desc"
  | "distance";

export interface ServiceFilters {
  category: ServiceCategory;
  priceRange: { min: number; max: number };
  minRating: number;
  maxDistance: number;
  searchQuery: string;
  availability?: string;
  sortBy: SortOption;
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  awaitingDownPaymentBookings: number;
  paymentSubmittedBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  declinedBookings: number;

  totalPets: number;
  favoriteServices: number;
}

// ─────────────────────────────────────────────────────────────
// STATUS COLORS
// ─────────────────────────────────────────────────────────────

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  awaiting_downpayment: "bg-orange-100 text-orange-800",
  payment_submitted: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  rescheduled: "bg-purple-100 text-purple-800",
  completed: "bg-teal-100 text-teal-800",
  cancelled: "bg-red-100 text-red-800",
  declined: "bg-gray-100 text-gray-700",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  awaiting_downpayment: "Awaiting Payment",
  payment_submitted: "Payment Submitted",
  confirmed: "Confirmed",
  rescheduled: "Rescheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  declined: "Declined",
};

// ─────────────────────────────────────────────────────────────
// DOWN PAYMENT HELPERS
// ─────────────────────────────────────────────────────────────

export function isDownPaymentExpired(booking: Booking): boolean {
  if (booking.status !== "awaiting_downpayment") return false;
  if (!booking.createdAt) return false;

  const deadline =
    new Date(booking.createdAt).getTime() +
    booking.downPaymentDeadlineHours * 60 * 60 * 1000;

  return Date.now() > deadline;
}

export function downPaymentHoursRemaining(booking: Booking): number {
  if (!booking.createdAt) return 0;

  const deadline =
    new Date(booking.createdAt).getTime() +
    booking.downPaymentDeadlineHours * 60 * 60 * 1000;

  return Math.max(0, (deadline - Date.now()) / (60 * 60 * 1000));
}

// ─────────────────────────────────────────────────────────────
// GRACE PERIOD HELPERS
// ─────────────────────────────────────────────────────────────

export function gracePeriodHoursRemaining(booking: Booking): number {
  if (!booking.createdAt) return 0;

  const graceMs =
    booking.editCancelGracePeriodHours * 60 * 60 * 1000;

  const elapsed =
    Date.now() - new Date(booking.createdAt).getTime();

  return Math.max(0, (graceMs - elapsed) / (60 * 60 * 1000));
}

// ─────────────────────────────────────────────────────────────
// BOOKING PERMISSIONS
// ─────────────────────────────────────────────────────────────

export interface BookingPermissions {
  canEdit: boolean;
  canCancel: boolean;
  canDelete: boolean;
  withinGracePeriod: boolean;
  editNeedsProviderApproval: boolean;
  cancelNeedsProviderApproval: boolean;
}

export function getBookingPermissions(
  booking: Booking
): BookingPermissions {

  const withinGracePeriod = gracePeriodHoursRemaining(booking) > 0;

  const isActive =
    booking.status === "pending" ||
    booking.status === "confirmed" ||
    booking.status === "awaiting_downpayment" ||
    booking.status === "payment_submitted" ||
    booking.status === "rescheduled";

  const isTerminal =
    booking.status === "completed" ||
    booking.status === "cancelled" ||
    booking.status === "declined";

  const paymentInFlight =
    booking.status === "awaiting_downpayment" ||
    booking.status === "payment_submitted";

  const editNeedsProviderApproval =
    booking.status === "confirmed" ||
    booking.status === "rescheduled";

  const cancelNeedsProviderApproval =
    booking.status === "confirmed" ||
    booking.status === "rescheduled";

  const hasPendingRequest =
    booking.editRequestStatus === "pending" ||
    booking.cancelRequestStatus === "pending";

  return {
    withinGracePeriod,

    canEdit:
      isActive &&
      !isTerminal &&
      !paymentInFlight &&
      !hasPendingRequest &&
      (withinGracePeriod || editNeedsProviderApproval),

    canCancel:
      isActive &&
      !isTerminal &&
      !hasPendingRequest &&
      (withinGracePeriod || cancelNeedsProviderApproval),

    canDelete: isTerminal,

    editNeedsProviderApproval,
    cancelNeedsProviderApproval,
  };
}