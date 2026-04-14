import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
    }

    // ✅ GET USER FIRST (FIXES YOUR ERROR)
    const {
      data: { user },
    } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ OPTIONAL: Validate state (basic protection)
    if (!state || state !== user.id) {
  console.error("❌ Invalid or missing state:", state);
  return NextResponse.json({ error: "Invalid state" }, { status: 400 });
}

    const tokenRes = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_secret: process.env.STRIPE_SECRET_KEY!,
        code,
      }),
    });

    const stripeData = await tokenRes.json();

   if (!stripeData.stripe_user_id || !stripeData.access_token) {
  console.error("❌ Invalid Stripe OAuth response:", stripeData);
  return NextResponse.json({ error: "Invalid Stripe response" }, { status: 400 });
}

    const stripeAccountId = stripeData.stripe_user_id;
const accessToken = stripeData.access_token;
const refreshToken = stripeData.refresh_token;

   const { error: updateError } = await supabaseServer
  .from("users")
  .update({
    stripe_account_id: stripeAccountId,
    stripe_access_token: accessToken,
    stripe_refresh_token: refreshToken,
  })
  .eq("id", user.id);

if (updateError) {
  console.error("Stripe connect DB error:", updateError);
  return NextResponse.json({ error: "DB update failed" }, { status: 500 });
}
      

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "OAuth failed" }, { status: 500 });
  }
}