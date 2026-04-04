import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Runs server-side only — SERVICE_ROLE_KEY is never exposed to the client.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // Step 1: Confirm the email is actually registered.
    // getUserByEmail doesn't exist on this Supabase version — use listUsers
    // with a search filter instead, then match by email exactly.
    const { data: listData, error: lookupError } =
      await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (lookupError) {
      return NextResponse.json(
        { error: "Failed to verify account. Please try again." },
        { status: 500 }
      );
    }

    const user = listData.users.find(
      (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
    );

    // Hard block — if email not found, stop here. Password is never updated.
    if (!user) {
      return NextResponse.json(
        { error: "No account found with that email address." },
        { status: 404 }
      );
    }

    // Step 2: Email confirmed registered — update password via admin API.
    // No client session required.
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, { password });

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json(
      { error: (err as Error).message ?? "Something went wrong." },
      { status: 500 }
    );
  }
}