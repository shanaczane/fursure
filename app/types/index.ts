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

export interface Vaccination {
  id: string;
  petId: string;
  name: string;
  dateGiven: string;
  nextDueDate?: string;
  vetName?: string;
  notes?: string;
}

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
  distance: string;
  duration: number;
  image: string;
  description: string;
  features: string[];
  availability: string[];
  responseTime: string;
}

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

  // Policy fields (set by provider, stored on booking at creation)
  requiresDownPayment?: boolean;
  downPaymentDeadlineHours?: number; // default 24
  editCancelGracePeriodHours?: number; // default 24
  createdAt?: string; // ISO string, needed for grace period calculations

  // Down payment tracking
  downPaymentPaid?: boolean;
  downPaymentPaidAt?: string;

  // Provider approval for edit/cancel after confirmation
  editRequestStatus?: "none" | "pending" | "approved" | "rejected";
  cancelRequestStatus?: "none" | "pending" | "approved" | "rejected";
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "owner" | "provider";
}

export type ServiceCategory =
  | "grooming"
  | "veterinary"
  | "training"
  | "boarding"
  | "walking"
  | "daycare"
  | "all";

export type BookingStatus =
  | "pending"
  | "awaiting_downpayment"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "declined";

export type SortOption = "rating" | "price" | "distance";

export interface ServiceFilters {
  category: ServiceCategory;
  priceRange: { min: number; max: number };
  minRating: number;
  maxDistance: number;
  searchQuery: string;
  availability?: string;
  sortBy: SortOption;
}

export interface FilterOptions {
  categories: ServiceCategory[];
  priceRanges: { label: string; min: number; max: number }[];
  ratings: number[];
  distances: { label: string; value: number }[];
}

export interface DashboardStats {
  upcomingBookings: number;
  completedBookings: number;
  totalPets: number;
  favoriteServices: number;
}

export interface UpcomingBooking extends Booking {
  daysUntil: number;
  serviceImage?: string;
}

export type NavItem = {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
};

export interface ServiceCardProps {
  service: Service;
  onClick: (service: Service) => void;
}

export interface BookingCardProps {
  booking: Booking;
  showActions?: boolean;
  onCancel?: (bookingId: string) => void;
  onReschedule?: (bookingId: string) => void;
}

export interface PetCardProps {
  pet: Pet;
  onEdit?: (petId: string) => void;
  onDelete?: (petId: string) => void;
}

export interface ServiceModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onBook?: (serviceId: string) => void;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface FilterPanelProps {
  filters: ServiceFilters;
  onChange: (filters: ServiceFilters) => void;
  onReset: () => void;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  loading: boolean;
}

export type DateRange = {
  startDate: string;
  endDate: string;
};

export interface BookingFormData {
  serviceId: string;
  petId: string;
  date: string;
  time: string;
  notes?: string;
}

export interface PetFormData {
  name: string;
  type: Pet["type"];
  breed: string;
  age: number;
  imageUrl?: string;
}

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: "all", label: "All Services" },
  { value: "grooming", label: "Grooming" },
  { value: "veterinary", label: "Veterinary" },
  { value: "training", label: "Training" },
  { value: "boarding", label: "Boarding" },
  { value: "walking", label: "Walking" },
  { value: "daycare", label: "Daycare" },
];

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  awaiting_downpayment: "bg-orange-100 text-orange-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  declined: "bg-gray-100 text-gray-700",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  awaiting_downpayment: "Awaiting Down Payment",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  declined: "Declined",
};

// ─── Booking policy helpers ───────────────────────────────────────────────────

/**
 * Returns hours elapsed since the booking was created.
 */
export function hoursElapsedSince(isoString?: string): number {
  if (!isoString) return Infinity;
  return (Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60);
}

/**
 * Returns hours remaining in the grace period (negative = expired).
 */
export function gracePeriodHoursRemaining(booking: Booking): number {
  const gracePeriod = booking.editCancelGracePeriodHours ?? 24;
  return gracePeriod - hoursElapsedSince(booking.createdAt);
}

/**
 * Whether the down-payment window has expired.
 */
export function isDownPaymentExpired(booking: Booking): boolean {
  if (!booking.requiresDownPayment) return false;
  const deadline = booking.downPaymentDeadlineHours ?? 24;
  return hoursElapsedSince(booking.createdAt) > deadline && !booking.downPaymentPaid;
}

/**
 * Derives all action permissions for a booking from the owner's perspective.
 */
export function getBookingPermissions(booking: Booking) {
  const { status, requiresDownPayment, downPaymentPaid } = booking;
  const withinGracePeriod = gracePeriodHoursRemaining(booking) > 0;

  // Provider explicitly approved an edit request — owner can edit freely,
  // bypassing grace-period and approval-dialog checks entirely.
  const editApproved = booking.editRequestStatus === "approved";

  // Can only delete cancelled, completed, or declined bookings
  const canDelete = status === "cancelled" || status === "completed" || status === "declined";

  let canEdit = false;
  let canCancel = false;
  let editNeedsProviderApproval = false;
  let cancelNeedsProviderApproval = false;

  if (requiresDownPayment) {
    // ── Down payment required flow ──────────────────────────────────────────
    if (status === "awaiting_downpayment") {
      // Free to cancel/edit within grace period (payment not yet made)
      canEdit = editApproved || withinGracePeriod;
      canCancel = withinGracePeriod;
    } else if (status === "pending" && downPaymentPaid) {
      // Down payment paid, waiting for provider — free to edit/cancel within grace
      canEdit = editApproved || withinGracePeriod;
      canCancel = withinGracePeriod;
    } else if (status === "confirmed") {
      // Provider confirmed — needs approval to edit/cancel (unless edit already approved)
      canEdit = true;
      canCancel = true;
      editNeedsProviderApproval = !editApproved;
      cancelNeedsProviderApproval = true;
    }
  } else {
    // ── No down payment flow ────────────────────────────────────────────────
    if (status === "pending") {
      // Free to edit/cancel within grace period
      canEdit = editApproved || withinGracePeriod;
      canCancel = withinGracePeriod;
    } else if (status === "confirmed") {
      // Needs provider approval (unless edit already approved)
      canEdit = true;
      canCancel = true;
      editNeedsProviderApproval = !editApproved;
      cancelNeedsProviderApproval = true;
    }
  }

  return {
    canEdit,
    canCancel,
    canDelete,
    editNeedsProviderApproval,
    cancelNeedsProviderApproval,
    withinGracePeriod,
    editApproved, // expose so components can render the "Edit Now" state
  };
}