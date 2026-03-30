import React from "react";
import { AdminProvider } from "@/app/components/admin-dashboard/context/AdminContext";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminProvider>{children}</AdminProvider>;
}