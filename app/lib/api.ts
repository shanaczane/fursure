import { supabase } from "./supabase";
import type { User, Pet, Booking, Service, BookingStatus, Vaccination } from "@/app/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export const apiCall = async <T = unknown>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> => {
  const { body, ...rest } = options;
  const config: RequestInit = {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  if (body && typeof body === "object") {
    config.body = JSON.stringify(body);
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
    weight: row.weight ?? undefined,
    gender: row.gender ?? undefined,
    color: row.color ?? undefined,
    medicalNotes: row.medical_notes ?? undefined,
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
      weight: pet.weight ?? null,
      gender: pet.gender ?? null,
      color: pet.color ?? null,
      medical_notes: pet.medicalNotes ?? null,
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
    weight: data.weight ?? undefined,
    gender: data.gender ?? undefined,
    color: data.color ?? undefined,
    medicalNotes: data.medical_notes ?? undefined,
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
  if (updates.weight !== undefined) payload.weight = updates.weight;
  if (updates.gender !== undefined) payload.gender = updates.gender;
  if (updates.color !== undefined) payload.color = updates.color;
  if (updates.medicalNotes !== undefined) payload.medical_notes = updates.medicalNotes;
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
    providerPhone: row.provider_phone ?? undefined,
    providerEmail: row.provider_email ?? undefined,
    providerContactLink: row.provider_contact_link ?? undefined,
  }));
};

