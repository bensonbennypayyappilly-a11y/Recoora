import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      console.error("❌ No code returned from Stripe");
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
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

    console.log("🔥 Stripe OAuth Response:", stripeData);

    if (!stripeData.stripe_user_id) {
      console.error("❌ Missing stripe_user_id");
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
    }

    const stripeAccountId = stripeData.stripe_user_id;

    const {
      data: { user },
    } = await supabaseServer.auth.getUser();

    if (!user) {
      console.error("❌ No logged in user during OAuth");
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
    }

    const { error } = await supabaseServer
      .from("users")
      .update({
        stripe_account_id: stripeAccountId,
        stripe_access_token: stripeData.access_token,
        stripe_refresh_token: stripeData.refresh_token,
        stripe_publishable_key: stripeData.stripe_publishable_key,
        stripe_scope: stripeData.scope,
        stripe_connected_at: new Date(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("❌ DB update failed:", error);
    } else {
      console.log("✅ Stripe account saved:", stripeAccountId);
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
  } catch (err) {
    console.error("❌ OAuth failed:", err);
    return NextResponse.json({ error: "OAuth failed" }, { status: 500 });
  }
}