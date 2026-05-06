import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // ── 1. Verify the calling user is authenticated ──────────
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

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 2. Look up their subscription using their verified ID ─
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: userData, error: dbError } = await supabaseAdmin
      .from("users")
      .select("paddle_subscription_id, subscription_status")
      .eq("id", user.id)
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

    // ── 3. Cancel via Paddle ───────────────────────────────────
    // Sandbox: key must start with test_
    // Live:    key must be from live dashboard
    // Both:    key needs subscription:write permission
    const paddleBase = process.env.NODE_ENV === "production"
      ? "https://api.paddle.com"
      : "https://sandbox-api.paddle.com";

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

    if (!res.ok) {
      console.error("❌ Paddle cancel failed:", JSON.stringify(result));
      return NextResponse.json(
        { error: result?.error?.detail ?? "Cancel failed" },
        { status: res.status }
      );
    }

    // ── 4. Optimistic DB update ────────────────────────────────
    // Webhook will confirm this later via subscription.updated
    // We update here for immediate UI feedback only
    await supabaseAdmin
      .from("users")
      .update({ subscription_status: "canceling" })
      .eq("id", user.id);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ Cancel route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}