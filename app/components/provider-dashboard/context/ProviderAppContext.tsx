"use client";

import {
  useState,
  useMemo,
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
  ProviderNotification,
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
  isLoading: boolean;
  notifications: ProviderNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
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
  confirmPaymentReceived: (id: string) => Promise<void>;
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
  if (!ctx)
    throw new Error("useProviderContext must be used within ProviderAppProvider");
  return ctx;
};

export const ProviderAppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ProviderUser>(EMPTY_USER);
  const [services, setServices] = useState<ProviderService[]>([]);
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [policy, setPolicy] = useState<ProviderPolicy>(DEFAULT_POLICY);
  const [isLoading, setIsLoading] = useState(true);
  const [providerDbId, setProviderDbId] = useState<string | null>(null);
  const [seenIds, setSeenIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem("fursure_provider_seen_notifs");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const notifications = useMemo<ProviderNotification[]>(() => {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 48);
    const notifs: ProviderNotification[] = [];

    for (const b of bookings) {
      const createdAt = b.createdAt;
      const isRecent = createdAt && new Date(createdAt) > cutoff;

      // New booking request
      if (b.status === "pending" && isRecent)
        notifs.push({ id: `new-${b.id}`, type: "new_booking", title: "New Booking Request", description: `${b.ownerName} booked ${b.serviceName}`, createdAt, read: seenIds.has(`new-${b.id}`) });

      // Payment submitted
      if (b.status === "payment_submitted" && isRecent)
        notifs.push({ id: `pay-${b.id}`, type: "payment_submitted", title: "Payment Submitted", description: `${b.ownerName} submitted a down payment for ${b.serviceName}`, createdAt, read: seenIds.has(`pay-${b.id}`) });

      // Down payment overdue
      if (b.status === "awaiting_downpayment" && !b.downPaymentPaid) {
        const deadlineMs = (b.downPaymentDeadlineHours ?? 24) * 60 * 60 * 1000;
        if (Date.now() - new Date(createdAt).getTime() > deadlineMs)
          notifs.push({ id: `overdue-${b.id}`, type: "payment_overdue", title: "Down Payment Overdue", description: `${b.ownerName} hasn't paid the deposit for ${b.serviceName}`, createdAt, read: seenIds.has(`overdue-${b.id}`) });
      }

      // Edit request pending
      if (b.editRequestStatus === "pending")
        notifs.push({ id: `edit-${b.id}`, type: "edit_request", title: "Edit Request", description: `${b.ownerName} wants to edit their ${b.serviceName} booking`, createdAt, read: seenIds.has(`edit-${b.id}`) });

      // Cancel request pending
      if (b.cancelRequestStatus === "pending")
        notifs.push({ id: `cancel-${b.id}`, type: "cancel_request", title: "Cancellation Request", description: `${b.ownerName} wants to cancel their ${b.serviceName} booking`, createdAt, read: seenIds.has(`cancel-${b.id}`) });

      // Owner accepted reschedule
      if (b.rescheduleStatus === "confirmed" && isRecent)
        notifs.push({ id: `rsa-${b.id}`, type: "reschedule_accepted", title: "Reschedule Accepted", description: `${b.ownerName} accepted the new schedule for ${b.serviceName}`, createdAt, read: seenIds.has(`rsa-${b.id}`) });

      // Owner declined reschedule
      if (b.rescheduleStatus === "declined" && isRecent)
        notifs.push({ id: `rsd-${b.id}`, type: "reschedule_declined", title: "Reschedule Declined", description: `${b.ownerName} declined the new schedule for ${b.serviceName}`, createdAt, read: seenIds.has(`rsd-${b.id}`) });

      // New review
      if (b.status === "completed" && typeof b.rating === "number" && b.rating > 0 && b.reviewDate && new Date(b.reviewDate) > cutoff)
        notifs.push({ id: `rev-${b.id}`, type: "new_review", title: "New Review", description: `${b.ownerName} rated your service ${b.rating} star${b.rating !== 1 ? "s" : ""}`, createdAt: b.reviewDate, read: seenIds.has(`rev-${b.id}`) });
    }

    return notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, seenIds]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAsRead = (id: string) => {
    setSeenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem("fursure_provider_seen_notifs", JSON.stringify([...next]));
      return next;
    });
  };

  const markAllRead = () => {
    setSeenIds(() => {
      const next = new Set(notifications.map((n) => n.id));
      localStorage.setItem("fursure_provider_seen_notifs", JSON.stringify([...next]));
      return next;
    });
  };

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (!authUser) { setIsLoading(false); return; }

      try {
        const [{ data: profile }, { data: provRow }] = await Promise.all([
          supabase.from("users").select("name, email, phone").eq("id", authUser.id).maybeSingle(),
          supabase.from("providers").select("id, is_verified, rating, reviews").eq("user_id", authUser.id).maybeSingle(),
        ]);

        // Store the providers.id (not user_id) for the realtime filter
        if (provRow?.id) setProviderDbId(String(provRow.id));

        setUser({
          ...EMPTY_USER,
          id: authUser.id,
          name: profile?.name ?? authUser.user_metadata?.firstName
            ? `${authUser.user_metadata.firstName} ${authUser.user_metadata.lastName ?? ""}`.trim()
            : authUser.email ?? "",
          email: profile?.email ?? authUser.email ?? "",
          phone: profile?.phone ?? undefined,
          joinedAt: authUser.created_at ?? new Date().toISOString(),
          isVerified: provRow?.is_verified ?? false,
          rating: provRow?.rating ?? 0,
          totalReviews: provRow?.reviews ?? 0,
        });

        await Promise.all([
          fetchProviderPolicy(authUser.id).then((p) => { if (p) setPolicy(p as ProviderPolicy); }).catch(() => {}),
          fetchProviderOwnServices(authUser.id).then((svcs) => setServices(svcs as ProviderService[])).catch(() => {}),
          fetchProviderOwnBookings(authUser.id).then((bkgs) => setBookings(bkgs as ProviderBooking[])).catch(() => {}),
        ]);
      } catch {
        setUser({ ...EMPTY_USER, id: authUser.id, email: authUser.email ?? "" });
      } finally {
        setIsLoading(false);
      }
    });
  }, []);

  // ── Real-time subscription ────────────────────────────────────────────────
  // Listens for any UPDATE on bookings rows belonging to this provider.
  // This picks up review fields (rating, review_comment, review_date) written
  // by the owner, as well as any other field changes, and patches local state.
  useEffect(() => {
    if (!providerDbId) return;

    const channel = supabase
      .channel(`provider-bookings-${providerDbId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `provider_id=eq.${providerDbId}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          setBookings((prev) =>
            prev.map((b) =>
              b.id === String(row.id)
                ? {
                    ...b,
                    status: (row.status as BookingStatus) ?? b.status,
                    notes: (row.notes as string | undefined) ?? b.notes,
                    providerNotes: (row.provider_notes as string | undefined) ?? b.providerNotes,
                    rescheduleDate: (row.reschedule_date as string | undefined) ?? b.rescheduleDate,
                    rescheduleTime: (row.reschedule_time as string | undefined) ?? b.rescheduleTime,
                    rescheduleStatus: (row.reschedule_status as ProviderBooking["rescheduleStatus"]) ?? b.rescheduleStatus,
                    downPaymentPaid: (row.down_payment_paid as boolean) ?? b.downPaymentPaid,
                    downPaymentPaidAt: (row.down_payment_paid_at as string | undefined) ?? b.downPaymentPaidAt,
                    downPaymentConfirmed: (row.down_payment_confirmed as boolean) ?? b.downPaymentConfirmed,
                    downPaymentConfirmedAt: (row.down_payment_confirmed_at as string | undefined) ?? b.downPaymentConfirmedAt,
                    editRequestStatus: (row.edit_request_status as ProviderBooking["editRequestStatus"]) ?? b.editRequestStatus,
                    cancelRequestStatus: (row.cancel_request_status as ProviderBooking["cancelRequestStatus"]) ?? b.cancelRequestStatus,
                    // ── Review fields written by the owner ──────────────────
                    rating: row.rating !== undefined && row.rating !== null
                      ? (row.rating as number)
                      : b.rating,
                    reviewComment: row.review_comment !== undefined && row.review_comment !== null
                      ? (row.review_comment as string)
                      : b.reviewComment,
                    reviewDate: row.review_date !== undefined && row.review_date !== null
                      ? (row.review_date as string)
                      : b.reviewDate,
                  }
                : b
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [providerDbId]);

  // ── Auto-expire unpaid down payments ──────────────────────────────────────
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
    const interval = setInterval(expireDownPayments, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [bookings]);

  const updateUser = (updates: Partial<ProviderUser>) =>
    setUser((prev) => ({ ...prev, ...updates }));

  const savePolicy = async (updated: ProviderPolicy): Promise<void> => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error("Not authenticated");
    await upsertProviderPolicy(authUser.id, updated);
    setPolicy(updated);
  };

  // ── Services ──────────────────────────────────────────────────────────────

  const addService = (
    service: Omit<ProviderService, "id" | "totalBookings" | "rating" | "reviews" | "createdAt">
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
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
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

  // ── Bookings ──────────────────────────────────────────────────────────────

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

    const paymentUpdates: Record<string, unknown> = {};
    if (updates.downPaymentPaid !== undefined)
      paymentUpdates.down_payment_paid = updates.downPaymentPaid;
    if (updates.downPaymentConfirmed !== undefined)
      paymentUpdates.down_payment_confirmed = updates.downPaymentConfirmed;
    if (updates.downPaymentConfirmedAt !== undefined)
      paymentUpdates.down_payment_confirmed_at = updates.downPaymentConfirmedAt;

    if (Object.keys(paymentUpdates).length > 0) {
      supabase
        .from("bookings")
        .update(paymentUpdates)
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.error("Payment update failed:", error);
        });
    }
  };

  const acceptBooking = (id: string, providerNotes?: string) => {
    setBookingStatus(id, "confirmed", { providerNotes });
    updateProviderBookingStatus(id, "confirmed", { providerNotes }).catch(console.error);
  };

  const rejectBooking = (id: string, providerNotes?: string) => {
    setBookingStatus(id, "declined", { providerNotes });
    updateProviderBookingStatus(id, "declined", { providerNotes }).catch(console.error);
  };

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
    updateProviderBookingStatus(id, "completed", { providerNotes }).catch(console.error);
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

  const confirmPaymentReceived = async (id: string): Promise<void> => {
    const now = new Date().toISOString();

    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status: "confirmed" as BookingStatus,
              downPaymentPaid: true,
              downPaymentConfirmed: true,
              downPaymentConfirmedAt: now,
            }
          : b
      )
    );

    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          status: "confirmed",
          down_payment_paid: true,
          down_payment_confirmed: true,
          down_payment_confirmed_at: now,
        })
        .eq("id", id);

      if (error) {
        console.error("Supabase error code:", error.code);
        console.error("Supabase error message:", error.message);
        console.error("Supabase error details:", error.details);
        console.error("Supabase error hint:", error.hint);
        throw error;
      }
    } catch (err) {
      console.error("confirmPaymentReceived failed:", JSON.stringify(err, null, 2));

      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status: "payment_submitted" as BookingStatus,
                downPaymentPaid: false,
                downPaymentConfirmed: false,
                downPaymentConfirmedAt: undefined,
              }
            : b
        )
      );

      throw err;
    }
  };

  return (
    <ProviderContext.Provider
      value={{
        user,
        services,
        bookings,
        policy,
        isLoading,
        notifications,
        unreadCount,
        markAsRead,
        markAllRead,
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
        confirmPaymentReceived,
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
};