export const insertBooking = async (
  userId: string,
  booking: Omit<Booking, "id">,
): Promise<Booking> => {
  // Look up provider_id from providers table using providerUserId
  let providerId = null;
  if (booking.providerUserId) {
    const { data: provRow } = await supabase
      .from("providers")
      .select("id")
      .eq("user_id", booking.providerUserId)
      .maybeSingle();
    if (provRow) providerId = provRow.id;
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      owner_id: userId,
      provider_id: providerId,
      service_id: booking.serviceId || null,
      service_name: booking.serviceName,
      provider_name: booking.providerName,
      pet_name: booking.petName,
      price: booking.price ?? null,
      date: booking.date,
      time: booking.time,
      status: booking.status,
      notes: booking.notes ?? null,
      provider_phone: booking.providerPhone ?? null,
      provider_email: booking.providerEmail ?? null,
      provider_contact_link: booking.providerContactLink ?? null,
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
    providerPhone: data.provider_phone ?? undefined,
    providerEmail: data.provider_email ?? undefined,
    providerContactLink: data.provider_contact_link ?? undefined,
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

export const deleteVaccinationRecord = async (vaccinationId: string): Promise<void> => {
  const { error } = await supabase.from("vaccinations").delete().eq("id", vaccinationId);
  if (error) throw new Error(error.message);
};

export const fetchPetVaccinations = async (petId: string): Promise<Vaccination[]> => {
  const { data, error } = await supabase
    .from("vaccinations")
    .select("*")
    .eq("pet_id", petId)
    .order("date_given", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((v) => ({
    id: v.id,
    petId: v.pet_id,
    name: v.name,
    dateGiven: v.date_given,
    nextDueDate: v.next_due_date ?? undefined,
    vetName: v.vet_name ?? undefined,
    notes: v.notes ?? undefined,
  }));
};

export const insertVaccination = async (
  _userId: string,
  petId: string,
  record: Omit<Vaccination, "id" | "petId">
): Promise<Vaccination> => {
  const { data, error } = await supabase
    .from("vaccinations")
    .insert({
      pet_id: petId,
      name: record.name,
      date_given: record.dateGiven,
      next_due_date: record.nextDueDate ?? null,
      vet_name: record.vetName ?? null,
      notes: record.notes ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return {
    id: data.id,
    petId: data.pet_id,
    name: data.name,
    dateGiven: data.date_given,
    nextDueDate: data.next_due_date ?? undefined,
    vetName: data.vet_name ?? undefined,
    notes: data.notes ?? undefined,
  };
};

// ─── Provider Policy ──────────────────────────────────────────────────────────

export const fetchProviderPolicy = async (userId: string) => {
  const { data, error } = await supabase
    .from("provider_policies")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw new Error(error.message);
  if (!data) return null;
  return {
    id: data.id,
    depositRequired: data.deposit_required,
    depositPercentage: data.deposit_percentage,
    depositRefundable: data.deposit_refundable,
    cancellationHoursNotice: data.cancellation_hours_notice,
    paymentMethodsAccepted: data.payment_methods_accepted ?? ["Cash"],
    fullPaymentRequiredUpfront: data.full_payment_required_upfront,
    additionalNotes: data.additional_notes ?? "",
  };
};

export const upsertProviderPolicy = async (
  userId: string,
  policy: {
    depositRequired: boolean;
    depositPercentage: number;
    depositRefundable: boolean;
    cancellationHoursNotice: number;
    paymentMethodsAccepted: string[];
    fullPaymentRequiredUpfront: boolean;
    additionalNotes?: string;
  },
): Promise<void> => {
  const { error } = await supabase.from("provider_policies").upsert(
    {
      user_id: userId,
      deposit_required: policy.depositRequired,
      deposit_percentage: policy.depositPercentage,
      deposit_refundable: policy.depositRefundable,
      cancellation_hours_notice: policy.cancellationHoursNotice,
      payment_methods_accepted: policy.paymentMethodsAccepted,
      full_payment_required_upfront: policy.fullPaymentRequiredUpfront,
      additional_notes: policy.additionalNotes ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message);
};

// ─── Provider: contact info ───────────────────────────────────────────────────

export const fetchProviderContactInfo = async (userId: string) => {
  const [{ data: userRow }, { data: provRow }] = await Promise.all([
    supabase.from("users").select("email, phone").eq("id", userId).maybeSingle(),
    supabase.from("providers").select("contact_link").eq("user_id", userId).maybeSingle(),
  ]);
  return {
    providerPhone: userRow?.phone ?? undefined,
    providerEmail: userRow?.email ?? undefined,
    providerContactLink: provRow?.contact_link ?? undefined,
  };
};

export const upsertProviderContactLink = async (
  userId: string,
  contactLink: string,
): Promise<void> => {
  const providerId = await ensureProviderRow(userId);
  const { error } = await supabase
    .from("providers")
    .update({ contact_link: contactLink })
    .eq("id", providerId);
  if (error) throw new Error(error.message);
};

// ─── Provider: own services ───────────────────────────────────────────────────

/** Returns the providers.id for the auth user, creating the row if absent. */
const ensureProviderRow = async (userId: string): Promise<string> => {
  const { data: existing } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) return String(existing.id);

  // Fetch the user's name so we satisfy the NOT NULL constraint on providers.name
  const { data: userRow } = await supabase
    .from("users")
    .select("name")
    .eq("id", userId)
    .maybeSingle();

  const { data: created, error } = await supabase
    .from("providers")
    .insert({ user_id: userId, name: userRow?.name ?? "", is_verified: false, rating: 0 })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return String(created.id);
};

export const fetchProviderOwnServices = async (userId: string) => {
  const { data: provRow } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!provRow) return [];

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("provider_id", provRow.id)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: row.name,
    category: row.category,
    description: row.description ?? "",
    price: row.price,
    priceUnit: row.price_unit ?? "per session",
    duration: row.duration ?? 60,
    image: row.image ?? "🐾",
    location: row.location ?? "",
    features: row.features ?? [],
    availability: row.availability ?? [],
    isActive: row.is_active ?? true,
    totalBookings: row.total_bookings ?? 0,
    rating: row.rating ?? 0,
    reviews: row.reviews ?? 0,
    createdAt: row.created_at ?? new Date().toISOString(),
  }));
};

export const insertProviderServiceRecord = async (
  userId: string,
  service: {
    name: string; category: string; description: string;
    price: number; priceUnit: string; duration: number;
    image: string; location: string; features: string[]; availability: string[];
    isActive: boolean;
  },
): Promise<{ id: string; createdAt: string }> => {
  const providerId = await ensureProviderRow(userId);
  const { data, error } = await supabase
    .from("services")
    .insert({
      provider_id: providerId,
      name: service.name,
      category: service.category,
      description: service.description,
      price: service.price,
      price_unit: service.priceUnit,
      duration: service.duration,
      image: service.image,
      location: service.location,
      features: service.features,
      availability: service.availability,
      is_active: service.isActive,
    })
    .select("id, created_at")
    .single();
  if (error) throw new Error(error.message);
  return { id: String(data.id), createdAt: data.created_at };
};

export const updateProviderServiceRecord = async (
  serviceId: string,
  updates: Partial<{
    name: string; category: string; description: string;
    price: number; priceUnit: string; duration: number;
    image: string; location: string; features: string[]; availability: string[];
    isActive: boolean;
  }>,
): Promise<void> => {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.price !== undefined) payload.price = updates.price;
  if (updates.priceUnit !== undefined) payload.price_unit = updates.priceUnit;
  if (updates.duration !== undefined) payload.duration = updates.duration;
  if (updates.image !== undefined) payload.image = updates.image;
  if (updates.location !== undefined) payload.location = updates.location;
  if (updates.features !== undefined) payload.features = updates.features;
  if (updates.availability !== undefined) payload.availability = updates.availability;
  if (updates.isActive !== undefined) payload.is_active = updates.isActive;
  const { error } = await supabase.from("services").update(payload).eq("id", serviceId);
  if (error) throw new Error(error.message);
};

