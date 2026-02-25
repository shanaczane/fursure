export interface Pet {
  id: string;
  name: string;
  type: "dog" | "cat" | "bird" | "rabbit" | "other";
  breed: string;
  age: number;
  imageUrl?: string;
}

export interface Service {
  id: string;
  name: string;
  provider: string;
  category: ServiceCategory;
  rating: number;
  reviews: number;
  price: number;
  priceUnit: string;
  location: string;
  distance: string;
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
  date: string;
  time: string;
  status: BookingStatus;
  petName: string;
  notes?: string;
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

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

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
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};
