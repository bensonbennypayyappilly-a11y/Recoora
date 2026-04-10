import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  if (!user) {
    return NextResponse.redirect("/login");
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.STRIPE_CLIENT_ID!,
    scope: "read_write",
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/connect/callback`,
    state: user.id,
  });

  return NextResponse.redirect(
    `https://connect.stripe.com/oauth/authorize?${params.toString()}`
  );
}