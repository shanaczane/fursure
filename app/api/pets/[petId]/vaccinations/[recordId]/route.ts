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

  // ── When a provider records an overdue vaccination, the record was originally
  // added by the owner (added_by = "owner"), so we must NOT filter by added_by
  // here — we allow providers to update any vaccination record for the pet.
  // We also add is_verified and provider_name to the update payload if supplied.
  if (body.isVerified !== undefined) payload.is_verified = body.isVerified;
  if (body.providerName !== undefined) payload.provider_name = body.providerName || null;
  if (body.addedBy !== undefined) payload.added_by = body.addedBy;

  const { data, error } = await adminClient()
    .from("pet_vaccinations")
    .update(payload)
    .eq("id", recordId)
    .select()
    .maybeSingle(); // ← was .single(), which throws when 0 rows match

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Record not found or no rows updated." }, { status: 404 });

  return NextResponse.json({ data });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { recordId } = await params;

  const { error } = await adminClient()
    .from("pet_vaccinations")
    .delete()
    .eq("id", recordId)
    .eq("added_by", "provider"); // DELETE stays provider-only for safety

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}