import { AppProvider } from "@/app/contexts/AppContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppProvider>{children}</AppProvider>;
}