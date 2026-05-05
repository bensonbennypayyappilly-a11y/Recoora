import crypto from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ✅ CRITICAL

export async function POST(req: Request) {
  try {
    const secret = process.env.PADDLE_WEBHOOK_SECRET!;
    const signatureHeader = req.headers.get("paddle-signature");

    console.log("🔐 HEADER:", signatureHeader);

    if (!signatureHeader) {
      return new NextResponse("Missing signature", { status: 400 });
    }

    const rawBody = await req.text();

    console.log("📦 RAW BODY:", rawBody);

    // 🔥 Parse signature
    const parts = Object.fromEntries(
      signatureHeader.split(";").map((p) => p.split("="))
    );

    const ts = parts.ts;
    const receivedHash = parts.h1;

    console.log("🕒 Timestamp:", ts);
    console.log("📥 Received Hash:", receivedHash);

    if (!ts || !receivedHash) {
      return new NextResponse("Invalid signature format", { status: 400 });
    }

    // 🔥 Create signed payload
    const signedPayload = `${ts}:${rawBody}`;

    const expectedHash = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex");

    console.log("📤 Expected Hash:", expectedHash);

    // 🔥 SAFE compare
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedHash, "hex"),
      Buffer.from(receivedHash, "hex")
    );

    console.log("✅ Signature valid:", isValid);

    if (!isValid) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    // =========================
    // 🎉 VERIFIED — PROCESS EVENT
    // =========================

    const event = JSON.parse(rawBody);
    const type = event.event_type;

    console.log("📩 Event:", type);

    const data = event.data;
    const userId = data?.custom_data?.user_id;

    console.log("👤 User ID:", userId);

    if (!userId) {
      console.warn("⚠️ No user_id in webhook");
      return NextResponse.json({ received: true });
    }

    // 💰 TRANSACTIONS
    if (type === "transaction.completed") {
      console.log("✅ Payment success for:", userId);
    }

    if (type === "transaction.payment_failed") {
      console.log("❌ Payment failed for:", userId);
    }

    // 📦 SUBSCRIPTIONS
    if (type === "subscription.created") {
      console.log("🆕 Subscription created");
    }

    if (type === "subscription.canceled") {
      console.log("🚨 Subscription canceled");
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error("❌ Webhook error:", err);
    return new NextResponse("Webhook error", { status: 500 });
  }
}