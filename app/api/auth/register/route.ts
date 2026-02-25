import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// This replaces Express: POST /api/auth/register
export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, role } =
      await request.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Register with Supabase, storing metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { firstName, lastName, role: role || "PET_OWNER" },
      },
    });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      data: { userId: data.user?.id },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
