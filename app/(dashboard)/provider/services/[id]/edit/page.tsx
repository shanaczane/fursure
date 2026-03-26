"use client";

import { use } from "react";
import ServiceFormPage from "@/app/components/provider-dashboard/pages/ServiceFormPage";

export default function EditServiceRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ServiceFormPage serviceId={id} />;
}