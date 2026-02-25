import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// This replaces Express: GET /api/auth/me
// Verifies the Supabase JWT token and returns the user from the database
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // Use Supabase admin client to verify the token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Return user data
    // In a real app, you'd query your database here for the full user profile
    // For now, we return the Supabase user data mapped to your User type
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.firstName || "",
        lastName: user.user_metadata?.lastName || "",
        role: user.user_metadata?.role || "PET_OWNER",
        isVerified: user.email_confirmed_at != null,
        createdAt: user.created_at,
        updatedAt: user.updated_at || user.created_at,
      },
    });
  } catch (error) {
    console.error("Auth /me error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
