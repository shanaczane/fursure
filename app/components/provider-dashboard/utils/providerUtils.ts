import type { ProviderBooking, DashboardStats, ProviderService } from "../types";

// ───────────────── Dashboard Stats ─────────────────

export const getProviderDashboardStats = (
  bookings: ProviderBooking[],
  services: ProviderService[]
): DashboardStats => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const completed = bookings.filter((b) => b.status === "completed");

  const monthlyEarnings = completed
    .filter((b) => new Date(b.createdAt) >= startOfMonth)
    .reduce((sum, b) => sum + (b.price ?? 0), 0);

  const totalEarnings = completed.reduce((sum, b) => sum + (b.price ?? 0), 0);

  const ratings = services.filter((s) => (s.rating ?? 0) > 0).map((s) => s.rating ?? 0);

  const averageRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

  return {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.status === "pending").length,
    awaitingDownPaymentBookings: bookings.filter(
      (b) => b.status === "awaiting_downpayment"
    ).length,
    paymentSubmittedBookings: bookings.filter(
      (b) => b.status === "payment_submitted"
    ).length,
    confirmedBookings: bookings.filter((b) => b.status === "confirmed").length,
    completedBookings: completed.length,
    cancelledBookings: bookings.filter((b) => b.status === "cancelled").length,
    declinedBookings: bookings.filter((b) => b.status === "declined").length,
    totalServices: services.length,
    activeServices: services.filter((s) => s.isActive).length,
    totalEarnings,
    monthlyEarnings,
    averageRating: Math.round(averageRating * 10) / 10,
  };
};

// ───────────────── Upcoming Bookings ─────────────────

export const getUpcomingBookings = (
  bookings: ProviderBooking[]
): ProviderBooking[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const UPCOMING_STATUSES = new Set([
    "pending",
    "awaiting_downpayment",
    "payment_submitted",
    "confirmed",
    "rescheduled",
  ]);

  return bookings
    .filter((b) => {
      if (!UPCOMING_STATUSES.has(b.status)) return false;

      const bookingDate = new Date(
        (b.rescheduleDate || b.date) + "T00:00:00"
      );

      return bookingDate >= today;
    })
    .sort((a, b) => {
      const dateA = new Date(
        (a.rescheduleDate || a.date) + "T" + (a.rescheduleTime || a.time)
      );
      const dateB = new Date(
        (b.rescheduleDate || b.date) + "T" + (b.rescheduleTime || b.time)
      );
      return dateA.getTime() - dateB.getTime();
    });
};

// ───────────────── Past Bookings ─────────────────

export const getPastBookings = (
  bookings: ProviderBooking[]
): ProviderBooking[] => {
  return bookings
    .filter((b) => b.status === "completed" || b.status === "cancelled")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
};

// ───────────────── Date Formatting ─────────────────

export const formatBookingDateTime = (date: string, time: string): string => {
  const d = new Date(date + "T00:00:00");

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };

  const timeFormatted = formatTime(time);
  return `${d.toLocaleDateString("en-US", options)} at ${timeFormatted}`;
};

export const formatTime = (time: string): string => {
  const [hourStr, min] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${min} ${ampm}`;
};

// ───────────────── Relative Date ─────────────────

export const formatRelativeDate = (date: string): string => {
  const d = new Date(date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  d.setHours(0, 0, 0, 0);

  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === tomorrow.getTime()) return "Tomorrow";

  const diff = Math.ceil(
    (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diff > 0 && diff <= 7) return `In ${diff} day${diff === 1 ? "" : "s"}`;

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ───────────────── Currency ─────────────────

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);

// ───────────────── Calendar Helpers ─────────────────

export const getBookingsForDate = (
  bookings: ProviderBooking[],
  date: string
): ProviderBooking[] =>
  bookings.filter((b) => {
    const effectiveDate = b.rescheduleDate || b.date;
    return effectiveDate === date && b.status !== "cancelled";
  });

export const generateCalendarDays = (
  year: number,
  month: number
): (Date | null)[] => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (Date | null)[] = [];

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));

  return days;
};

// ───────────────── Booking Filters ─────────────────

export const filterAndSortBookings = (
  bookings: ProviderBooking[],
  filters: {
    status: string;
    dateRange: string;
    serviceId: string;
    searchQuery: string;
  }
): ProviderBooking[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return bookings
    .filter((b) => {
      // Group awaiting_downpayment and payment_submitted under "pending" tab
      if (filters.status !== "all") {
        if (filters.status === "pending") {
          if (
            b.status !== "pending" &&
            b.status !== "awaiting_downpayment" &&
            b.status !== "payment_submitted"
          )
            return false;
        } else {
          if (b.status !== filters.status) return false;
        }
      }

      if (filters.serviceId !== "all" && b.serviceId !== filters.serviceId)
        return false;

      if (filters.dateRange !== "all") {
        const d = new Date(b.date + "T00:00:00");

        if (
          filters.dateRange === "today" &&
          d.toDateString() !== today.toDateString()
        )
          return false;

        if (filters.dateRange === "week") {
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);
          if (d < today || d > weekEnd) return false;
        }

        if (filters.dateRange === "month") {
          const monthEnd = new Date(today);
          monthEnd.setMonth(monthEnd.getMonth() + 1);
          if (d < today || d > monthEnd) return false;
        }
      }

      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        if (
          !b.ownerName.toLowerCase().includes(q) &&
          !b.petName.toLowerCase().includes(q) &&
          !b.serviceName.toLowerCase().includes(q)
        )
          return false;
      }

      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
};