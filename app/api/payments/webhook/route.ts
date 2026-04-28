import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") || "";

  const digest = crypto
    .createHmac("sha256", process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  if (digest !== signature) {
    console.error("❌ Invalid webhook signature");
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const type = event.meta.event_name;
  const data = event.data;

  const userId = data.attributes.custom_data?.user_id;

  if (!userId) {
    console.error("❌ Missing user_id");
    return NextResponse.json({ ignored: true });
  }

  console.log("📩 Webhook event:", type);

  switch (type) {
    case "subscription_created":
      await supabaseAdmin.from("users").update({
        provider: "lemon",
        lemon_subscription_id: data.id,
        subscription_status: "active",
        current_period_end: data.attributes.renews_at,
        plan: "starter",
      }).eq("id", userId);
      break;

    case "subscription_updated":
      await supabaseAdmin.from("users").update({
        subscription_status: data.attributes.cancelled
          ? "canceling"
          : data.attributes.status,
        current_period_end: data.attributes.renews_at,
      }).eq("id", userId);
      break;

    case "subscription_cancelled":
      await supabaseAdmin.from("users").update({
        subscription_status: "canceled",
        plan: "trial",
        lemon_subscription_id: null,
      }).eq("id", userId);
      break;

    case "subscription_payment_success":
      await supabaseAdmin.from("users").update({
        subscription_status: "active",
      }).eq("id", userId);
      break;

    case "subscription_payment_failed":
      await supabaseAdmin.from("users").update({
        subscription_status: "unpaid",
      }).eq("id", userId);
      break;
  }

  return NextResponse.json({ ok: true });
}