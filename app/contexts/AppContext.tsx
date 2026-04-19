"use client";

import {
  useState,
  useMemo,
  createContext,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { type Service, type Booking, type Pet, type User, type VaccinationReminder, type OwnerNotification } from "@/app/types";
import {
  getCurrentUser,
  upsertUserProfile,
  fetchUserPets,
  insertPet,
  updatePetRecord,
  deletePetRecord,
  fetchUserBookings,
  insertBooking,
  updateBookingRecord,
  deleteBookingRecord,
  fetchServices,
  fetchAllOwnerVaccinations,
} from "@/app/lib/api";

interface AppContextType {
  user: User;
  services: Service[];
  bookings: Booking[];
  pets: Pet[];
  vaccinationReminders: VaccinationReminder[];
  isLoading: boolean;
  notifications: OwnerNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  addBooking: (booking: Omit<Booking, "id">) => Promise<void>;
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  addPet: (pet: Omit<Pet, "id">) => Promise<void>;
  updatePet: (id: string, updates: Partial<Pet>) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
  refreshReminders: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

const DEFAULT_USER: User = {
  id: "",
  name: "",
  email: "",
  role: "owner" as const,
  avatar: "👤",
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [vaccinationReminders, setVaccinationReminders] = useState<VaccinationReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [seenIds, setSeenIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem("fursure_owner_seen_notifs");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const notifications = useMemo<OwnerNotification[]>(() => {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 48);
    const notifs: OwnerNotification[] = [];
    const now = new Date().toISOString();

    for (const b of bookings) {
      const createdAt = b.createdAt ?? now;
      const isRecent = new Date(createdAt) > cutoff;

      if (b.status === "confirmed" && isRecent)
        notifs.push({ id: `confirmed-${b.id}`, type: "booking_confirmed", title: "Booking Confirmed", description: `${b.providerName} confirmed your ${b.serviceName} booking`, createdAt, read: seenIds.has(`confirmed-${b.id}`) });

      if (b.status === "declined" && isRecent)
        notifs.push({ id: `declined-${b.id}`, type: "booking_declined", title: "Booking Declined", description: `${b.providerName} declined your ${b.serviceName} booking`, createdAt, read: seenIds.has(`declined-${b.id}`) });

      if (b.status === "awaiting_downpayment" && !b.downPaymentPaid)
        notifs.push({ id: `pay-${b.id}`, type: "payment_required", title: "Down Payment Required", description: `Pay the deposit for your ${b.serviceName} booking to confirm it`, createdAt, read: seenIds.has(`pay-${b.id}`) });

      if (b.status === "rescheduled" && b.rescheduleStatus === "pending")
        notifs.push({ id: `resched-${b.id}`, type: "reschedule_proposal", title: "Reschedule Proposal", description: `${b.providerName} proposed a new time for ${b.serviceName}`, createdAt, read: seenIds.has(`resched-${b.id}`) });

      if (b.status === "completed" && !b.rating)
        notifs.push({ id: `review-${b.id}`, type: "review_pending", title: "Leave a Review", description: `How was your ${b.serviceName} with ${b.providerName}?`, createdAt, read: seenIds.has(`review-${b.id}`) });

      if (b.editRequestStatus === "approved" && isRecent)
        notifs.push({ id: `editok-${b.id}`, type: "edit_approved", title: "Edit Approved", description: `Your edit request for ${b.serviceName} was approved`, createdAt, read: seenIds.has(`editok-${b.id}`) });

      if (b.cancelRequestStatus === "approved" && isRecent)
        notifs.push({ id: `cancelok-${b.id}`, type: "cancel_approved", title: "Cancellation Approved", description: `Your cancellation for ${b.serviceName} was approved`, createdAt, read: seenIds.has(`cancelok-${b.id}`) });
    }

    for (const r of vaccinationReminders) {
      const id = `vax-${r.petId}-${r.vaccineName}`;
      if (r.daysUntilDue < 0)
        notifs.push({ id, type: "vaccine_overdue", title: "Vaccine Overdue", description: `${r.vaccineName} for ${r.petName} is overdue by ${Math.abs(r.daysUntilDue)} day${Math.abs(r.daysUntilDue) !== 1 ? "s" : ""}`, createdAt: now, read: seenIds.has(id) });
      else if (r.daysUntilDue <= 7)
        notifs.push({ id, type: "vaccine_due", title: "Vaccine Due Soon", description: `${r.vaccineName} for ${r.petName} is due in ${r.daysUntilDue === 0 ? "today" : `${r.daysUntilDue} day${r.daysUntilDue !== 1 ? "s" : ""}`}`, createdAt: now, read: seenIds.has(id) });
    }

    return notifs.sort((a, b) => {
      // Actionable types always float to top
      const priority = (t: OwnerNotification["type"]) =>
        ["payment_required", "reschedule_proposal", "vaccine_overdue"].includes(t) ? 0 : 1;
      if (priority(a.type) !== priority(b.type)) return priority(a.type) - priority(b.type);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [bookings, vaccinationReminders, seenIds]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAsRead = (id: string) => {
    setSeenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem("fursure_owner_seen_notifs", JSON.stringify([...next]));
      return next;
    });
  };

  const markAllRead = () => {
    setSeenIds(() => {
      const next = new Set(notifications.map((n) => n.id));
      localStorage.setItem("fursure_owner_seen_notifs", JSON.stringify([...next]));
      return next;
    });
  };

  // Load all data from Supabase after mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [currentUser, allServices] = await Promise.all([
          getCurrentUser(),
          fetchServices(),
        ]);

        if (currentUser) {
          setUser(currentUser);
          const [userPets, userBookings, reminders] = await Promise.all([
            fetchUserPets(currentUser.id),
            fetchUserBookings(currentUser.id),
            fetchAllOwnerVaccinations(currentUser.id),
          ]);
          setPets(userPets);
          setBookings(userBookings);
          setVaccinationReminders(reminders);
        }

        setServices(allServices);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const updateUser = async (updates: Partial<User>) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    if (user.id) {
      await upsertUserProfile(user.id, {
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        avatar: updated.avatar,
      });
    }
  };

  const addBooking = async (booking: Omit<Booking, "id">) => {
    if (!user.id) return;
    const created = await insertBooking(user.id, booking);
    setBookings((prev) => [created, ...prev]);
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    await updateBookingRecord(id, updates);
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    );
  };

  const cancelBooking = async (id: string) => {
    await updateBookingRecord(id, { status: "cancelled" });
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
    );
  };

  const deleteBooking = async (id: string) => {
    await deleteBookingRecord(id);
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  const addPet = async (pet: Omit<Pet, "id">) => {
    if (!user.id) return;
    const created = await insertPet(user.id, pet);
    setPets((prev) => [...prev, created]);
  };

  const updatePet = async (id: string, updates: Partial<Pet>) => {
    setPets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
    await updatePetRecord(id, updates);
  };

  const deletePet = async (id: string) => {
    await deletePetRecord(id);
    setPets((prev) => prev.filter((p) => p.id !== id));
  };

  const refreshReminders = async () => {
    if (!user.id) return;
    const reminders = await fetchAllOwnerVaccinations(user.id);
    setVaccinationReminders(reminders);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        services,
        bookings,
        pets,
        vaccinationReminders,
        isLoading,
        notifications,
        unreadCount,
        markAsRead,
        markAllRead,
        refreshReminders,
        updateUser,
        addBooking,
        updateBooking,
        cancelBooking,
        deleteBooking,
        addPet,
        updatePet,
        deletePet,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
