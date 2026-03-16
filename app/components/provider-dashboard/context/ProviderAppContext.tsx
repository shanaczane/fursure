"use client";

import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import type {
  ProviderService,
  ProviderBooking,
  ProviderUser,
  BookingStatus,
} from "../types";
import {
  MOCK_PROVIDER_SERVICES,
  MOCK_PROVIDER_BOOKINGS,
  MOCK_PROVIDER_USER,
} from "../data/mockData";

interface ProviderContextType {
  user: ProviderUser;
  services: ProviderService[];
  bookings: ProviderBooking[];
  updateUser: (updates: Partial<ProviderUser>) => void;
  // Services
  addService: (service: Omit<ProviderService, "id" | "totalBookings" | "rating" | "reviews" | "createdAt">) => void;
  updateService: (id: string, updates: Partial<ProviderService>) => void;
  deleteService: (id: string) => void;
  toggleServiceActive: (id: string) => void;
  // Bookings
  acceptBooking: (id: string, providerNotes?: string) => void;
  rejectBooking: (id: string, providerNotes?: string) => void;
  rescheduleBooking: (id: string, newDate: string, newTime: string, providerNotes?: string) => void;
  completeBooking: (id: string, providerNotes?: string) => void;
  updateBookingNotes: (id: string, providerNotes: string) => void;
}

const ProviderContext = createContext<ProviderContextType | undefined>(undefined);

export const useProviderContext = () => {
  const ctx = useContext(ProviderContext);
  if (!ctx) throw new Error("useProviderContext must be used within ProviderAppProvider");
  return ctx;
};

const safeGet = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
};
const safeSet = (key: string, val: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, val);
};

export const ProviderAppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ProviderUser>(MOCK_PROVIDER_USER);
  const [services, setServices] = useState<ProviderService[]>(MOCK_PROVIDER_SERVICES);
  const [bookings, setBookings] = useState<ProviderBooking[]>(MOCK_PROVIDER_BOOKINGS);

  useEffect(() => {
    const savedUser = safeGet("provider_user");
    if (savedUser) setUser(JSON.parse(savedUser));
    const savedServices = safeGet("provider_services");
    if (savedServices) setServices(JSON.parse(savedServices));
    const savedBookings = safeGet("provider_bookings");
    if (savedBookings) setBookings(JSON.parse(savedBookings));
  }, []);

  useEffect(() => { safeSet("provider_user", JSON.stringify(user)); }, [user]);
  useEffect(() => { safeSet("provider_services", JSON.stringify(services)); }, [services]);
  useEffect(() => { safeSet("provider_bookings", JSON.stringify(bookings)); }, [bookings]);

  const updateUser = (updates: Partial<ProviderUser>) =>
    setUser((prev) => ({ ...prev, ...updates }));

  const addService = (service: Omit<ProviderService, "id" | "totalBookings" | "rating" | "reviews" | "createdAt">) =>
    setServices((prev) => [
      ...prev,
      {
        ...service,
        id: String(Date.now()),
        totalBookings: 0,
        rating: 0,
        reviews: 0,
        createdAt: new Date().toISOString(),
      },
    ]);

  const updateService = (id: string, updates: Partial<ProviderService>) =>
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );

  const deleteService = (id: string) =>
    setServices((prev) => prev.filter((s) => s.id !== id));

  const toggleServiceActive = (id: string) =>
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );

  const setBookingStatus = (id: string, status: BookingStatus, extra?: Partial<ProviderBooking>) =>
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status, ...extra } : b))
    );

  const acceptBooking = (id: string, providerNotes?: string) =>
    setBookingStatus(id, "confirmed", { providerNotes });

  const rejectBooking = (id: string, providerNotes?: string) =>
    setBookingStatus(id, "cancelled", { providerNotes });

  const rescheduleBooking = (id: string, newDate: string, newTime: string, providerNotes?: string) =>
    setBookingStatus(id, "rescheduled", {
      rescheduleDate: newDate,
      rescheduleTime: newTime,
      providerNotes,
    });

  const completeBooking = (id: string, providerNotes?: string) => {
    setBookingStatus(id, "completed", { providerNotes });
    // increment service totalBookings
    const booking = bookings.find((b) => b.id === id);
    if (booking) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === booking.serviceId
            ? { ...s, totalBookings: s.totalBookings + 1 }
            : s
        )
      );
    }
  };

  const updateBookingNotes = (id: string, providerNotes: string) =>
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, providerNotes } : b))
    );

  return (
    <ProviderContext.Provider
      value={{
        user,
        services,
        bookings,
        updateUser,
        addService,
        updateService,
        deleteService,
        toggleServiceActive,
        acceptBooking,
        rejectBooking,
        rescheduleBooking,
        completeBooking,
        updateBookingNotes,
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
};