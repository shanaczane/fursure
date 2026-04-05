import { supabase } from "./supabase";
import type { User, Pet, Booking, Service, BookingStatus, Vaccination, MedicalHistory, VaccinationReminder } from "@/app/types";

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

export const updateAuthCredentials = async (
  userId: string,
  updates: { email?: string; password?: string },
): Promise<void> => {
  const res = await fetch("/api/auth/update-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...updates }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Failed to update credentials.");
  }
};

export const verifyCurrentPassword = async (
  email: string,
  password: string,
): Promise<void> => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error("Current password is incorrect.");
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
    requiresDownPayment: row.requires_down_payment ?? false,
    downPaymentDeadlineHours: row.down_payment_deadline_hours ?? 24,
    editCancelGracePeriodHours: row.edit_cancel_grace_period_hours ?? 24,
    createdAt: row.created_at ?? undefined,
    downPaymentPaid: row.down_payment_paid ?? false,
    downPaymentPaidAt: row.down_payment_paid_at ?? undefined,
    downPaymentConfirmed: row.down_payment_confirmed ?? false,
    downPaymentConfirmedAt: row.down_payment_confirmed_at ?? undefined,
    editRequestStatus: row.edit_request_status ?? "none",
    cancelRequestStatus: row.cancel_request_status ?? "none",
    rescheduleDate: row.reschedule_date ?? undefined,
    rescheduleTime: row.reschedule_time ?? undefined,
    rescheduleStatus: row.reschedule_status ?? undefined,
  }));
};

export const insertBooking = async (
  userId: string,
  booking: Omit<Booking, "id">,
): Promise<Booking> => {
  const { data: ownerProfile } = await supabase
    .from("users")
    .select("name, email, phone")
    .eq("id", userId)
    .maybeSingle();

  const { data: petRow } = await supabase
    .from("pets")
    .select("id, type, breed")
    .eq("owner_id", userId)
    .eq("name", booking.petName)
    .maybeSingle();

  let requiresDownPayment = false;
  let downPaymentDeadlineHours = 24;
  let editCancelGracePeriodHours = 24;
  let price = 0;

  if (booking.providerUserId) {
    const [policyRow, serviceRow] = await Promise.all([
      supabase
        .from("provider_policies")
        .select("deposit_required, down_payment_deadline_hours, cancellation_hours_notice")
        .eq("user_id", booking.providerUserId)
        .maybeSingle(),
      supabase
        .from("services")
        .select("price")
        .eq("id", booking.serviceId)
        .maybeSingle(),
    ]);

    requiresDownPayment = policyRow.data?.deposit_required ?? false;
    downPaymentDeadlineHours = policyRow.data?.down_payment_deadline_hours ?? 24;
    editCancelGracePeriodHours = policyRow.data?.cancellation_hours_notice ?? 24;
    price = serviceRow.data?.price ?? 0;
  }

  let providerId = null;
  if (booking.providerUserId) {
    const { data: provRow } = await supabase
      .from("providers")
      .select("id")
      .eq("user_id", booking.providerUserId)
      .maybeSingle();
    if (provRow) providerId = provRow.id;
  }

  const initialStatus: BookingStatus = requiresDownPayment
    ? "awaiting_downpayment"
    : "pending";

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      owner_id: userId,
      provider_id: providerId,
      service_id: booking.serviceId || null,
      service_name: booking.serviceName,
      provider_name: booking.providerName,
      pet_id: petRow?.id ?? null,
      pet_name: booking.petName,
      pet_type: petRow?.type ?? "",
      pet_breed: petRow?.breed ?? "",
      owner_name: ownerProfile?.name ?? "",
      owner_email: ownerProfile?.email ?? "",
      owner_phone: ownerProfile?.phone ?? null,
      date: booking.date,
      time: booking.time,
      status: initialStatus,
      notes: booking.notes ?? null,
      provider_phone: booking.providerPhone ?? null,
      provider_email: booking.providerEmail ?? null,
      provider_contact_link: booking.providerContactLink ?? null,
      price,
      requires_down_payment: requiresDownPayment,
      down_payment_deadline_hours: downPaymentDeadlineHours,
      edit_cancel_grace_period_hours: editCancelGracePeriodHours,
      down_payment_paid: false,
      down_payment_confirmed: false,
      edit_request_status: "none",
      cancel_request_status: "none",
      created_at: new Date().toISOString(),
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
    requiresDownPayment,
    downPaymentDeadlineHours,
    editCancelGracePeriodHours,
    createdAt: data.created_at ?? undefined,
    downPaymentPaid: false,
    downPaymentConfirmed: false,
    editRequestStatus: "none",
    cancelRequestStatus: "none",
    rescheduleDate: undefined,
    rescheduleTime: undefined,
    rescheduleStatus: undefined,
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
  if (updates.downPaymentPaid !== undefined) payload.down_payment_paid = updates.downPaymentPaid;
  if (updates.downPaymentPaidAt !== undefined) payload.down_payment_paid_at = updates.downPaymentPaidAt;
  if (updates.downPaymentConfirmed !== undefined) payload.down_payment_confirmed = updates.downPaymentConfirmed;
  if (updates.downPaymentConfirmedAt !== undefined) payload.down_payment_confirmed_at = updates.downPaymentConfirmedAt;
  if (updates.editRequestStatus !== undefined) payload.edit_request_status = updates.editRequestStatus;
  if (updates.cancelRequestStatus !== undefined) payload.cancel_request_status = updates.cancelRequestStatus;
  if (updates.rescheduleDate !== undefined) payload.reschedule_date = updates.rescheduleDate ?? null;
  if (updates.rescheduleTime !== undefined) payload.reschedule_time = updates.rescheduleTime ?? null;
  if (updates.rescheduleStatus !== undefined) payload.reschedule_status = updates.rescheduleStatus ?? null;
  const { error } = await supabase.from("bookings").update(payload).eq("id", bookingId);
  if (error) throw new Error(error.message);
};

