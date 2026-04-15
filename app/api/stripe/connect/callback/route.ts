import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";


export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
    }

    // ✅ GET USER FIRST (FIXES YOUR ERROR)
    const cookieStore = await cookies();



const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔥 IMPORTANT
);

   // ✅ OPTIONAL: Validate state (basic protection)
    let parsedStateUserId: string | null = null;

try {
  const parsed = JSON.parse(state || "{}");
  parsedStateUserId = parsed.userId;
} catch {
  console.error("❌ Failed to parse state");
}

if (!state || !parsedStateUserId) {
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

   const { error: updateError } = await supabase
  .from("users")
  .update({
    stripe_account_id: stripeAccountId,
    stripe_access_token: accessToken,
    stripe_refresh_token: refreshToken,
  })
  .eq("id", parsedStateUserId);

if (updateError) {
  console.error("❌ Failed to save Stripe account:", updateError);
  return NextResponse.json(
    { error: "Failed to save connection" },
    { status: 500 }
  );
}
      

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "OAuth failed" }, { status: 500 });
  }
}