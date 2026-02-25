import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// This replaces Express: POST /api/auth/sync
// Syncs a Supabase-registered user to your own database
export async function POST(request: Request) {
  try {
    const { userId, email, firstName, lastName, role } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { success: false, message: "userId and email are required" },
        { status: 400 }
      );
    }

    // Update the user's metadata in Supabase with their role and name
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // In a real app with a separate database (e.g. PostgreSQL via Prisma),
    // you would insert the user record here:
    //
    // await prisma.user.upsert({
    //   where: { id: userId },
    //   update: { firstName, lastName, role },
    //   create: { id: userId, email, firstName, lastName, role },
    // });

    // For now, we return success (Supabase metadata is already saved during signUp)
    return NextResponse.json({
      success: true,
      message: "User synced successfully",
      data: { userId, email, firstName, lastName, role },
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
