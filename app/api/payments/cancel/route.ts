import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { subscriptionId, userId } = await req.json();

    if (!subscriptionId || !userId) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // =========================
    // 🔐 VERIFY OWNERSHIP
    // =========================
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("paddle_subscription_id")
      .eq("id", userId)
      .single();

    if (fetchError || !user) {
      console.error("❌ User fetch failed:", fetchError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.paddle_subscription_id !== subscriptionId) {
      console.error("🚨 Unauthorized cancel attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    console.log("✅ Ownership verified");

    // =========================
    // 🔥 CANCEL SUBSCRIPTION (PADDLE)
    // =========================
    const res = await fetch(
      `https://api.paddle.com/subscriptions/${subscriptionId}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await res.json();
    console.log("📦 Paddle response:", result);

    if (!res.ok) {
      console.error("❌ Paddle cancel failed:", result);
      return NextResponse.json({ error: "Cancel failed" }, { status: 500 });
    }

    // =========================
    // ⚠️ IMPORTANT NOTE
    // =========================
    // DO NOT update DB here.
    // Paddle webhook (subscription.canceled) will update DB.

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ Cancel API crash:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}