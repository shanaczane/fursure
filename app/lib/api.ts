import { supabase } from "./supabase";
import type { User, Pet, Booking, Service, BookingStatus } from "@/app/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

interface ApiOptions extends RequestInit {
  body?: unknown;
}

export const apiCall = async <T = unknown>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> => {
  const config: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body) as BodyInit;
  }

  const url = endpoint.startsWith("/api") ? endpoint : `${API_URL}${endpoint}`;
  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "API request failed");
  }

  return response.json();
};

// ─── User ─────────────────────────────────────────────────────────────────────

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const firstName = user.user_metadata?.firstName ?? "";
  const lastName = user.user_metadata?.lastName ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || (user.email ?? "User");

  return {
    id: user.id,
    name: profile?.name ?? fullName,
    email: user.email ?? "",
    phone: profile?.phone ?? undefined,
    avatar: profile?.avatar ?? "👤",
    role: "owner" as const,
  };
};

export const upsertUserProfile = async (
  userId: string,
  data: { name: string; email: string; phone?: string; avatar?: string },
): Promise<void> => {
  const { error } = await supabase
    .from("users")
    .upsert({ id: userId, ...data }, { onConflict: "id" });
  if (error) throw new Error(error.message);
};

// ─── Pets ─────────────────────────────────────────────────────────────────────

export const fetchUserPets = async (userId: string): Promise<Pet[]> => {
  const { data, error } = await supabase
    .from("pets")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    breed: row.breed ?? "",
    age: row.age ?? 0,
    imageUrl: row.image_url ?? undefined,
  }));
};

export const insertPet = async (
  userId: string,
  pet: Omit<Pet, "id">,
): Promise<Pet> => {
  const { data, error } = await supabase
    .from("pets")
    .insert({
      owner_id: userId,
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      age: pet.age,
      image_url: pet.imageUrl ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    breed: data.breed ?? "",
    age: data.age ?? 0,
    imageUrl: data.image_url ?? undefined,
  };
};

export const updatePetRecord = async (
  petId: string,
  updates: Partial<Pet>,
): Promise<void> => {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.type !== undefined) payload.type = updates.type;
  if (updates.breed !== undefined) payload.breed = updates.breed;
  if (updates.age !== undefined) payload.age = updates.age;
  if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
  const { error } = await supabase.from("pets").update(payload).eq("id", petId);
  if (error) throw new Error(error.message);
};

export const deletePetRecord = async (petId: string): Promise<void> => {
  const { error } = await supabase.from("pets").delete().eq("id", petId);
  if (error) throw new Error(error.message);
};

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const fetchUserBookings = async (userId: string): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    serviceId: row.service_id ?? "",
    serviceName: row.service_name,
    providerName: row.provider_name,
    date: row.date,
    time: row.time,
    status: row.status as BookingStatus,
    petName: row.pet_name,
    notes: row.notes ?? undefined,
  }));
};

export const insertBooking = async (
  userId: string,
  booking: Omit<Booking, "id">,
): Promise<Booking> => {
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      owner_id: userId,
      service_id: booking.serviceId || null,
      service_name: booking.serviceName,
      provider_name: booking.providerName,
      pet_name: booking.petName,
      date: booking.date,
      time: booking.time,
      status: booking.status,
      notes: booking.notes ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return {
    id: data.id,
    serviceId: data.service_id ?? "",
    serviceName: data.service_name,
    providerName: data.provider_name,
    date: data.date,
    time: data.time,
    status: data.status as BookingStatus,
    petName: data.pet_name,
    notes: data.notes ?? undefined,
  };
};

export const updateBookingRecord = async (
  bookingId: string,
  updates: Partial<Booking>,
): Promise<void> => {
  const payload: Record<string, unknown> = {};
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.date !== undefined) payload.date = updates.date;
  if (updates.time !== undefined) payload.time = updates.time;
  if (updates.notes !== undefined) payload.notes = updates.notes;
  const { error } = await supabase.from("bookings").update(payload).eq("id", bookingId);
  if (error) throw new Error(error.message);
};

export const deleteBookingRecord = async (bookingId: string): Promise<void> => {
  const { error } = await supabase.from("bookings").delete().eq("id", bookingId);
  if (error) throw new Error(error.message);
};

// ─── Services ─────────────────────────────────────────────────────────────────

export const fetchServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from("services")
    .select("*, providers(name, rating, reviews, response_time)")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    provider: row.providers?.name ?? "",
    category: row.category,
    rating: row.providers?.rating ?? 0,
    reviews: row.providers?.reviews ?? 0,
    price: row.price,
    priceUnit: row.price_unit,
    location: row.location ?? "",
    distance: row.distance ?? "",
    image: row.image ?? "",
    description: row.description ?? "",
    features: row.features ?? [],
    availability: row.availability ?? [],
    responseTime: row.response_time ?? row.providers?.response_time ?? "",
  }));
};
