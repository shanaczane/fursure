// ─── Provider-specific types ────────────────────────────────────────────────

export interface ProviderPolicy {
  id?: string;
  depositRequired: boolean;
  depositPercentage: number;
  depositRefundable: boolean;
  cancellationHoursNotice: number;
  downPaymentDeadlineHours: number;
  paymentMethodsAccepted: string[];
  fullPaymentRequiredUpfront: boolean;
  additionalNotes?: string;
}

export const DEFAULT_POLICY: ProviderPolicy = {
  depositRequired: false,
  depositPercentage: 0,
  depositRefundable: true,
  cancellationHoursNotice: 24,
  downPaymentDeadlineHours: 24,
  paymentMethodsAccepted: ["Cash"],
  fullPaymentRequiredUpfront: false,
  additionalNotes: "",
};

export type ProviderServiceCategory =
  | "grooming"
  | "veterinary"
  | "training"
  | "boarding"
  | "walking"
  | "daycare";

export type BookingStatus =
  | "pending"
  | "awaiting_downpayment"
  | "payment_submitted"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "declined"
  | "rescheduled";

export interface ProviderBooking {
  id: string;
  serviceId: string;
  serviceName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  petId?: string;
  petName: string;
  petType: string;
  petBreed: string;
  date: string;
  time: string;
  status: BookingStatus;
  notes?: string;
  providerNotes?: string;
  rescheduleDate?: string;
  rescheduleTime?: string;
  rescheduleStatus?: "none" | "pending" | "confirmed" | "declined";
  price: number;
  createdAt: string;

  // Down payment fields
  requiresDownPayment?: boolean;
  downPaymentDeadlineHours?: number;
  downPaymentPaid?: boolean;
  downPaymentPaidAt?: string;
  downPaymentConfirmed?: boolean;
  downPaymentConfirmedAt?: string;
  editCancelGracePeriodHours?: number;

  // ── Policy snapshot fields (stamped at booking-creation time) ──────────
  // These are copied from the provider's ProviderPolicy at the moment the
  // booking is created so that ManageBookingsPage always shows the exact
  // terms the owner agreed to, even if the provider later changes their policy.
  depositPercentage?: number;   // e.g. 25 | 50 | 75 | 100
  depositRefundable?: boolean;  // whether the deposit is refundable on cancel

  // Edit / cancel request tracking
  editRequestStatus?: "none" | "pending" | "approved" | "rejected";
  cancelRequestStatus?: "none" | "pending" | "approved" | "rejected";

  rating?: number;
  reviewComment?: string;
  reviewDate?: string;
}

export interface ProviderNotification {
  id: string;
  type: "new_booking" | "payment_submitted" | "payment_overdue" | "edit_request" | "cancel_request" | "reschedule_accepted" | "reschedule_declined" | "new_review";
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
}

export interface ProviderUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  businessName: string;
  businessAddress?: string;
  bio?: string;
  avatar?: string;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  totalEarnings: number;
  joinedAt: string;
  contactLink?: string;
}

export interface ScheduleSlot {
  id: string;
  date: string;
  time: string;
  isBooked: boolean;
  bookingId?: string;
  isBlocked: boolean;
}

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  awaitingDownPaymentBookings: number;
  paymentSubmittedBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  declinedBookings: number;
  totalServices: number;
  activeServices: number;
  totalEarnings: number;
  monthlyEarnings: number;
  averageRating: number;
}

export interface ProviderService {
  id: string;
  name: string;
  category: ProviderServiceCategory;
  description: string;
  price: number;
  priceUnit: string;
  duration: number;
  image: string;
  location: string;
  features: string[];
  availability: string[];
  isActive: boolean;
  totalBookings: number;
  rating: number;
  reviews: number;
  createdAt: string;
}

export interface ServiceFilters {
  category: ProviderServiceCategory | "all";
  isActive: boolean | "all";
  searchQuery: string;
}

export interface BookingFilters {
  status: BookingStatus | "all";
  dateRange: "today" | "week" | "month" | "all";
  serviceId: string | "all";
  searchQuery: string;
}

