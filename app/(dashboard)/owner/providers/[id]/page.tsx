"use client";

import { use } from "react";
import ProviderPublicProfilePage from "@/app/components/owner-dashboard/pages/ProviderPublicProfilePage";

export default function ProviderProfileRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProviderPublicProfilePage providerUserId={id} />;
}