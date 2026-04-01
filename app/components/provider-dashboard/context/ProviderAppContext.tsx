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
  ProviderPolicy,
} from "../types";
import { DEFAULT_POLICY } from "../types";
import { supabase } from "@/app/lib/supabase";
import {
  fetchProviderPolicy,
  upsertProviderPolicy,
  fetchProviderOwnServices,
  insertProviderServiceRecord,
  updateProviderServiceRecord,
  deleteProviderServiceRecord,
  fetchProviderOwnBookings,
  updateProviderBookingStatus,
} from "@/app/lib/api";

interface ProviderContextType {
  user: ProviderUser;
  services: ProviderService[];
  bookings: ProviderBooking[];
  policy: ProviderPolicy;
  updateUser: (updates: Partial<ProviderUser>) => void;
  savePolicy: (policy: ProviderPolicy) => Promise<void>;

  addService: (
    service: Omit<
      ProviderService,
      "id" | "totalBookings" | "rating" | "reviews" | "createdAt"
    >
  ) => void;

  updateService: (id: string, updates: Partial<ProviderService>) => void;
  deleteService: (id: string) => void;
  toggleServiceActive: (id: string) => void;

  acceptBooking: (id: string, providerNotes?: string) => void;
  rejectBooking: (id: string, providerNotes?: string) => void;

  rescheduleBooking: (
    id: string,
    newDate: string,
    newTime: string,
    providerNotes?: string
  ) => Promise<void>;

  completeBooking: (id: string, providerNotes?: string) => void;
  updateBookingNotes: (id: string, providerNotes: string) => void;

  updateBooking: (id: string, updates: Partial<ProviderBooking>) => void;
}

const EMPTY_USER: ProviderUser = {
  id: "",
  name: "",
  email: "",
  businessName: "",
  isVerified: false,
  rating: 0,
  totalReviews: 0,
  totalEarnings: 0,
  joinedAt: new Date().toISOString(),
};

const ProviderContext = createContext<ProviderContextType | undefined>(
  undefined
);

export const useProviderContext = () => {
  const ctx = useContext(ProviderContext);
  if (!ctx)
    throw new Error(
      "useProviderContext must be used within ProviderAppProvider"
    );
  return ctx;
};

