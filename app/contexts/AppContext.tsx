"use client";

import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { type Service, type Booking, type Pet, type User } from "@/app/types";
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
} from "@/app/lib/api";

interface AppContextType {
  user: User;
  services: Service[];
  bookings: Booking[];
  pets: Pet[];
  isLoading: boolean;
  updateUser: (updates: Partial<User>) => Promise<void>;
  addBooking: (booking: Omit<Booking, "id">) => Promise<void>;
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  addPet: (pet: Omit<Pet, "id">) => Promise<void>;
  updatePet: (id: string, updates: Partial<Pet>) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);

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
          const [userPets, userBookings] = await Promise.all([
            fetchUserPets(currentUser.id),
            fetchUserBookings(currentUser.id),
          ]);
          setPets(userPets);
          setBookings(userBookings);
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
    await updatePetRecord(id, updates);
    setPets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
  };

  const deletePet = async (id: string) => {
    await deletePetRecord(id);
    setPets((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        services,
        bookings,
        pets,
        isLoading,
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