export const deleteBookingRecord = async (bookingId: string): Promise<void> => {
  const { error } = await supabase.from("bookings").delete().eq("id", bookingId);
  if (error) throw new Error(error.message);
};

// ─── Booking policy actions ───────────────────────────────────────────────────

export const requestBookingEdit = async (bookingId: string): Promise<void> => {
  const { error } = await supabase
    .from("bookings")
    .update({ edit_request_status: "pending" })
    .eq("id", bookingId);
  if (error) throw new Error(error.message);
};

export const requestBookingCancel = async (bookingId: string): Promise<void> => {
  const { error } = await supabase
    .from("bookings")
    .update({ cancel_request_status: "pending" })
    .eq("id", bookingId);
  if (error) throw new Error(error.message);
};

export const payDownPayment = async (bookingId: string): Promise<void> => {
  const { error } = await supabase
    .from("bookings")
    .update({
      down_payment_paid: true,
      down_payment_paid_at: new Date().toISOString(),
      status: "payment_submitted",
    })
    .eq("id", bookingId);
  if (error) {
    console.error("payDownPayment error:", error);
    throw new Error(error.message);
  }
};

export const confirmDownPayment = async (bookingId: string): Promise<void> => {
  const { error } = await supabase
    .from("bookings")
    .update({
      down_payment_confirmed: true,
      down_payment_confirmed_at: new Date().toISOString(),
      status: "confirmed",
    })
    .eq("id", bookingId);
  if (error) throw new Error(error.message);
};

export const rejectDownPayment = async (bookingId: string): Promise<void> => {
  const { error } = await supabase
    .from("bookings")
    .update({
      down_payment_paid: false,
      down_payment_paid_at: null,
      status: "awaiting_downpayment",
    })
    .eq("id", bookingId);
  if (error) throw new Error(error.message);
};

// ─── Reschedule actions (owner side) ─────────────────────────────────────────

export const confirmReschedule = async (
  bookingId: string,
  rescheduleDate: string,
  rescheduleTime: string,
): Promise<void> => {
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "confirmed",
      date: rescheduleDate,
      time: rescheduleTime,
      reschedule_date: null,
      reschedule_time: null,
      reschedule_status: "confirmed",
    })
    .eq("id", bookingId);
  if (error) throw new Error(error.message);
};

export const declineReschedule = async (bookingId: string): Promise<void> => {
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      reschedule_date: null,
      reschedule_time: null,
      reschedule_status: "declined",
    })
    .eq("id", bookingId);
  if (error) throw new Error(error.message);
};

// ─── Vaccinations ─────────────────────────────────────────────────────────────

export const deleteVaccinationRecord = async (vaccinationId: string): Promise<void> => {
  const { error } = await supabase
    .from("pet_vaccinations")
    .delete()
    .eq("id", vaccinationId);
  if (error) throw new Error(error.message);
};

