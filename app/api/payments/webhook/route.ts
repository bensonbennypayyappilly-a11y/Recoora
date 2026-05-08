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

    // =========================
    // 🔐 VERIFY SIGNATURE
    // =========================
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

    // =========================
    // 📦 PARSE EVENT
    // =========================
    const event = JSON.parse(rawBody);
    const type = event.event_type;
    const data = event.data;

    const userId = data?.custom_data?.user_id;

    console.log("📩 Event:", type);
    console.log("👤 User ID:", userId);

    if (!userId) {
      console.warn("⚠️ Missing user_id");
      return NextResponse.json({ received: true });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // =========================
    // 🧠 BUILD UPDATE DATA
    // =========================
    let updateData: any = {};

    const planName = data?.items?.[0]?.product?.name || null;

    // ✅ MAIN EVENT (PRIMARY SOURCE)
    if (type === "subscription.created") {
  updateData = {
    paddle_subscription_id: data.id,
    paddle_customer_id: data.customer_id,
    plan: planName,
    subscription_status: data.status || "active",

    // ✅ ADD THIS
    current_period_end: data?.current_billing_period?.ends_at || null,
  };

  console.log("🆕 Subscription created:", updateData);
}

    // 🔄 PLAN OR STATUS CHANGE
   else if (type === "subscription.updated") {
  const isCancelScheduled = data?.scheduled_change?.action === "cancel";

  updateData = {
    plan: planName,
    subscription_status: isCancelScheduled
      ? "canceling"
      : data.status,

    // ✅ ADD THIS
    current_period_end: data?.current_billing_period?.ends_at || null,
  };

  console.log("🔄 Subscription updated:", updateData);
}

    // ❌ CANCELLED
    else if (type === "subscription.canceled") {
  updateData = {
    subscription_status: "canceled",
    current_period_end: null, // optional cleanup
  };

  console.log("🚨 Subscription canceled");
}

    // 💳 PAYMENT FAILED
    else if (type === "transaction.payment_failed") {
      updateData = {
        subscription_status: "past_due",
      };

      console.log("❌ Payment failed");
    }

    // 🚫 IGNORE DUPLICATE EVENT
    else if (type === "transaction.completed") {
      console.log("⚠️ Ignored transaction.completed");
      return NextResponse.json({ received: true });
    }

    // 🚫 Ignore everything else
    else {
      console.log("⚠️ Ignored event:", type);
      return NextResponse.json({ received: true });
    }

    // =========================
    // 🧪 DEBUG USER EXISTS
    // =========================
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    console.log("🔍 Existing user:", existingUser);
    console.log("❌ Fetch error:", fetchError);

    // =========================
    // 🚀 UPDATE DB
    // =========================
    console.log("🧠 Updating user:", userId);
    console.log("📝 Payload:", updateData);

    const { data: updated, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select();

    console.log("📊 Rows updated:", updated?.length);
    console.log("❌ Update error:", error);

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error("❌ Webhook crash:", err);
    return new NextResponse("Webhook error", { status: 500 });
  }
}