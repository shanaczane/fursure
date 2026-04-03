import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Uses service role key to bypass RLS — admin-only actions
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

    const update =
      action === "verify"
        ? { is_verified: true }
        : { is_verified: false };

    const { error } = await adminSupabase
      .from("providers")
      .update(update)
      .eq("id", providerId);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("verify-provider error:", err);
    return NextResponse.json({ success: false, message: (err as Error).message }, { status: 500 });
  }
}
