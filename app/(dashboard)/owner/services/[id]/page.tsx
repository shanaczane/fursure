"use client";

import { use } from "react";
import ServiceDetailPage from "@/app/components/owner-dashboard/pages/ServiceDetailPage";

export default function ServiceDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ServiceDetailPage serviceId={id} />;
}