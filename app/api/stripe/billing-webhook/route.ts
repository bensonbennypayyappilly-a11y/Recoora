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
  // =======================================================
// ✅ HANDLE CHECKOUT FIRST (CRITICAL FIX)
// =======================================================

if (event.type === "checkout.session.completed") {
  const data = event.data.object as any;

  const customerId = data.customer;
  const subscriptionId = data.subscription;
  const userId = data.metadata?.user_id;

  console.log("🔥 CHECKOUT SESSION:", {
    customerId,
    subscriptionId,
    userId,
  });

  if (!userId) {
    console.error("❌ Missing user_id in metadata");
    return NextResponse.json({ error: true });
  }

  await supabaseAdmin
    .from("users")
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plan: "starter",
      subscription_status: "active",
    })
    .eq("id", userId);

  return NextResponse.json({ success: true });
}
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

 let user = null;

// 🔥 PRIMARY: metadata (reliable)
const metadataUserId = data.metadata?.user_id;

if (metadataUserId) {
  const { data: metaUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("id", metadataUserId)
    .maybeSingle();

  user = metaUser;
}

// 🔁 FALLBACK: customer_id (legacy support)
if (!user && stripeCustomerId) {
  const { data: customerUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  user = customerUser;
}

if (!user) {
  console.error("❌ No user found (metadata + customer lookup failed)");
  return NextResponse.json({ error: true });
}

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
      current_period_end: data.current_period_end
  ? new Date(data.current_period_end * 1000).toISOString()
  : null,
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

   if (eventType === "customer.subscription.updated") {
  const isCanceling = data.cancel_at_period_end === true;

  let periodEnd = null;

  // ✅ Try direct value first
  if (data.current_period_end) {
    periodEnd = new Date(data.current_period_end * 1000).toISOString();
  } else {
    console.log("⚠️ Missing period_end → fetching from Stripe API");

    try {
    const subscription = await stripe.subscriptions.retrieve(
      data.id
) as unknown as Stripe.Subscription;
      const sub = subscription as any;

let rawPeriodEnd = sub.current_period_end;

// 🔥 Fallback to item level if missing
if (!rawPeriodEnd && sub.items?.data?.length > 0) {
  rawPeriodEnd = sub.items.data[0].current_period_end;
}

if (rawPeriodEnd) {
  periodEnd = new Date(rawPeriodEnd * 1000).toISOString();
}
    } catch (err) {
      console.error("❌ Failed to fetch subscription from Stripe:", err);
    }
  }

  console.log("📅 FINAL PERIOD END:", periodEnd);

  await supabaseAdmin
    .from("users")
    .update({
      subscription_status: isCanceling ? "canceling" : data.status,
      current_period_end: periodEnd,
    })
    .eq("id", user.id);
}
if (eventType === "customer.subscription.deleted") {
  console.log("🔥 SUBSCRIPTION FULLY CANCELED");

  await supabaseAdmin
    .from("users")
    .update({
      subscription_status: "canceled",

      // ✅ EMPTY STATE (NO TRIAL RESET)
      plan: null,

      // ✅ CLEANUP
      stripe_subscription_id: null,
      current_period_end: null,
    })
    .eq("id", user.id);
}
  return NextResponse.json({ received: true });
}