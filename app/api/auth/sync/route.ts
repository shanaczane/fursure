import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const {
      userId, email, firstName, lastName, role,
      validIdBase64, validIdExt,
      credentialsBase64, credentialsExt,
    } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ success: false, message: "userId and email are required" }, { status: 400 });
    }

    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    const dbRole = role === "SERVICE_PROVIDER" ? "provider" : "owner";

    // Upsert user row
    const { error: userError } = await adminSupabase
      .from("users")
      .upsert({ id: userId, name: fullName, email, role: dbRole }, { onConflict: "id" });

    if (userError) {
      return NextResponse.json({ success: false, message: userError.message }, { status: 500 });
    }

    if (dbRole === "provider") {
      // Upload documents server-side (service role bypasses storage RLS)
      let validIdUrl: string | undefined;
      let credentialsUrl: string | undefined;

      if (validIdBase64 && validIdExt) {
        const buffer = Buffer.from(validIdBase64, "base64");
        const path = `${userId}/valid-id.${validIdExt}`;
        const { error: upErr1 } = await adminSupabase.storage.from("provider-documents").upload(path, buffer, {
          contentType: validIdExt === "pdf" ? "application/pdf" : `image/${validIdExt}`,
          upsert: true,
        });
        if (upErr1) console.error("Valid ID upload error:", upErr1.message);
        else validIdUrl = adminSupabase.storage.from("provider-documents").getPublicUrl(path).data.publicUrl;
      }

      if (credentialsBase64 && credentialsExt) {
        const buffer = Buffer.from(credentialsBase64, "base64");
        const path = `${userId}/credentials.${credentialsExt}`;
        const { error: upErr2 } = await adminSupabase.storage.from("provider-documents").upload(path, buffer, {
          contentType: credentialsExt === "pdf" ? "application/pdf" : `image/${credentialsExt}`,
          upsert: true,
        });
        if (upErr2) console.error("Credentials upload error:", upErr2.message);
        else credentialsUrl = adminSupabase.storage.from("provider-documents").getPublicUrl(path).data.publicUrl;
      }

      // Upsert provider row
      const providerPayload: Record<string, unknown> = {
        user_id: userId,
        name: fullName,
        is_verified: false,
        rating: 0,
      };
      if (validIdUrl) providerPayload.valid_id_url = validIdUrl;
      if (credentialsUrl) providerPayload.credentials_url = credentialsUrl;

      const { error: providerError } = await adminSupabase
        .from("providers")
        .upsert(providerPayload, { onConflict: "user_id" });

      if (providerError) {
        return NextResponse.json({ success: false, message: providerError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: "User synced successfully" });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
