import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ petId: string }> }
) {
  const { petId } = await params;
  if (!petId) return NextResponse.json({ error: "Missing petId" }, { status: 400 });

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await adminSupabase
    .from("pet_vaccinations")
    .select("*")
    .eq("pet_id", petId)
    .order("date_given", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
