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

const ProviderContext = createContext<ProviderContextType | undefined>(undefined);

export const useProviderContext = () => {
  const ctx = useContext(ProviderContext);
  if (!ctx) throw new Error("useProviderContext must be used within ProviderAppProvider");
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

      // Load profile from users table
      supabase
        .from("users")
        .select("name, email, phone")
        .eq("id", authUser.id)
        .maybeSingle()
        .then(({ data: profile }) => {
          setUser({
            ...EMPTY_USER,
            id: authUser.id,
            name: profile?.name ?? authUser.email ?? "",
            email: profile?.email ?? authUser.email ?? "",
            phone: profile?.phone ?? undefined,
            joinedAt: authUser.created_at ?? new Date().toISOString(),
          });
        })
        .catch(() => {
          setUser({ ...EMPTY_USER, id: authUser.id, email: authUser.email ?? "" });
        });

      // Load policy
      fetchProviderPolicy(authUser.id)
        .then((p) => { if (p) setPolicy(p); })
        .catch(() => {});

      // Load services (scoped to this provider only)
      fetchProviderOwnServices(authUser.id)
        .then((svcs) => setServices(svcs as ProviderService[]))
        .catch(() => {});

      // Load bookings (scoped to this provider only)
      fetchProviderOwnBookings(authUser.id)
        .then((bkgs) => setBookings(bkgs as ProviderBooking[]))
        .catch(() => {});
    });
  }, []);

  const updateUser = (updates: Partial<ProviderUser>) =>
    setUser((prev) => ({ ...prev, ...updates }));

  const savePolicy = async (updated: ProviderPolicy) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error("Not authenticated");
    await upsertProviderPolicy(authUser.id, updated);
    setPolicy(updated);
  };

  // ── Services ─────────────────────────────────────────────────────────────────

  const addService = (
    service: Omit<ProviderService, "id" | "totalBookings" | "rating" | "reviews" | "createdAt">,
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
            prev.map((s) => s.id === tempId ? { ...s, id, createdAt } : s),
          );
        })
        .catch((err) => {
          console.error("[addService] Supabase insert failed:", err);
          // Revert on failure
          setServices((prev) => prev.filter((s) => s.id !== tempId));
        });
    });
  };

  const updateService = (id: string, updates: Partial<ProviderService>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    updateProviderServiceRecord(id, {
      name: updates.name,
      category: updates.category,
      description: updates.description,
      price: updates.price,
      priceUnit: updates.priceUnit,
      duration: updates.duration,
      image: updates.image,
      location: updates.location,
      features: updates.features,
      availability: updates.availability,
      isActive: updates.isActive,
    }).catch(() => {
      // Revert on failure — reload from DB
      supabase.auth.getUser().then(({ data: { user: authUser } }) => {
        if (!authUser) return;
        fetchProviderOwnServices(authUser.id)
          .then((svcs) => setServices(svcs as ProviderService[]))
          .catch(() => {});
      });
    });
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    deleteProviderServiceRecord(id).catch(() => {
      // Revert: reload from DB
      supabase.auth.getUser().then(({ data: { user: authUser } }) => {
        if (!authUser) return;
        fetchProviderOwnServices(authUser.id)
          .then((svcs) => setServices(svcs as ProviderService[]))
          .catch(() => {});
      });
    });
  };

  const toggleServiceActive = (id: string) => {
    const service = services.find((s) => s.id === id);
    if (!service) return;
    const newValue = !service.isActive;
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: newValue } : s)));
    updateProviderServiceRecord(id, { isActive: newValue }).catch(() => {
      setServices((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: !newValue } : s)));
    });
  };

  // ── Bookings ──────────────────────────────────────────────────────────────────

  const setBookingStatus = (
    id: string,
    status: BookingStatus,
    extra?: Partial<ProviderBooking>,
  ) =>
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status, ...extra } : b)),
    );

  const acceptBooking = (id: string, providerNotes?: string) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;

    // Conflict check: is there already a *confirmed* booking on the same date+time?
    const effectiveTime = booking.rescheduleTime ?? booking.time;
    const effectiveDate = booking.rescheduleDate ?? booking.date;
    const conflict = bookings.find(
      (b) =>
        b.id !== id &&
        (b.rescheduleDate ?? b.date) === effectiveDate &&
        (b.rescheduleTime ?? b.time) === effectiveTime &&
        b.status === "confirmed",
    );
    if (conflict) {
      throw new Error(
        `Schedule conflict: "${conflict.petName}" (${conflict.ownerName}) is already confirmed at this time.`,
      );
    }

    setBookingStatus(id, "confirmed", { providerNotes });
    updateProviderBookingStatus(id, "confirmed", { providerNotes }).catch(console.error);
  };

  const rejectBooking = (id: string, providerNotes?: string) => {
    setBookingStatus(id, "cancelled", { providerNotes });
    updateProviderBookingStatus(id, "cancelled", { providerNotes }).catch(console.error);
  };

  const rescheduleBooking = (
    id: string,
    newDate: string,
    newTime: string,
    providerNotes?: string,
  ) => {
    setBookingStatus(id, "rescheduled", {
      rescheduleDate: newDate,
      rescheduleTime: newTime,
      providerNotes,
    });
    updateProviderBookingStatus(id, "rescheduled", {
      providerNotes,
      rescheduleDate: newDate,
      rescheduleTime: newTime,
    }).catch(console.error);
  };

  const completeBooking = (id: string, providerNotes?: string) => {
    setBookingStatus(id, "completed", { providerNotes });
    const booking = bookings.find((b) => b.id === id);
    if (booking) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === booking.serviceId
            ? { ...s, totalBookings: s.totalBookings + 1 }
            : s,
        ),
      );
    }
    updateProviderBookingStatus(id, "completed", { providerNotes }).catch(console.error);
  };

  const updateBookingNotes = (id: string, providerNotes: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, providerNotes } : b)),
    );
    updateProviderBookingStatus(id, bookings.find((b) => b.id === id)?.status ?? "pending", {
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
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
};
