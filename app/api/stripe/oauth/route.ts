import { NextResponse } from "next/server";

export async function GET() {

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.STRIPE_CLIENT_ID!,
    scope: "read_write",
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/oauth/callback`
  });

  return NextResponse.redirect(
    `https://connect.stripe.com/oauth/authorize?${params}`
  );
}