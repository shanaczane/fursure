// ─── Provider-specific types ────────────────────────────────────────────────

export interface ProviderPolicy {
  id?: string;
  depositRequired: boolean;
  depositPercentage: number;
  depositRefundable: boolean;
  cancellationHoursNotice: number;
  downPaymentDeadlineHours: number; // hours owner has to pay deposit (default 24)
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
  price: number;
  createdAt: string;

  // Down payment fields (mirrors owner Booking type)
  requiresDownPayment?: boolean;
  downPaymentDeadlineHours?: number;
  downPaymentPaid?: boolean;
  downPaymentPaidAt?: string;
  editCancelGracePeriodHours?: number;

  // Edit / cancel request tracking
  editRequestStatus?: "none" | "pending" | "approved" | "rejected";
  cancelRequestStatus?: "none" | "pending" | "approved" | "rejected";
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
  duration: number; // minutes
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
  confirmed: {
    label: "Confirmed",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
  },
  completed: {
    label: "Completed",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
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

// ─── Down-payment helpers (mirrors owner-side logic) ─────────────────────────

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
  return deadline - hoursElapsedSince(booking.createdAt);
}
