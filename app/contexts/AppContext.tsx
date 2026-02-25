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

// Safe localStorage helpers — guard against SSR (server has no window)
const safeGetItem = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
};

const safeSetItem = (key: string, value: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
};

const getInitialBookings = (): Booking[] => {
  const saved = safeGetItem("petcare_bookings");
  return saved ? JSON.parse(saved) : MOCK_BOOKINGS;
};

const getInitialPets = (): Pet[] => {
  const saved = safeGetItem("petcare_pets");
  return saved ? JSON.parse(saved) : MOCK_PETS;
};

const getInitialUser = (): User => {
  const saved = safeGetItem("petcare_user");
  return saved
    ? JSON.parse(saved)
    : {
        id: "1",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        role: "owner" as const,
        avatar: "👤",
      };
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(getInitialUser);
  const [services] = useState<Service[]>(MOCK_SERVICES);
  const [bookings, setBookings] = useState<Booking[]>(getInitialBookings);
  const [pets, setPets] = useState<Pet[]>(getInitialPets);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    safeSetItem("petcare_user", JSON.stringify(user));
  }, [user]);
  useEffect(() => {
    safeSetItem("petcare_bookings", JSON.stringify(bookings));
  }, [bookings]);
  useEffect(() => {
    safeSetItem("petcare_pets", JSON.stringify(pets));
  }, [pets]);

  const updateUser = (updates: Partial<User>) =>
    setUser((prev) => ({ ...prev, ...updates }));

  const addBooking = (booking: Omit<Booking, "id">) =>
    setBookings((prev) => [...prev, { ...booking, id: String(Date.now()) }]);

  const updateBooking = (id: string, updates: Partial<Booking>) =>
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    );

  const cancelBooking = (id: string) =>
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
    );

  const deleteBooking = (id: string) =>
    setBookings((prev) => prev.filter((b) => b.id !== id));

  const addPet = (pet: Omit<Pet, "id">) =>
    setPets((prev) => [...prev, { ...pet, id: String(Date.now()) }]);

  const updatePet = (id: string, updates: Partial<Pet>) =>
    setPets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
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
