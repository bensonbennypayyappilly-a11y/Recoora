import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const secret = process.env.PADDLE_WEBHOOK_SECRET!;
    const signatureHeader = req.headers.get("paddle-signature");

    if (!signatureHeader) {
      return new NextResponse("Missing signature", { status: 400 });
    }

    const rawBody = await req.text();

    // ===== VERIFY SIGNATURE =====
    const parts = Object.fromEntries(
      signatureHeader.split(";").map((p) => p.split("="))
    );

    const ts = parts.ts;
    const receivedHash = parts.h1;

    const signedPayload = `${ts}:${rawBody}`;

    const expectedHash = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedHash, "hex"),
      Buffer.from(receivedHash, "hex")
    );

    if (!isValid) {
      console.error("❌ Invalid signature");
      return new NextResponse("Invalid signature", { status: 401 });
    }

    // ===== PARSE EVENT =====
    const event = JSON.parse(rawBody);
    const type = event.event_type;
    const data = event.data;

    const userId = data?.custom_data?.user_id;

    console.log("📩 Event:", type);
    console.log("👤 User:", userId);

    if (!userId) {
      console.warn("⚠️ Missing user_id");
      return NextResponse.json({ received: true });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let updateData: any = {};

    // =========================
    // ✅ PRIMARY SOURCE OF TRUTH
    // =========================
    if (type === "subscription.created") {
      updateData = {
        subscription_id: data.id,
        customer_id: data.customer_id,
        status: data.status, // active
        plan: data.items?.[0]?.price?.id,
      };

      console.log("🆕 Creating subscription:", updateData);
    }

    // =========================
    // 🔄 STATUS CHANGES
    // =========================
    if (type === "subscription.updated") {
      updateData = {
        status: data.status,
        plan: data.items?.[0]?.price?.id,
      };

      console.log("🔄 Subscription updated:", updateData);
    }

    if (type === "subscription.canceled") {
      updateData = {
        status: "canceled",
      };

      console.log("🚨 Subscription canceled");
    }

    // =========================
    // 💳 PAYMENT FAILURE
    // =========================
    if (type === "transaction.payment_failed") {
      updateData = {
        status: "past_due",
      };

      console.log("❌ Payment failed");
    }

    // =========================
    // ❌ IGNORE THIS (IMPORTANT)
    // =========================
    if (type === "transaction.completed") {
      console.log("⚠️ Ignored transaction.completed");
      return NextResponse.json({ received: true });
    }

    // =========================
    // 🚀 UPDATE DB
    // =========================
    if (Object.keys(updateData).length > 0) {
      const { data: updated, error } = await supabase
        .from("users") // ⚠️ confirm your table
        .update(updateData)
        .eq("id", userId) // ⚠️ confirm column
        .select();

      if (error) {
        console.error("❌ DB Error:", error);
      } else {
        console.log("✅ DB Updated:", updated);
      }
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error("❌ Webhook crash:", err);
    return new NextResponse("Webhook error", { status: 500 });
  }
}