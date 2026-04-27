import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  // ✅ VERIFY SIGNATURE
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error("❌ Signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {

      // ✅ SUBSCRIPTION CREATED / UPDATED
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;

        const customerId = subscription.customer as string;
        const userIdFromMeta = subscription.metadata?.user_id;

        // 🔥 Resolve user
        let userData = null;

        if (userIdFromMeta) {
          const { data } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("id", userIdFromMeta)
            .single();

          userData = data;
        }

        if (!userData) {
          const { data } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single();

          userData = data;
        }

        if (!userData) {
          console.error("❌ User not found:", customerId);
          break;
        }

        // ✅ Status logic
        let status: string = subscription.status;

        if (subscription.cancel_at_period_end) {
          status = "canceling";
        }

        // ✅ Period end
        const periodEnd =
          subscription.current_period_end != null
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null;

        // ✅ DB update
        await supabaseAdmin
          .from("users")
          .update({
            plan: "starter",
            subscription_status: status,
            stripe_subscription_id: subscription.id,
            current_period_end: periodEnd,
          })
          .eq("id", userData.id);

        break;
      }

      // ✅ PAYMENT SUCCESS
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;

        // 🔥 FIX: cast to any (Stripe typing issue)
        const subscriptionId = invoice.subscription;

        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;

        const userIdFromMeta = subscription.metadata?.user_id;
        const customerId = subscription.customer as string;

        let userData = null;

        if (userIdFromMeta) {
          const { data } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("id", userIdFromMeta)
            .single();

          userData = data;
        }

        if (!userData) {
          const { data } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single();

          userData = data;
        }

        if (!userData) break;

        await supabaseAdmin
          .from("users")
          .update({
            subscription_status: "active",
          })
          .eq("id", userData.id);

        break;
      }

      // ❌ PAYMENT FAILED
      case "invoice.payment_failed": {
        const invoice = event.data.object as any;

        const customerId = invoice.customer as string;

        const { data: userData } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (!userData) break;

        await supabaseAdmin
          .from("users")
          .update({
            subscription_status: "past_due",
          })
          .eq("id", userData.id);

        break;
      }

      // ❌ SUBSCRIPTION FULLY CANCELED
      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;

        const customerId = subscription.customer as string;
        const userIdFromMeta = subscription.metadata?.user_id;

        let userData = null;

        if (userIdFromMeta) {
          const { data } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("id", userIdFromMeta)
            .single();

          userData = data;
        }

        if (!userData) {
          const { data } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single();

          userData = data;
        }

        if (!userData) break;

        await supabaseAdmin
          .from("users")
          .update({
            subscription_status: "canceled",
            plan: null,
            stripe_subscription_id: null,
            current_period_end: null,
          })
          .eq("id", userData.id);

        break;
      }

      default:
        console.log(`ℹ️ Unhandled event: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (err: any) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}