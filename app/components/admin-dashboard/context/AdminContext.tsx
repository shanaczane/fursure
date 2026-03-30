"use client";

import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { supabase } from "@/app/lib/supabase";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "owner" | "provider" | "admin";
  createdAt: string;
  isVerified?: boolean;
  bookingCount?: number;
}

export interface ProviderRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  businessName: string;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  serviceCount: number;
  bookingCount: number;
  createdAt: string;
  contactLink?: string;
}

export interface ActivityLog {
  id: string;
  type: "booking" | "registration" | "verification" | "cancellation" | "service";
  description: string;
  userId?: string;
  userName?: string;
  createdAt: string;
}

export interface SystemStats {
  totalUsers: number;
  totalProviders: number;
  totalBookings: number;
  pendingVerifications: number;
  activeServices: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
}

interface AdminContextType {
  admin: AdminUser;
  users: UserRecord[];
  providers: ProviderRecord[];
  activityLogs: ActivityLog[];
  stats: SystemStats;
  isLoading: boolean;
  verifyProvider: (providerId: string) => Promise<void>;
  unverifyProvider: (providerId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdminContext = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdminContext must be used within AdminProvider");
  return ctx;
};

const EMPTY_STATS: SystemStats = {
  totalUsers: 0,
  totalProviders: 0,
  totalBookings: 0,
  pendingVerifications: 0,
  activeServices: 0,
  completedBookings: 0,
  cancelledBookings: 0,
  totalRevenue: 0,
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser>({ id: "", name: "Admin", email: "" });
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [providers, setProviders] = useState<ProviderRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<SystemStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setAdmin({
          id: authUser.id,
          name: authUser.user_metadata?.firstName
            ? `${authUser.user_metadata.firstName} ${authUser.user_metadata.lastName ?? ""}`.trim()
            : authUser.email ?? "Admin",
          email: authUser.email ?? "",
        });
      }

      // Fetch users
      const { data: usersData } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch providers
      const { data: providersData } = await supabase
        .from("providers")
        .select("*, users(email)")
        .order("created_at", { ascending: false });

      // Fetch services count
      const { data: servicesData } = await supabase
        .from("services")
        .select("id, provider_id, is_active");

      // Fetch bookings
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      // Map users
      const mappedUsers: UserRecord[] = (usersData ?? []).map((u) => ({
        id: u.id,
        name: u.name ?? "Unknown",
        email: u.email ?? "",
        phone: u.phone ?? undefined,
        role: u.role ?? "owner",
        createdAt: u.created_at ?? new Date().toISOString(),
        isVerified: true,
        bookingCount: (bookingsData ?? []).filter((b) => b.owner_id === u.id).length,
      }));

      // Map providers
      const mappedProviders: ProviderRecord[] = (providersData ?? []).map((p) => ({
        id: String(p.id),
        userId: p.user_id,
        name: p.name ?? "Unknown",
        email: (p.users as any)?.email ?? "",
        businessName: p.name ?? "Unknown Business",
        isVerified: p.is_verified ?? false,
        rating: p.rating ?? 0,
        totalReviews: p.reviews ?? 0,
        serviceCount: (servicesData ?? []).filter((s) => String(s.provider_id) === String(p.id)).length,
        bookingCount: (bookingsData ?? []).filter((b) => b.provider_id === p.id).length,
        createdAt: p.created_at ?? new Date().toISOString(),
        contactLink: p.contact_link ?? undefined,
      }));

      // Build activity logs from bookings
      const logs: ActivityLog[] = [
        ...(bookingsData ?? []).slice(0, 30).map((b) => ({
          id: b.id,
          type: (b.status === "cancelled" ? "cancellation" : "booking") as ActivityLog["type"],
          description: `Booking for "${b.service_name}" — ${b.status}`,
          userId: b.owner_id,
          userName: b.owner_name ?? "Pet Owner",
          createdAt: b.created_at,
        })),
        ...(usersData ?? []).slice(0, 10).map((u) => ({
          id: `reg-${u.id}`,
          type: "registration" as ActivityLog["type"],
          description: `New user registered: ${u.name ?? u.email}`,
          userId: u.id,
          userName: u.name ?? u.email,
          createdAt: u.created_at,
        })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 30);

      setUsers(mappedUsers);
      setProviders(mappedProviders);
      setActivityLogs(logs);

      // Compute stats
      const completedBookings = (bookingsData ?? []).filter((b) => b.status === "completed");
      setStats({
        totalUsers: mappedUsers.length,
        totalProviders: mappedProviders.length,
        totalBookings: (bookingsData ?? []).length,
        pendingVerifications: mappedProviders.filter((p) => !p.isVerified).length,
        activeServices: (servicesData ?? []).filter((s) => s.is_active).length,
        completedBookings: completedBookings.length,
        cancelledBookings: (bookingsData ?? []).filter((b) => b.status === "cancelled").length,
        totalRevenue: completedBookings.reduce((sum, b) => sum + (b.price ?? 0), 0),
      });
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const verifyProvider = async (providerId: string) => {
    const { error } = await supabase
      .from("providers")
      .update({ is_verified: true })
      .eq("id", providerId);
    if (error) throw new Error(error.message);
    setProviders((prev) =>
      prev.map((p) => p.id === providerId ? { ...p, isVerified: true } : p)
    );
    setStats((prev) => ({ ...prev, pendingVerifications: Math.max(0, prev.pendingVerifications - 1) }));
  };

  const unverifyProvider = async (providerId: string) => {
    const { error } = await supabase
      .from("providers")
      .update({ is_verified: false })
      .eq("id", providerId);
    if (error) throw new Error(error.message);
    setProviders((prev) =>
      prev.map((p) => p.id === providerId ? { ...p, isVerified: false } : p)
    );
    setStats((prev) => ({ ...prev, pendingVerifications: prev.pendingVerifications + 1 }));
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase.from("users").delete().eq("id", userId);
    if (error) throw new Error(error.message);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return (
    <AdminContext.Provider value={{
      admin, users, providers, activityLogs, stats, isLoading,
      verifyProvider, unverifyProvider, deleteUser, refreshData: loadData,
    }}>
      {children}
    </AdminContext.Provider>
  );
};