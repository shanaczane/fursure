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
  isRejected: boolean;
  rating: number;
  totalReviews: number;
  serviceCount: number;
  bookingCount: number;
  createdAt: string;
  contactLink?: string;
  validIdUrl?: string;
  credentialsUrl?: string;
}

export interface RawBookingRecord {
  id?: string;
  owner_id?: string;
  provider_id?: string | number;
  owner_name?: string;
  service_name?: string;
  provider_name?: string;
  status?: string;
  created_at?: string;
  rating?: number;
  review_comment?: string;
  review_date?: string;
  // camelCase aliases
  ownerName?: string;
  serviceName?: string;
  providerName?: string;
  reviewComment?: string;
  createdAt?: string;
}

export interface ActivityLog {
  id: string;
  type:
    | "booking"
    | "registration"
    | "verification"
    | "cancellation"
    | "service";
  description: string;
  userId?: string;
  userName?: string;
  createdAt: string;
}

export interface SystemStats {
  totalUsers: number;
  totalProviders: number;
  verifiedProviders: number;
  rejectedProviders: number;
  totalBookings: number;
  pendingVerifications: number;
  activeServices: number;
  completedBookings: number;
  cancelledBookings: number;
  ownerBookings: number;
  providerBookings: number;
}

interface AdminContextType {
  admin: AdminUser;
  users: UserRecord[];
  providers: ProviderRecord[];
  bookings: RawBookingRecord[];
  activityLogs: ActivityLog[];
  stats: SystemStats;
  isLoading: boolean;
  verifyProvider: (providerId: string) => Promise<void>;
  unverifyProvider: (providerId: string) => Promise<void>;
  rejectProvider: (providerId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdminContext = () => {
  const ctx = useContext(AdminContext);
  if (!ctx)
    throw new Error("useAdminContext must be used within AdminProvider");
  return ctx;
};

const EMPTY_STATS: SystemStats = {
  totalUsers: 0,
  totalProviders: 0,
  verifiedProviders: 0,
  rejectedProviders: 0,
  totalBookings: 0,
  pendingVerifications: 0,
  activeServices: 0,
  completedBookings: 0,
  cancelledBookings: 0,
  ownerBookings: 0,
  providerBookings: 0,
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser>({
    id: "",
    name: "Admin",
    email: "",
  });
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [providers, setProviders] = useState<ProviderRecord[]>([]);
  const [bookings, setBookings] = useState<RawBookingRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<SystemStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        setAdmin({
          id: authUser.id,
          name: authUser.user_metadata?.firstName
            ? `${authUser.user_metadata.firstName} ${authUser.user_metadata.lastName ?? ""}`.trim()
            : (authUser.email ?? "Admin"),
          email: authUser.email ?? "",
        });
      }

      const res = await fetch("/api/admin/data");
      const adminData = await res.json();
      const usersData = adminData.users ?? [];
      const providersData = adminData.providers ?? [];
      const servicesData = adminData.services ?? [];
      const bookingsData = adminData.bookings ?? [];

      const mappedUsers: UserRecord[] = usersData.map((u: any) => ({
        id: u.id,
        name: u.name ?? "Unknown",
        email: u.email ?? "",
        phone: u.phone ?? undefined,
        role: u.role ?? "owner",
        createdAt: u.created_at ?? new Date().toISOString(),
        bookingCount: bookingsData.filter((b: any) => b.owner_id === u.id).length,
      }));

      const mappedProviders: ProviderRecord[] = providersData.map((p: any) => ({
        id: String(p.id),
        userId: p.user_id,
        name: p.name ?? "Unknown",
        email: (p.users as any)?.email ?? "",
        businessName: p.name ?? "Unknown Business",
        isVerified: p.is_verified ?? false,
        isRejected: p.is_rejected ?? false,
        rating: p.rating ?? 0,
        totalReviews: p.reviews ?? 0,
        serviceCount: servicesData.filter(
          (s: any) => String(s.provider_id) === String(p.id),
        ).length,
        bookingCount: bookingsData.filter(
          (b: any) => b.provider_id === p.id,
        ).length,
        createdAt: p.created_at ?? new Date().toISOString(),
        contactLink: p.contact_link ?? undefined,
        validIdUrl: p.valid_id_url ?? undefined,
        credentialsUrl: p.credentials_url ?? undefined,
      }));

      // Build provider user ID set for quick lookup
      const providerUserIds = new Set(providersData.map((p: any) => p.user_id));

      // Bookings by owner (non-provider users)
      const ownerBookings = bookingsData.filter(
        (b: any) => b.owner_id && !providerUserIds.has(b.owner_id)
      ).length;

      // Bookings attributed to providers (as the service provider side)
      const providerBookings = bookingsData.filter(
        (b: any) => b.provider_id != null
      ).length;

      const logs: ActivityLog[] = [
        ...bookingsData.slice(0, 30).map((b: any) => ({
          id: b.id,
          type: (b.status === "cancelled"
            ? "cancellation"
            : "booking") as ActivityLog["type"],
          description: `Booking for "${b.service_name}" — ${b.status}`,
          userId: b.owner_id,
          userName: b.owner_name ?? "Pet Owner",
          createdAt: b.created_at,
        })),
        ...usersData.slice(0, 10).map((u: any) => ({
          id: `reg-${u.id}`,
          type: "registration" as ActivityLog["type"],
          description: `New user registered: ${u.name ?? u.email}`,
          userId: u.id,
          userName: u.name ?? u.email,
          createdAt: u.created_at,
        })),
      ]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 30);

