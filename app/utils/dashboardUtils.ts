import {
  type Service,
  type Booking,
  type Pet,
  type ServiceFilters,
  type BookingStatus,
  type SortOption,
  type ServiceCategory,
} from "@/app/types";

export const filterServices = (
  services: Service[],
  filters: ServiceFilters,
): Service[] => {
  return services.filter((service) => {
    if (filters.category !== "all" && service.category !== filters.category)
      return false;
    if (
      service.price < filters.priceRange.min ||
      service.price > filters.priceRange.max
    )
      return false;
    if (service.rating < filters.minRating) return false;

    // Only apply distance filter if the service actually has a numeric distance
    const dist = parseFloat(service.distance ?? "");
    if (!isNaN(dist) && dist > filters.maxDistance) return false;

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const text =
        `${service.name} ${service.provider} ${service.description} ${service.category}`.toLowerCase();
      if (!text.includes(query)) return false;
    }
    return true;
  });
};

export const sortServices = (
  services: Service[],
  sortBy: SortOption,
): Service[] => {
  const sorted = [...services];
  switch (sortBy) {
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "price_asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price_desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "distance":
      return sorted.sort(
        (a, b) =>
          parseFloat(a.distance ?? "0") - parseFloat(b.distance ?? "0"),
      );
    default:
      return sorted;
  }
};

export const getServiceById = (
  services: Service[],
  id: string,
): Service | undefined => services.find((s) => s.id === id);

export const getUpcomingBookings = (bookings: Booking[]): Booking[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeStatuses: BookingStatus[] = [
    "pending",
    "confirmed",
    "awaiting_downpayment",
    "payment_submitted",
    "rescheduled",
  ];

  return bookings
    .filter((b) => {
      if (!activeStatuses.includes(b.status)) return false;
      return new Date(b.date + "T00:00:00") >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getPastBookings = (bookings: Booking[]): Booking[] =>
  bookings
    .filter((b) => b.status === "completed" || b.status === "cancelled")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const getBookingsByStatus = (
  bookings: Booking[],
  status: BookingStatus,
): Booking[] => bookings.filter((b) => b.status === status);

export const getDaysUntilBooking = (date: string): number => {
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  bookingDate.setHours(0, 0, 0, 0);
  return Math.ceil(
    (bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
};

export const formatBookingDate = (date: string, time: string): string => {
  const bookingDate = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  return `${bookingDate.toLocaleDateString("en-US", options)} at ${time}`;
};

export const isToday = (date: string): boolean => {
  const today = new Date();
  const check = new Date(date);
  return (
    today.getFullYear() === check.getFullYear() &&
    today.getMonth() === check.getMonth() &&
    today.getDate() === check.getDate()
  );
};

export const isTomorrow = (date: string): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const check = new Date(date);
  return (
    tomorrow.getFullYear() === check.getFullYear() &&
    tomorrow.getMonth() === check.getMonth() &&
    tomorrow.getDate() === check.getDate()
  );
};

export const formatRelativeDate = (date: string): string => {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  const daysUntil = getDaysUntilBooking(date);
  if (daysUntil > 0 && daysUntil <= 7)
    return `In ${daysUntil} day${daysUntil === 1 ? "" : "s"}`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatPrice = (price: number, unit: string): string =>
  `₱${price} ${unit}`;

// ─── Recommendation engine ────────────────────────────────────────────────────

const PET_CATEGORY_AFFINITY: Record<Pet["type"], ServiceCategory[]> = {
  dog:    ["grooming", "walking", "training", "boarding", "daycare", "veterinary"],
  cat:    ["grooming", "veterinary", "boarding"],
  bird:   ["veterinary"],
  rabbit: ["veterinary", "grooming"],
  other:  ["veterinary"],
};

export interface RecommendedService {
  service: Service;
  reason: string;
  score: number;
}

export function getRecommendedServices(
  services: Service[],
  pets: Pet[],
  bookings: Booking[],
  limit = 3,
): RecommendedService[] {
  const petTypes = [...new Set(pets.map((p) => p.type))];

  // Categories the user has previously completed bookings in
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const pastCategorySet = new Set<string>(
    completedBookings
      .map((b) => services.find((s) => s.id === b.serviceId)?.category)
      .filter((c): c is string => Boolean(c)),
  );

  // Service IDs the user has ever booked
  const everBookedIds = new Set(bookings.map((b) => b.serviceId));

  // Service IDs with an active booking right now (exclude from recommendations)
  const activeStatuses: BookingStatus[] = [
    "pending", "confirmed", "awaiting_downpayment", "payment_submitted", "rescheduled",
  ];
  const activeServiceIds = new Set(
    bookings.filter((b) => activeStatuses.includes(b.status)).map((b) => b.serviceId),
  );

  const scored: RecommendedService[] = services
    .filter((s) => !activeServiceIds.has(s.id))
    .map((service) => {
      let score = 0;
      let reason = "";

      // Pet type match
      const matchingPets = pets.filter((p) =>
        PET_CATEGORY_AFFINITY[p.type]?.includes(service.category),
      );
      if (matchingPets.length > 0) {
        score += 3;
        const names = matchingPets.slice(0, 2).map((p) => p.name).join(" & ");
        reason = `Great for ${names}`;
      }

      // Past booking category match
      if (pastCategorySet.has(service.category)) {
        score += 2;
        if (!reason) reason = "Based on your booking history";
      }

      // Rating bonus
      if (service.rating >= 4.5) {
        score += 2;
        if (!reason) reason = "Highly rated";
      } else if (service.rating >= 4.0) {
        score += 1;
        if (!reason) reason = "Top rated";
      }

      // Never booked before = slight novelty boost
      if (!everBookedIds.has(service.id)) {
        score += 1;
        if (!reason) reason = "New for you";
      }

      return { service, score, reason: reason || "Popular service" };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

export const calculateBookingStats = (bookings: Booking[]) => ({
  total: bookings.length,
  pending: bookings.filter((b) => b.status === "pending").length,
  confirmed: bookings.filter((b) => b.status === "confirmed").length,
  completed: bookings.filter((b) => b.status === "completed").length,
  cancelled: bookings.filter((b) => b.status === "cancelled").length,
  upcoming: getUpcomingBookings(bookings).length,
});