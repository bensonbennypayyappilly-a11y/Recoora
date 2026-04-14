import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const userId = url.searchParams.get("userId");

  // 🚨 REQUIRED: must have userId from frontend
  if (!userId) {
    console.error("❌ Missing userId in OAuth request");
    return NextResponse.redirect(
      new URL("/dashboard", process.env.NEXT_PUBLIC_APP_URL)
    );
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.STRIPE_CLIENT_ID!,
    scope: "read_write",
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/connect/callback`,
    state: JSON.stringify({ userId }),
  });

  const stripeUrl = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;

  return NextResponse.redirect(stripeUrl);
}