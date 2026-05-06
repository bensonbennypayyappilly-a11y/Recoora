import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // ── 1. Verify authenticated user ──────────────────────────
    const cookieStore = await cookies();

    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (toSet) =>
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            ),
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // ── 2. Fetch user's subscription from DB ───────────────────
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: userData, error: dbError } = await supabaseAdmin
      .from("users")
      .select("paddle_subscription_id, subscription_status")
      .eq("id", userId)
      .single();

    if (dbError || !userData?.paddle_subscription_id) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    if (userData.subscription_status === "canceling") {
      return NextResponse.json(
        { error: "Subscription is already being canceled" },
        { status: 400 }
      );
    }

    const subscriptionId = userData.paddle_subscription_id;

    // ── 3. Paddle base URL (correct env handling) ──────────────
    const paddleBase =
      process.env.PADDLE_ENV === "live"
        ? "https://api.paddle.com"
        : "https://sandbox-api.paddle.com";

    console.log("🌍 Paddle Base:", paddleBase);
    console.log("🆔 Subscription:", subscriptionId);

    // ── 4. Call Paddle cancel API ──────────────────────────────
    const res = await fetch(
      `${paddleBase}/subscriptions/${subscriptionId}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          effective_from: "next_billing_period",
        }),
      }
    );

    const result = await res.json();
    console.log("📦 Paddle cancel response:", result);

    if (!res.ok) {
      console.error("❌ Paddle cancel failed:", result);
      return NextResponse.json(
        { error: "Cancel failed", details: result },
        { status: 500 }
      );
    }

    // ── 5. Do NOT update DB here ───────────────────────────────
    // Webhook handles all updates

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ Cancel route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}