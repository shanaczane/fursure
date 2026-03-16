// ─── Provider-specific types ────────────────────────────────────────────────

export type ProviderServiceCategory =
  | "grooming"
  | "veterinary"
  | "training"
  | "boarding"
  | "walking"
  | "daycare";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "rescheduled";

export interface ProviderService {
  id: string;
  name: string;
  category: ProviderServiceCategory;
  description: string;
  price: number;
  priceUnit: string;
  duration: number; // minutes
  image: string;
  features: string[];
  availability: string[];
  isActive: boolean;
  totalBookings: number;
  rating: number;
  reviews: number;
  createdAt: string;
}

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
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalServices: number;
  activeServices: number;
  totalEarnings: number;
  monthlyEarnings: number;
  averageRating: number;
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
  rescheduled: {
    label: "Rescheduled",
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-200",
  },
};