import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (code) {
    const { error } = await supabaseServer.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("❌ Auth exchange failed:", error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=auth`);
    }
  }

  // ✅ Redirect AFTER verification
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/email-verified`);
}