export const deleteProviderServiceRecord = async (serviceId: string): Promise<void> => {
  const { error } = await supabase.from("services").delete().eq("id", serviceId);
  if (error) throw new Error(error.message);
};

// ─── Provider: own bookings ───────────────────────────────────────────────────

export const fetchProviderOwnBookings = async (userId: string) => {
  const { data: provRow } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!provRow) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("provider_id", provRow.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: String(row.id),
    serviceId: row.service_id ? String(row.service_id) : "",
    serviceName: row.service_name ?? "",
    ownerName: row.owner_name ?? "Unknown",
    ownerEmail: row.owner_email ?? "",
    ownerPhone: row.owner_phone ?? undefined,
    petName: row.pet_name ?? "",
    petType: row.pet_type ?? "",
    petBreed: row.pet_breed ?? "",
    date: row.date,
    time: row.time ?? "",
    status: row.status,
    notes: row.notes ?? undefined,
    providerNotes: row.provider_notes ?? undefined,
    rescheduleDate: row.reschedule_date ?? undefined,
    rescheduleTime: row.reschedule_time ?? undefined,
    price: row.price ?? 0,
    createdAt: row.created_at,
  }));
};

export const updateProviderBookingStatus = async (
  bookingId: string,
  status: string,
  extras?: { providerNotes?: string; rescheduleDate?: string; rescheduleTime?: string },
): Promise<void> => {
  const payload: Record<string, unknown> = { status };
  if (extras?.providerNotes !== undefined) payload.provider_notes = extras.providerNotes;
  if (extras?.rescheduleDate !== undefined) payload.reschedule_date = extras.rescheduleDate;
  if (extras?.rescheduleTime !== undefined) payload.reschedule_time = extras.rescheduleTime;
  const { error } = await supabase.from("bookings").update(payload).eq("id", bookingId);
  if (error) throw new Error(error.message);
};

// ─── Services ─────────────────────────────────────────────────────────────────

export const fetchServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from("services")
    .select("*, providers(name, rating, reviews, response_time, user_id)")
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    provider: row.providers?.name ?? "",
    providerUserId: row.providers?.user_id ?? undefined,
    category: row.category,
    rating: row.providers?.rating ?? 0,
    reviews: row.providers?.reviews ?? 0,
    price: row.price,
    priceUnit: row.price_unit,
    location: row.location ?? "",
    distance: row.distance ?? "",
    duration: row.duration ?? 60,
    image: row.image ?? "",
    description: row.description ?? "",
    features: row.features ?? [],
    availability: row.availability ?? [],
    responseTime: row.response_time ?? row.providers?.response_time ?? "",
  }));
};
