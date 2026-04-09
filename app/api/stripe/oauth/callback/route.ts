import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  try {

    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
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
     console.log("Stripe OAuth Response:", stripeData);        
    const stripeAccountId = stripeData.stripe_user_id;
    const accessToken = stripeData.access_token;
    const refreshToken = stripeData.refresh_token;
    const publishableKey = stripeData.stripe_publishable_key;
    const scope = stripeData.scope;

    const { data: { user } } = await supabaseServer.auth.getUser();

    if (user) {
      await supabaseServer
        .from("users")
        .update({
          stripe_account_id: stripeAccountId,
          stripe_access_token: accessToken,
          stripe_refresh_token: refreshToken,
          stripe_publishable_key: publishableKey,
          stripe_scope: scope,
          stripe_connected_at: new Date()
        })
        .eq("id", user.id);
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "OAuth failed" }, { status: 500 });
  }
}