import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("paddle-signature") || "";

  const expected = crypto
    .createHmac("sha256", process.env.PADDLE_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  if (expected !== signature) {
    console.error("❌ Invalid Paddle signature");
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const type = event.event_type;
  const data = event.data;

  const userId = data.custom_data?.user_id;

  if (!userId) return NextResponse.json({ ignored: true });

  switch (type) {
    case "subscription.created":
      await supabaseAdmin.from("users").update({
        paddle_subscription_id: data.id,
        subscription_status: "active",
        plan: "starter",
        provider: "paddle",
      }).eq("id", userId);
      break;

    case "subscription.canceled":
      await supabaseAdmin.from("users").update({
        subscription_status: "canceled",
        plan: "trial",
        paddle_subscription_id: null,
      }).eq("id", userId);
      break;

    case "transaction.completed":
      await supabaseAdmin.from("users").update({
        subscription_status: "active",
      }).eq("id", userId);
      break;

    case "transaction.payment_failed":
      await supabaseAdmin.from("users").update({
        subscription_status: "unpaid",
      }).eq("id", userId);
      break;
  }

  return NextResponse.json({ ok: true });
}