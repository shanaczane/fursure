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
  if (body.name !== undefined) payload.name = body.name;
  if (body.dateGiven !== undefined) payload.date_given = body.dateGiven;
  if (body.nextDueDate !== undefined) payload.next_due_date = body.nextDueDate || null;
  if (body.notes !== undefined) payload.notes = body.notes || null;

  const { data, error } = await adminClient()
    .from("pet_vaccinations")
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
    .from("pet_vaccinations")
    .delete()
    .eq("id", recordId)
    .eq("added_by", "provider");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