export const fetchPetVaccinations = async (petId: string): Promise<Vaccination[]> => {
  const { data, error } = await supabase
    .from("pet_vaccinations")
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
    addedBy: (v.added_by ?? "owner") as "owner" | "provider",
    isVerified: v.is_verified ?? false,
    providerName: v.provider_name ?? undefined,
  }));
};

export const insertVaccination = async (
  userId: string,
  petId: string,
  record: Omit<Vaccination, "id" | "petId">,
  options?: { addedBy?: "owner" | "provider"; isVerified?: boolean; providerName?: string },
): Promise<Vaccination> => {
  const { data, error } = await supabase
    .from("pet_vaccinations")
    .insert({
      owner_id: userId,
      pet_id: petId,
      name: record.name,
      date_given: record.dateGiven,
      next_due_date: record.nextDueDate ?? null,
      vet_name: record.vetName ?? null,
      notes: record.notes ?? null,
      added_by: options?.addedBy ?? record.addedBy ?? "owner",
      is_verified: options?.isVerified ?? record.isVerified ?? false,
      provider_name: options?.providerName ?? record.providerName ?? null,
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
    addedBy: (data.added_by ?? "owner") as "owner" | "provider",
    isVerified: data.is_verified ?? false,
    providerName: data.provider_name ?? undefined,
  };
};

// ─── Medical History ──────────────────────────────────────────────────────────

export const fetchMedicalHistory = async (petId: string): Promise<MedicalHistory[]> => {
  const { data, error } = await supabase
    .from("pet_medical_history")
    .select("*")
    .eq("pet_id", petId)
    .order("date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    petId: r.pet_id,
    diagnosis: r.diagnosis,
    treatment: r.treatment ?? undefined,
    prescription: r.prescription ?? undefined,
    notes: r.notes ?? undefined,
    date: r.date,
    addedBy: (r.added_by ?? "owner") as "owner" | "provider",
    providerName: r.provider_name ?? undefined,
  }));
};

