import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 🔐 Get user's subscription
    const { data: user, error } = await supabase
      .from("users")
      .select("paddle_subscription_id")
      .eq("id", userId)
      .single();

    if (error || !user?.paddle_subscription_id) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    const subscriptionId = user.paddle_subscription_id;

    console.log("🔍 Canceling subscription:", subscriptionId);

    // ✅ CORRECT PADDLE CALL
    const res = await fetch(
      `https://api.paddle.com/subscriptions/${subscriptionId}/cancel`,
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
    console.log("📦 Paddle response:", result);

    if (!res.ok) {
      console.error("❌ Paddle error:", result);
      return NextResponse.json({ error: "Cancel failed" }, { status: 500 });
    }

    // ⚠️ Optional UX update (recommended)
    await supabase
      .from("users")
      .update({
        subscription_status: "canceling",
      })
      .eq("id", userId);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ Cancel API crash:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}