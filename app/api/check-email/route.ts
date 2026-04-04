import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const { data: listData, error: lookupError } =
      await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });

    if (lookupError) {
      return NextResponse.json(
        { error: "Failed to verify account. Please try again." },
        { status: 500 }
      );
    }

    const exists = listData.users.some(
      (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
    );

    if (!exists) {
      return NextResponse.json(
        { error: "No account found with that email address." },
        { status: 404 }
      );
    }

    return NextResponse.json({ exists: true });
  } catch (err) {
    console.error("[check-email]", err);
    return NextResponse.json(
      { error: (err as Error).message ?? "Something went wrong." },
      { status: 500 }
    );
  }
}