export const insertMedicalHistory = async (
  petId: string,
  ownerId: string,
  record: Omit<MedicalHistory, "id" | "petId">,
): Promise<MedicalHistory> => {
  const { data, error } = await supabase
    .from("pet_medical_history")
    .insert({
      pet_id: petId,
      owner_id: ownerId,
      diagnosis: record.diagnosis,
      treatment: record.treatment ?? null,
      prescription: record.prescription ?? null,
      notes: record.notes ?? null,
      date: record.date,
      added_by: record.addedBy ?? "owner",
      provider_name: record.providerName ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return {
    id: data.id,
    petId: data.pet_id,
    diagnosis: data.diagnosis,
    treatment: data.treatment ?? undefined,
    prescription: data.prescription ?? undefined,
    notes: data.notes ?? undefined,
    date: data.date,
    addedBy: (data.added_by ?? "owner") as "owner" | "provider",
    providerName: data.provider_name ?? undefined,
  };
};

export const deleteMedicalHistoryRecord = async (id: string): Promise<void> => {
  const { error } = await supabase.from("pet_medical_history").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

// ─── Vaccination Reminders (all pets for an owner) ────────────────────────────

export const fetchAllOwnerVaccinations = async (userId: string): Promise<VaccinationReminder[]> => {
  // Get all pet IDs for this owner
  const { data: pets } = await supabase
    .from("pets")
    .select("id, name")
    .eq("owner_id", userId);
  if (!pets || pets.length === 0) return [];

  const petIds = pets.map((p) => p.id);
  const petNameMap: Record<string, string> = {};
  pets.forEach((p) => { petNameMap[p.id] = p.name; });

  const { data, error } = await supabase
    .from("pet_vaccinations")
    .select("pet_id, name, next_due_date")
    .in("pet_id", petIds)
    .not("next_due_date", "is", null);
  if (error) throw new Error(error.message);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (data ?? [])
    .map((v) => {
      const due = new Date(v.next_due_date);
      due.setHours(0, 0, 0, 0);
      const daysUntilDue = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return {
        petId: v.pet_id,
        petName: petNameMap[v.pet_id] ?? "Unknown",
        vaccineName: v.name,
        nextDueDate: v.next_due_date,
        daysUntilDue,
      } as VaccinationReminder;
    })
    .filter((r) => r.daysUntilDue <= 30) // only show within 30 days or overdue
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
};

// ─── Provider-side pet record access ─────────────────────────────────────────

export const providerInsertVaccination = async (
  petId: string,
  providerUserId: string,
  providerName: string,
  record: { name: string; dateGiven: string; nextDueDate?: string; notes?: string },
): Promise<Vaccination> => {
  // Look up owner_id from pet
  const { data: pet } = await supabase.from("pets").select("owner_id").eq("id", petId).maybeSingle();
  const { data, error } = await supabase
    .from("pet_vaccinations")
    .insert({
      owner_id: pet?.owner_id ?? null,
      pet_id: petId,
      name: record.name,
      date_given: record.dateGiven,
      next_due_date: record.nextDueDate ?? null,
      vet_name: providerName,
      notes: record.notes ?? null,
      added_by: "provider",
      is_verified: true,
      provider_name: providerName,
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
    addedBy: "provider",
    isVerified: true,
    providerName: data.provider_name ?? undefined,
  };
};

export const providerInsertMedicalHistory = async (
  petId: string,
  providerName: string,
  record: { diagnosis: string; treatment?: string; prescription?: string; notes?: string; date: string },
): Promise<MedicalHistory> => {
  const { data: pet } = await supabase.from("pets").select("owner_id").eq("id", petId).maybeSingle();
  const { data, error } = await supabase
    .from("pet_medical_history")
    .insert({
      pet_id: petId,
      owner_id: pet?.owner_id ?? null,
      diagnosis: record.diagnosis,
      treatment: record.treatment ?? null,
      prescription: record.prescription ?? null,
      notes: record.notes ?? null,
      date: record.date,
      added_by: "provider",
      provider_name: providerName,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return {
    id: data.id,
    petId: data.pet_id,
    diagnosis: data.diagnosis,
    treatment: data.treatment ?? undefined,
    prescription: data.prescription ?? undefined,
    notes: data.notes ?? undefined,
    date: data.date,
    addedBy: "provider",
    providerName: data.provider_name ?? undefined,
  };
};

// ─── Provider Public Profile ──────────────────────────────────────────────────

export interface PublicProviderProfile {
  userId: string;
  name: string;
  businessName: string;
  bio: string;
  email: string;
  phone?: string;
  contactLink?: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  avatar?: string;
  services: {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    priceUnit: string;
    duration: number;
    image: string;
    location: string;
    features: string[];
    availability: string[];
    rating: number;
    reviews: number;
  }[];
}

export const fetchPublicProviderProfile = async (
  providerUserId: string,
): Promise<PublicProviderProfile | null> => {
  const { supabase } = await import("./supabase");

  const [{ data: provRow }, { data: userRow }] = await Promise.all([
    supabase
      .from("providers")
      .select("id, name, rating, reviews, response_time, is_verified, contact_link")
      .eq("user_id", providerUserId)
      .maybeSingle(),
    supabase
      .from("users")
      .select("name, email, phone, avatar")
      .eq("id", providerUserId)
      .maybeSingle(),
  ]);

  if (!provRow) return null;

  const { data: serviceRows } = await supabase
    .from("services")
    .select("*")
    .eq("provider_id", provRow.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const { data: bioRow } = await supabase
    .from("providers")
    .select("bio, business_name, business_address")
    .eq("id", provRow.id)
    .maybeSingle();

  return {
    userId: providerUserId,
    name: provRow.name ?? userRow?.name ?? "Unknown Provider",
    businessName: bioRow?.business_name ?? provRow.name ?? "",
    bio: bioRow?.bio ?? "",
    email: userRow?.email ?? "",
    phone: userRow?.phone ?? undefined,
    contactLink: provRow.contact_link ?? undefined,
    rating: provRow.rating ?? 0,
    totalReviews: provRow.reviews ?? 0,
    isVerified: provRow.is_verified ?? false,
    avatar: userRow?.avatar ?? undefined,
    services: (serviceRows ?? []).map((row) => ({
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
      rating: row.rating ?? 0,
      reviews: row.reviews ?? 0,
    })),
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
    downPaymentDeadlineHours: data.down_payment_deadline_hours ?? 24,
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
    downPaymentDeadlineHours: number;
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
      down_payment_deadline_hours: policy.downPaymentDeadlineHours,
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

const ensureProviderRow = async (userId: string): Promise<string> => {
  const { data: existing } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) return String(existing.id);

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
    petId: row.pet_id ?? undefined,
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
    rescheduleStatus: row.reschedule_status ?? undefined,
    price: row.price ?? 0,
    createdAt: row.created_at,
    requiresDownPayment: row.requires_down_payment ?? false,
    downPaymentDeadlineHours: row.down_payment_deadline_hours ?? 24,
    downPaymentPaid: row.down_payment_paid ?? false,
    downPaymentPaidAt: row.down_payment_paid_at ?? undefined,
    downPaymentConfirmed: row.down_payment_confirmed ?? false,
    downPaymentConfirmedAt: row.down_payment_confirmed_at ?? undefined,
    editCancelGracePeriodHours: row.edit_cancel_grace_period_hours ?? 24,
    editRequestStatus: row.edit_request_status ?? "none",
    cancelRequestStatus: row.cancel_request_status ?? "none",
    // ─── Review fields ────────────────────────────────────────────────────
    rating: row.rating ?? undefined,
    reviewComment: row.review_comment ?? undefined,
    reviewDate: row.review_date ?? undefined,
    // ─────────────────────────────────────────────────────────────────────
  }));
};

export const updateProviderBookingStatus = async (
  bookingId: string,
  status: string,
  extras?: {
    providerNotes?: string;
    rescheduleDate?: string;
    rescheduleTime?: string;
    editRequestStatus?: "none" | "pending" | "approved" | "rejected";
    cancelRequestStatus?: "none" | "pending" | "approved" | "rejected";
  },
): Promise<void> => {
  const payload: Record<string, unknown> = { status };
  if (extras?.providerNotes !== undefined) payload.provider_notes = extras.providerNotes;
  if (extras?.rescheduleDate !== undefined) payload.reschedule_date = extras.rescheduleDate;
  if (extras?.rescheduleTime !== undefined) payload.reschedule_time = extras.rescheduleTime;
  if (extras?.editRequestStatus !== undefined) payload.edit_request_status = extras.editRequestStatus;
  if (extras?.cancelRequestStatus !== undefined) payload.cancel_request_status = extras.cancelRequestStatus;
  if (status === "rescheduled") payload.reschedule_status = "pending";
  const { error } = await supabase.from("bookings").update(payload).eq("id", bookingId);
  if (error) throw new Error(error.message);
};

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const submitServiceReview = async (
  serviceId: string,
  rating: number,
): Promise<void> => {
  const { error } = await supabase.rpc("submit_service_review", {
    p_service_id: serviceId,
    p_rating: rating,
  });
  if (error) throw new Error(error.message);
};

// Writes rating + comment + date to the bookings row so the provider
// can see the review in their Manage Bookings and Dashboard pages.
export const submitBookingReview = async (
  bookingId: string,
  rating: number,
  comment: string,
): Promise<void> => {
  const { error } = await supabase
    .from("bookings")
    .update({
      rating,
      review_comment: comment,
      review_date: new Date().toISOString(),
    })
    .eq("id", bookingId);
  if (error) throw new Error(error.message);
};

// ─── Services ─────────────────────────────────────────────────────────────────

export const fetchServices = async (): Promise<Service[]> => {
  // Step 1: fetch all verified providers
  const { data: providerRows, error: providerError } = await supabase
    .from("providers")
    .select("id, name, response_time, user_id")
    .eq("is_verified", true);

  if (providerError) throw new Error(providerError.message);
  if (!providerRows || providerRows.length === 0) return [];

  const providerIds = providerRows.map((p) => p.id);

  // Step 2: fetch active services for those providers
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .in("provider_id", providerIds)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const providerMap = Object.fromEntries(providerRows.map((p) => [String(p.id), p]));

  return (data ?? []).map((row) => {
    const prov = providerMap[String(row.provider_id)] ?? {};
    return {
      id: row.id,
      name: row.name,
      provider: prov.name ?? "",
      providerUserId: prov.user_id ?? undefined,
      category: row.category,
      // ─── Per-service rating — reads from services table, not providers ───
      rating: row.rating ?? 0,
      reviews: row.reviews ?? 0,
      // ─────────────────────────────────────────────────────────────────────
      price: row.price,
      priceUnit: row.price_unit,
      location: row.location ?? "",
      distance: row.distance ?? "",
      duration: row.duration ?? 60,
      image: row.image ?? "",
      description: row.description ?? "",
      features: row.features ?? [],
      availability: row.availability ?? [],
      responseTime: row.response_time ?? prov.response_time ?? "",
    };
  });
};