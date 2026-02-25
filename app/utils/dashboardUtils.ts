import {
  type Service,
  type Booking,
  type ServiceFilters,
  type BookingStatus,
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
    if (parseFloat(service.distance) > filters.maxDistance) return false;
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
  sortBy: "rating" | "price" | "distance",
): Service[] => {
  const sorted = [...services];
  switch (sortBy) {
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "price":
      return sorted.sort((a, b) => a.price - b.price);
    case "distance":
      return sorted.sort(
        (a, b) => parseFloat(a.distance) - parseFloat(b.distance),
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
  return bookings
    .filter((b) => {
      if (b.status !== "pending" && b.status !== "confirmed") return false;
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
  `$${price} ${unit}`;

export const calculateBookingStats = (bookings: Booking[]) => ({
  total: bookings.length,
  pending: bookings.filter((b) => b.status === "pending").length,
  confirmed: bookings.filter((b) => b.status === "confirmed").length,
  completed: bookings.filter((b) => b.status === "completed").length,
  cancelled: bookings.filter((b) => b.status === "cancelled").length,
  upcoming: getUpcomingBookings(bookings).length,
});
