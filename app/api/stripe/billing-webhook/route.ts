import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) {
    return new NextResponse("No signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_BILLING_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("❌ Billing webhook signature failed:", err);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  const eventType = event.type;
  const data = event.data.object as any;

  console.log("💳 BILLING EVENT:", eventType);

  /* =======================================================
     🔑 IMPORTANT: ONLY HANDLE PLATFORM EVENTS
  ======================================================= */

  if (event.account) {
    console.log("⏭ Skipping connected account event");
    return NextResponse.json({ ignored: true });
  }

  /* =======================================================
     🔍 GET USER FROM STRIPE CUSTOMER
  ======================================================= */

  let stripeCustomerId: string | null = null;

   if (typeof data.customer === "string") {
    stripeCustomerId = data.customer;
   }

  if (eventType === "checkout.session.completed") {
    stripeCustomerId = data.customer;
  }

  if (eventType.startsWith("invoice.")) {
    stripeCustomerId = data.customer;
  } 

  if (eventType.startsWith("customer.subscription")) {
    stripeCustomerId = data.customer;
  }

  if (!stripeCustomerId) {
    console.error("❌ No customer ID found");
    return NextResponse.json({ error: true });
  }

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  if (!user) {
    console.error("❌ No user for customer:", stripeCustomerId);
    return NextResponse.json({ error: true });
  }

  /* =======================================================
     🎯 HANDLE EVENTS
  ======================================================= */

 if (eventType === "customer.subscription.created") {
  await supabaseAdmin
    .from("users")
    .update({
      plan: "starter",
      stripe_subscription_id: data.id,
      subscription_status: data.status,
      current_period_end: new Date(data.current_period_end * 1000).toISOString(),
    })
    .eq("id", user.id);
}

  if (eventType === "invoice.payment_succeeded") {
    await supabaseAdmin
      .from("users")
      .update({
        subscription_status: "active",
      })
      .eq("id", user.id);
  }

  if (eventType === "invoice.payment_failed") {
    await supabaseAdmin
      .from("users")
      .update({
        subscription_status: "past_due",
      })
      .eq("id", user.id);
  }

  if (eventType === "customer.subscription.created") {
    await supabaseAdmin
      .from("users")
      .update({
        stripe_subscription_id: data.id,
        subscription_status: data.status,
        current_period_end: new Date(data.current_period_end * 1000).toISOString(),
      })
      .eq("id", user.id);
  }

  if (eventType === "customer.subscription.updated") {
    await supabaseAdmin
      .from("users")
      .update({
        subscription_status: data.status,
        current_period_end: new Date(data.current_period_end * 1000).toISOString(),
      })
      .eq("id", user.id);
  }

  if (eventType === "customer.subscription.deleted") {
    await supabaseAdmin
      .from("users")
      .update({
        subscription_status: "canceled",
        plan: "trial"
      })
      .eq("id", user.id);
  }

  return NextResponse.json({ received: true });
}