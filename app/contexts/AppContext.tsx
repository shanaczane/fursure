"use client";

import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { type Service, type Booking, type Pet, type User } from "@/app/types";
import { MOCK_SERVICES, MOCK_BOOKINGS, MOCK_PETS } from "@/app/data/mockData";
import { supabase } from "@/app/lib/supabase";

interface AppContextType {
  user: User;
  services: Service[];
  bookings: Booking[];
  pets: Pet[];
  updateUser: (user: Partial<User>) => void;
  addBooking: (booking: Omit<Booking, "id">) => void;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  cancelBooking: (id: string) => void;
  deleteBooking: (id: string) => void;
  addPet: (pet: Omit<Pet, "id">) => void;
  updatePet: (id: string, pet: Partial<Pet>) => void;
  deletePet: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

const safeGetItem = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
};

const safeSetItem = (key: string, value: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
};

const DEFAULT_USER: User = {
  id: "1",
  name: "Loading...",
  email: "",
  phone: "",
  role: "owner" as const,
  avatar: "",
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [services] = useState<Service[]>(MOCK_SERVICES);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [pets, setPets] = useState<Pet[]>(MOCK_PETS);

  // Load from localStorage + Supabase auth after mount
  useEffect(() => {
    const init = async () => {
      // Load persisted data
      const savedBookings = safeGetItem("petcare_bookings");
      if (savedBookings) setBookings(JSON.parse(savedBookings));

      const savedPets = safeGetItem("petcare_pets");
      if (savedPets) setPets(JSON.parse(savedPets));

      // Get real user from Supabase auth — this is the source of truth for name/email
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const firstName = data.user.user_metadata?.firstName || "";
        const lastName = data.user.user_metadata?.lastName || "";
        const fullName = [firstName, lastName].filter(Boolean).join(" ");
        const email = data.user.email || "";

        // Check if there's a saved phone in localStorage
        const savedUser = safeGetItem("petcare_user");
        const savedPhone = savedUser ? JSON.parse(savedUser).phone || "" : "";

        setUser({
          id: data.user.id,
          name: fullName || email,
          email,
          phone: savedPhone,
          role: "owner" as const,
          avatar: "",
        });
      } else {
        // Fallback to localStorage if no auth session
        const savedUser = safeGetItem("petcare_user");
        if (savedUser) setUser(JSON.parse(savedUser));
      }
    };
    init();
  }, []);

  // Persist bookings and pets to localStorage
  useEffect(() => {
    safeSetItem("petcare_bookings", JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    safeSetItem("petcare_pets", JSON.stringify(pets));
  }, [pets]);

  // Persist user changes (phone etc.) to localStorage
  useEffect(() => {
    if (user.name && user.name !== "Loading...") {
      safeSetItem("petcare_user", JSON.stringify(user));
    }
  }, [user]);

  const updateUser = (updates: Partial<User>) =>
    setUser((prev) => ({ ...prev, ...updates }));

  const addBooking = (booking: Omit<Booking, "id">) =>
    setBookings((prev) => [...prev, { ...booking, id: String(Date.now()) }]);

  const updateBooking = (id: string, updates: Partial<Booking>) =>
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );

  const cancelBooking = (id: string) =>
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
    );

  const deleteBooking = (id: string) =>
    setBookings((prev) => prev.filter((b) => b.id !== id));

  const addPet = (pet: Omit<Pet, "id">) =>
    setPets((prev) => [...prev, { ...pet, id: String(Date.now()) }]);

  const updatePet = (id: string, updates: Partial<Pet>) =>
    setPets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

  const deletePet = (id: string) =>
    setPets((prev) => prev.filter((p) => p.id !== id));

  return (
    <AppContext.Provider
      value={{
        user,
        services,
        bookings,
        pets,
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