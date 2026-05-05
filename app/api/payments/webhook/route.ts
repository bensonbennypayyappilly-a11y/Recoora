import crypto from "crypto";
import { NextResponse } from "next/server";
// import { supabase } from "@/lib/supabase"; // adjust path

export async function POST(req: Request) {
  try {
    const secret = process.env.PADDLE_WEBHOOK_SECRET!;
    const signature = req.headers.get("paddle-signature");

    if (!signature) {
      return new NextResponse("Missing signature", { status: 400 });
    }

    const rawBody = await req.text();

    // ✅ Verify signature
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(rawBody);
    const digest = hmac.digest("hex");

    if (digest !== signature) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const type = event.event_type;

    console.log("📩 Event:", type);

    const data = event.data;
    const userId = data?.custom_data?.user_id;

    // ⚠️ Always guard
    if (!userId) {
      console.warn("No user_id in webhook");
      return NextResponse.json({ received: true });
    }

    // =========================
    // 💰 TRANSACTIONS
    // =========================

    if (type === "transaction.completed") {
      console.log("✅ Payment success");

      // await supabase.from("users").update({
      //   plan: "starter",
      //   subscription_status: "active",
      // }).eq("id", userId);
    }

    if (type === "transaction.payment_failed") {
      console.log("❌ Payment failed");

      // 🔥 YOUR CORE FEATURE
      // await supabase.from("alerts").insert({
      //   user_id: userId,
      //   type: "payment_failed",
      // });

      // 👉 Trigger Slack / Email here
    }

    // =========================
    // 📦 SUBSCRIPTIONS
    // =========================

    if (type === "subscription.created") {
      console.log("🆕 Subscription created");

      // await supabase.from("users").update({
      //   subscription_status: "active",
      // }).eq("id", userId);
    }

    if (type === "subscription.updated") {
      console.log("🔄 Subscription updated");

      // plan upgrade/downgrade
    }

    if (type === "subscription.canceled") {
      console.log("🚨 Subscription canceled");

      // await supabase.from("users").update({
      //   subscription_status: "canceled",
      // }).eq("id", userId);

      // 🔥 Trigger churn alert
    }

    if (type === "subscription.past_due") {
      console.log("⚠️ Past due");

      // 🔥 Early churn signal
    }

    if (type === "subscription.paused") {
      console.log("⏸ Subscription paused");
    }

    if (type === "subscription.resumed") {
      console.log("▶️ Subscription resumed");

      // await supabase.from("users").update({
      //   subscription_status: "active",
      // }).eq("id", userId);
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error("❌ Webhook error:", err);
    return new NextResponse("Webhook error", { status: 500 });
  }
}