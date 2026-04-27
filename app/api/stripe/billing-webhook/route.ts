{/* api/stripe/billing-webhook */}

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

  // Only handle platform events — ignore connected account events
  if (event.account) {
    return NextResponse.json({ ignored: true });
  }

  const eventType = event.type;
  // ADD THIS:
const data = event.data.object as any;

  // Resolve customer ID — it's always in data.customer for these event types
  const stripeCustomerId =
    typeof data.customer === "string" ? data.customer : null;

  if (!stripeCustomerId) {
    console.error("❌ No customer ID in event:", eventType);
    return NextResponse.json({ error: true });
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  if (!user) {
    console.error("❌ No user for customer:", stripeCustomerId);
    return NextResponse.json({ error: true });
  }

  

  
 if (eventType === "customer.subscription.updated") {
 const sub = data as Stripe.Subscription;

const rawSub = sub as any; // 👈 FIX TYPES HERE

const periodEnd =
  typeof rawSub.current_period_end === "number"
    ? rawSub.current_period_end
    : rawSub.items?.data?.[0]?.current_period_end ?? null;

  await supabaseAdmin
    .from("users")
    .update({
      subscription_status: sub.cancel_at_period_end
        ? "canceling"
        : sub.status,
      current_period_end: periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : null,
    })
    .eq("id", user.id);

    console.log("SUB UPDATE:", sub);
}

 if (eventType === "checkout.session.completed") {
  const session = data as Stripe.Checkout.Session;

  if (session.mode === "subscription") {
    const subscriptionId = session.subscription as string;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const periodEnd =
      typeof (subscription as any).current_period_end === "number"
        ? (subscription as any).current_period_end
        : null;

    await supabaseAdmin
      .from("users")
      .update({
        plan: "starter",
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        current_period_end: periodEnd
          ? new Date(periodEnd * 1000).toISOString()
          : null,
      })
      .eq("id", user.id);
  }
}
  // ── customer.subscription.updated ─────────────────────────
  // Fired when cancel_at_period_end changes, plan changes, etc.
  // Does NOT overwrite plan — webhook is only source of truth for status.
  if (eventType === "customer.subscription.updated") {
    const sub = data as Stripe.Subscription;

const periodEnd =
  typeof (sub as any).current_period_end === "number"
    ? (sub as any).current_period_end
    : null;

await supabaseAdmin
  .from("users")
  .update({
    subscription_status: sub.cancel_at_period_end
      ? "canceling"
      : sub.status,
    current_period_end: periodEnd
      ? new Date(periodEnd * 1000).toISOString()
      : null,
  })
  .eq("id", user.id);
  }

  // ── customer.subscription.deleted ─────────────────────────
  // Fires when subscription fully ends after period end.
  if (eventType === "customer.subscription.deleted") {
    await supabaseAdmin
      .from("users")
      .update({
        subscription_status: "canceled",
        plan: "trial",
        stripe_subscription_id: null,
        current_period_end: null,
      })
      .eq("id", user.id);
  }

  // ── invoice.payment_succeeded ──────────────────────────────
  if (eventType === "invoice.payment_succeeded") {
    await supabaseAdmin
      .from("users")
      .update({ subscription_status: "active" })
      .eq("id", user.id);
  }

  // ── invoice.payment_failed ─────────────────────────────────
  if (eventType === "invoice.payment_failed") {
    await supabaseAdmin
      .from("users")
      .update({ subscription_status: "past_due" })
      .eq("id", user.id);
  }

  return NextResponse.json({ received: true });
}