export const ProviderAppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ProviderUser>(EMPTY_USER);
  const [services, setServices] = useState<ProviderService[]>([]);
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [policy, setPolicy] = useState<ProviderPolicy>(DEFAULT_POLICY);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!authUser) return;

      supabase
        .from("users")
        .select("name, email, phone")
        .eq("id", authUser.id)
        .maybeSingle()
        .then(
          ({ data: profile }) => {
            setUser({
              ...EMPTY_USER,
              id: authUser.id,
              name: profile?.name ?? authUser.email ?? "",
              email: profile?.email ?? authUser.email ?? "",
              phone: profile?.phone ?? undefined,
              joinedAt: authUser.created_at ?? new Date().toISOString(),
            });
          },
          () => {
            setUser({
              ...EMPTY_USER,
              id: authUser.id,
              email: authUser.email ?? "",
            });
          }
        );

      fetchProviderPolicy(authUser.id)
        .then((p) => {
          if (p) setPolicy(p as ProviderPolicy);
        })
        .catch(() => {});

      fetchProviderOwnServices(authUser.id)
        .then((svcs) => setServices(svcs as ProviderService[]))
        .catch(() => {});

      fetchProviderOwnBookings(authUser.id)
        .then((bkgs) => setBookings(bkgs as ProviderBooking[]))
        .catch(() => {});
    });
  }, []);

  // Add this useEffect inside ProviderAppProvider, after the existing useEffect
  useEffect(() => {
    if (bookings.length === 0) return;

    const expireDownPayments = async () => {
      const now = Date.now();

      const expiredIds = bookings
        .filter((b) => {
          if (b.status !== "awaiting_downpayment") return false;
          if (b.downPaymentPaid) return false;
          const deadlineMs = (b.downPaymentDeadlineHours ?? 24) * 60 * 60 * 1000;
          return now - new Date(b.createdAt).getTime() > deadlineMs;
        })
        .map((b) => b.id);

      if (expiredIds.length === 0) return;

      // Update DB and local state for each expired booking
      await Promise.all(
        expiredIds.map((id) =>
          updateProviderBookingStatus(id, "declined").catch(console.error)
        )
      );

      setBookings((prev) =>
        prev.map((b) =>
          expiredIds.includes(b.id) ? { ...b, status: "declined" } : b
        )
      );
    };

    expireDownPayments();

  // Re-check every 5 minutes while the provider is on the page
  const interval = setInterval(expireDownPayments, 5 * 60 * 1000);
  return () => clearInterval(interval);
  }, [bookings]);

  const updateUser = (updates: Partial<ProviderUser>) =>
    setUser((prev) => ({ ...prev, ...updates }));

  const savePolicy = async (updated: ProviderPolicy): Promise<void> => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) throw new Error("Not authenticated");

    await upsertProviderPolicy(authUser.id, updated);
    setPolicy(updated);
  };

  // SERVICES

  const addService = (
    service: Omit<
      ProviderService,
      "id" | "totalBookings" | "rating" | "reviews" | "createdAt"
    >
  ) => {
    const tempId = `tmp_${Date.now()}`;
    const now = new Date().toISOString();

    setServices((prev) => [
      ...prev,
      { ...service, id: tempId, totalBookings: 0, rating: 0, reviews: 0, createdAt: now },
    ]);

    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!authUser) return;

      insertProviderServiceRecord(authUser.id, service)
        .then(({ id, createdAt }) => {
          setServices((prev) =>
            prev.map((s) => (s.id === tempId ? { ...s, id, createdAt } : s))
          );
        })
        .catch(() => {
          setServices((prev) => prev.filter((s) => s.id !== tempId));
        });
    });
  };

  const updateService = (id: string, updates: Partial<ProviderService>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );

    updateProviderServiceRecord(id, updates).catch(() => {});
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    deleteProviderServiceRecord(id).catch(() => {});
  };

  const toggleServiceActive = (id: string) => {
    const service = services.find((s) => s.id === id);
    if (!service) return;

    const newValue = !service.isActive;

    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: newValue } : s))
    );

    updateProviderServiceRecord(id, { isActive: newValue }).catch(() => {});
  };

  // BOOKINGS

  const setBookingStatus = (
    id: string,
    status: BookingStatus,
    extra?: Partial<ProviderBooking>
  ) =>
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status, ...extra } : b))
    );

  const updateBooking = (id: string, updates: Partial<ProviderBooking>) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );

    const current = bookings.find((b) => b.id === id);
    const status = updates.status ?? current?.status ?? "pending";

    updateProviderBookingStatus(id, status, {
      providerNotes: updates.providerNotes,
      rescheduleDate: updates.rescheduleDate,
      rescheduleTime: updates.rescheduleTime,
      editRequestStatus: updates.editRequestStatus,
      cancelRequestStatus: updates.cancelRequestStatus,
    }).catch(console.error);
  };

  const acceptBooking = (id: string, providerNotes?: string) => {
    setBookingStatus(id, "confirmed", { providerNotes });

    updateProviderBookingStatus(id, "confirmed", {
      providerNotes,
    }).catch(console.error);
  };

  const rejectBooking = (id: string, providerNotes?: string) => {
    setBookingStatus(id, "declined", { providerNotes });

    updateProviderBookingStatus(id, "declined", {
      providerNotes,
    }).catch(console.error);
  };

  // UPDATED RESCHEDULE FUNCTION

  const rescheduleBooking = async (
    bookingId: string,
    date: string,
    time: string,
    notes?: string
  ) => {
    await updateProviderBookingStatus(bookingId, "rescheduled", {
      rescheduleDate: date,
      rescheduleTime: time,
      providerNotes: notes,
    });

    updateBooking(bookingId, {
      status: "rescheduled",
      rescheduleDate: date,
      rescheduleTime: time,
      ...(notes ? { providerNotes: notes } : {}),
    });
  };

  const completeBooking = (id: string, providerNotes?: string) => {
    setBookingStatus(id, "completed", { providerNotes });

    updateProviderBookingStatus(id, "completed", {
      providerNotes,
    }).catch(console.error);
  };

  const updateBookingNotes = (id: string, providerNotes: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, providerNotes } : b))
    );

    const current = bookings.find((b) => b.id === id);

    updateProviderBookingStatus(id, current?.status ?? "pending", {
      providerNotes,
    }).catch(console.error);
  };

  return (
    <ProviderContext.Provider
      value={{
        user,
        services,
        bookings,
        policy,
        updateUser,
        savePolicy,
        addService,
        updateService,
        deleteService,
        toggleServiceActive,
        acceptBooking,
        rejectBooking,
        rescheduleBooking,
        completeBooking,
        updateBookingNotes,
        updateBooking,
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
};