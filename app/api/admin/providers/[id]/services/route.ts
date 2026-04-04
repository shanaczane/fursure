import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // In Next.js 15 App Router, params is a Promise — always await it
    const { id: providerId } = await context.params;

    if (!providerId || providerId === "undefined") {
      return NextResponse.json(
        { success: false, message: "Provider ID is required" },
        { status: 400 }
      );
    }

    const { data: servicesData, error } = await adminSupabase
      .from("services")
      .select("id, provider_id, name, category, price, is_active, description")
      .eq("provider_id", providerId)
      .order("name", { ascending: true });

    if (error) {
      console.error("Provider services fetch error:", error.message);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      services: (servicesData ?? []).map((s: any) => ({
        id: String(s.id),
        name: s.name ?? "Unnamed Service",
        category: s.category ?? "General",
        price: s.price ?? 0,
        isActive: s.is_active ?? false,
        description: s.description ?? undefined,
      })),
    });
  } catch (err) {
    console.error("Provider services route error:", err);
    return NextResponse.json(
      { success: false, message: (err as Error).message },
      { status: 500 }
    );
  }
}