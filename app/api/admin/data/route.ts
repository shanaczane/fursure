import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const [
      { data: usersData },
      { data: providersData },
      { data: servicesData },
      { data: bookingsData },
    ] = await Promise.all([
      adminSupabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false }),
      adminSupabase
        .from("providers")
        .select("*, users(email), valid_id_url, credentials_url")
        .order("created_at", { ascending: false }),
      // Fetch full service fields so serviceCount and drawer both work correctly
      adminSupabase
        .from("services")
        .select("id, provider_id, name, category, price, is_active, description"),
      adminSupabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    return NextResponse.json({
      success: true,
      users: usersData ?? [],
      providers: providersData ?? [],
      services: servicesData ?? [],
      bookings: bookingsData ?? [],
    });
  } catch (err) {
    console.error("Admin data fetch error:", err);
    return NextResponse.json(
      { success: false, message: (err as Error).message },
      { status: 500 }
    );
  }
}