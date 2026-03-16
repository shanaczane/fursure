import React from "react";
import { ProviderAppProvider } from "@/app/components/provider-dashboard/context/ProviderAppContext";

export default function ProviderDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProviderAppProvider>{children}</ProviderAppProvider>;
}
