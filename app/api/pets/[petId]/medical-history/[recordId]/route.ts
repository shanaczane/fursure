import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Params = { params: Promise<{ petId: string; recordId: string }> };

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function PATCH(req: Request, { params }: Params) {
  const { recordId } = await params;
  const body = await req.json();

  const payload: Record<string, unknown> = {};
  if (body.diagnosis !== undefined) payload.diagnosis = body.diagnosis;
  if (body.treatment !== undefined) payload.treatment = body.treatment || null;
  if (body.prescription !== undefined) payload.prescription = body.prescription || null;
  if (body.notes !== undefined) payload.notes = body.notes || null;
  if (body.date !== undefined) payload.date = body.date;

  const { data, error } = await adminClient()
    .from("pet_medical_history")
    .update(payload)
    .eq("id", recordId)
    .eq("added_by", "provider")
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { recordId } = await params;

  const { error } = await adminClient()
    .from("pet_medical_history")
    .delete()
    .eq("id", recordId)
    .eq("added_by", "provider");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