export const PROVIDER_SERVICE_CATEGORIES: {
  value: ProviderServiceCategory | "all";
  label: string;
  emoji: string;
}[] = [
  { value: "all", label: "All", emoji: "🐾" },
  { value: "grooming", label: "Grooming", emoji: "✂️" },
  { value: "veterinary", label: "Veterinary", emoji: "🏥" },
  { value: "training", label: "Training", emoji: "🎓" },
  { value: "boarding", label: "Boarding", emoji: "🏠" },
  { value: "walking", label: "Walking", emoji: "🚶" },
  { value: "daycare", label: "Daycare", emoji: "🎾" },
];

export const BOOKING_STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; color: string; bg: string }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
  awaiting_downpayment: {
    label: "Awaiting Down Payment",
    color: "text-orange-700",
    bg: "bg-orange-50 border-orange-200",
  },
  payment_submitted: {
    label: "Payment Submitted",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
  },
  completed: {
    label: "Completed",
    color: "text-teal-700",
    bg: "bg-teal-50 border-teal-200",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
  },
  declined: {
    label: "Declined",
    color: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
  },
  rescheduled: {
    label: "Rescheduled",
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-200",
  },
};

// ─── Down-payment helpers ─────────────────────────────────────────────────────

export function hoursElapsedSince(isoString?: string): number {
  if (!isoString) return Infinity;
  return (Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60);
}

export function isDownPaymentExpired(booking: ProviderBooking): boolean {
  if (!booking.requiresDownPayment) return false;
  const deadline = booking.downPaymentDeadlineHours ?? 24;
  return hoursElapsedSince(booking.createdAt) > deadline && !booking.downPaymentPaid;
}

export function downPaymentHoursRemaining(booking: ProviderBooking): number {
  const deadline = booking.downPaymentDeadlineHours ?? 24;
  return Math.max(0, deadline - hoursElapsedSince(booking.createdAt));
}

// ─── Owner / shared types ────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "owner" | "provider";
  avatar?: string;
}

export interface Service {
  id: string;
  providerId: string;
  providerName: string;
  name: string;
  category: ProviderServiceCategory;
  description: string;
  price: number;
  priceUnit: string;
  duration: number;
  image: string;
  location: string;
  features: string[];
  availability: string[];
  isActive: boolean;
  rating: number;
  reviews: number;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  petId?: string;
  petName: string;
  petType: string;
  petBreed: string;
  date: string;
  time: string;
  status: BookingStatus;
  notes?: string;
  price: number;
  createdAt?: string;
  rating?: number;
  reviewComment?: string;

  // Down payment fields
  requiresDownPayment?: boolean;
  downPaymentDeadlineHours?: number;
  downPaymentPaid?: boolean;
  downPaymentPaidAt?: string;
  downPaymentConfirmed?: boolean;
  downPaymentConfirmedAt?: string;
  depositPercentage?: number;
  depositRefundable?: boolean;

  // Edit / cancel / reschedule tracking
  editRequestStatus?: "none" | "pending" | "approved" | "rejected";
  cancelRequestStatus?: "none" | "pending" | "approved" | "rejected";
  rescheduleDate?: string;
  rescheduleTime?: string;
  rescheduleStatus?: "none" | "pending" | "confirmed" | "declined";
}

export interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  weight?: number;
  avatar?: string;
  notes?: string;
  vaccinations?: PetVaccination[];
  medicalHistory?: PetMedicalRecord[];
}

export interface PetVaccination {
  id: string;
  vaccineName: string;
  dateGiven: string;
  nextDueDate?: string;
  veterinarianName?: string;
  notes?: string;
}

export interface PetMedicalRecord {
  id: string;
  date: string;
  type: string;
  description: string;
  veterinarianName?: string;
  notes?: string;
}

export interface VaccinationReminder {
  petId: string;
  petName: string;
  vaccineName: string;
  nextDueDate: string;
  daysUntilDue: number;
}

// ─── Owner notifications ─────────────────────────────────────────────────────
// IMPORTANT: "vaccine_recorded" must stay in this union so that AppContext
// and TopNavbar can reference it without ts(2322) / ts(2367) errors.

export interface OwnerNotification {
  id: string;
  type:
    | "booking_confirmed"
    | "booking_declined"
    | "reschedule_proposal"
    | "payment_required"
    | "review_pending"
    | "edit_approved"
    | "cancel_approved"
    | "vaccine_overdue"
    | "vaccine_due"
    | "vaccine_recorded";   // ← added: provider recorded a vaccination for the pet
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
}