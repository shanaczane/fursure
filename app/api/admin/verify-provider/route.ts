import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { providerId, action } = await request.json();

    if (!providerId || !action) {
      return NextResponse.json({ success: false, message: "providerId and action are required" }, { status: 400 });
    }

    if (!["verify", "unverify", "reject"].includes(action)) {
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }

    const update = action === "verify" ? { is_verified: true } : { is_verified: false };

    const { error, count } = await adminSupabase
      .from("providers")
      .update(update, { count: "exact" })
      .eq("id", providerId);

    if (error) {
      console.error("verify-provider DB error:", error.message);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    if (count === 0) {
      console.error("verify-provider: no rows updated for id:", providerId);
      return NextResponse.json({ success: false, message: `No provider found with id ${providerId}` }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("verify-provider error:", err);
    return NextResponse.json({ success: false, message: (err as Error).message }, { status: 500 });
  }
}