      setUsers(mappedUsers);
      setProviders(mappedProviders);
      setBookings(bookingsData);
      setActivityLogs(logs);

      const completedBookings = bookingsData.filter(
        (b: any) => b.status === "completed",
      );

      // Only count providers with no verification decision yet (not verified AND not rejected)
      const pendingVerifications = mappedProviders.filter(
        (p) => !p.isVerified && !p.isRejected,
      ).length;

      setStats({
        totalUsers: mappedUsers.filter(u => u.role !== "admin").length,
        totalProviders: mappedProviders.length,
        verifiedProviders: mappedProviders.filter(p => p.isVerified).length,
        rejectedProviders: mappedProviders.filter(p => p.isRejected).length,
        totalBookings: bookingsData.length,
        pendingVerifications,
        activeServices: servicesData.filter((s: any) => s.is_active).length,
        completedBookings: completedBookings.length,
        cancelledBookings: bookingsData.filter(
          (b: any) => b.status === "cancelled",
        ).length,
        ownerBookings,
        providerBookings,
      });
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const callVerifyApi = async (
    providerId: string,
    action: "verify" | "unverify" | "reject",
  ) => {
    const res = await fetch("/api/admin/verify-provider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId, action }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Action failed");
  };

  const verifyProvider = async (providerId: string) => {
    await callVerifyApi(providerId, "verify");
    setProviders((prev) =>
      prev.map((p) =>
        p.id === providerId ? { ...p, isVerified: true, isRejected: false } : p,
      ),
    );
    setStats((prev) => ({
      ...prev,
      pendingVerifications: Math.max(0, prev.pendingVerifications - 1),
      verifiedProviders: prev.verifiedProviders + 1,
    }));
  };

  const unverifyProvider = async (providerId: string) => {
    await callVerifyApi(providerId, "unverify");
    setProviders((prev) =>
      prev.map((p) =>
        p.id === providerId
          ? { ...p, isVerified: false, isRejected: false }
          : p,
      ),
    );
    setStats((prev) => ({
      ...prev,
      pendingVerifications: prev.pendingVerifications + 1,
      verifiedProviders: Math.max(0, prev.verifiedProviders - 1),
    }));
  };

  const rejectProvider = async (providerId: string) => {
    await callVerifyApi(providerId, "reject");
    const wasVerified = providers.find(p => p.id === providerId)?.isVerified ?? false;
    setProviders((prev) =>
      prev.map((p) =>
        p.id === providerId ? { ...p, isVerified: false, isRejected: true } : p,
      ),
    );
    setStats((prev) => ({
      ...prev,
      rejectedProviders: prev.rejectedProviders + 1,
      verifiedProviders: wasVerified ? Math.max(0, prev.verifiedProviders - 1) : prev.verifiedProviders,
      // If it was pending (not verified, not rejected), pending count decreases
      pendingVerifications: !wasVerified ? Math.max(0, prev.pendingVerifications - 1) : prev.pendingVerifications,
    }));
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase.from("users").delete().eq("id", userId);
    if (error) throw new Error(error.message);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        users,
        providers,
        bookings,
        activityLogs,
        stats,
        isLoading,
        verifyProvider,
        unverifyProvider,
        rejectProvider,
        deleteUser,
        refreshData: loadData,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};