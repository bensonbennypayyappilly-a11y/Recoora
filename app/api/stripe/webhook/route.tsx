import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) {
    console.error("❌ Missing Stripe signature");
    return new NextResponse("No signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("🔥 event.account:", event.account);
  } catch (err) {
    console.error("❌ Signature verification failed.", err);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  const eventType = event.type;
  console.log("📩 EVENT TYPE:", eventType);
  console.log("📩 EVENT ID:", event.id);

  const allowedEvents = [
    "invoice.payment_failed",
    "invoice.payment_succeeded",
    "customer.subscription.deleted",
    "checkout.session.completed",
  ];

  if (!allowedEvents.includes(eventType)) {
    console.log("⏭ Ignored event:", eventType);
    return NextResponse.json({ ignored: true });
  }

  const data = event.data.object as any;
  let invoiceId: string | null = null;

  if (eventType.startsWith("invoice.")) {
    invoiceId = data.id;
  }

  // ─── Deduplication ────────────────────────────────────────────────────────
  const { data: existingEvent } = await supabaseServer
    .from("stripe_events")
    .select("id")
    .eq("stripe_event_id", event.id)
    .maybeSingle();

  if (existingEvent) {
    console.log("⏭ Duplicate event, skipping:", event.id);
    return NextResponse.json({ duplicate: true });
  }

  // ─── Invoice-level deduplication (FIXES DOUBLE ALERTS) ───────────────────
  if (invoiceId) {
    const { data: existingInvoiceEvent } = await supabaseServer
      .from("stripe_events")
      .select("id, deleted_at")
      .eq("invoice_id", invoiceId)
      .maybeSingle();

    if (existingInvoiceEvent) {
      console.log("⏭ Duplicate invoice-level event, skipping:", invoiceId);
      return NextResponse.json({
        skipped: true,
        reason: "duplicate_invoice",
      });
    }
  }

  let failureReason: string | null = null;
  let failureCode: string | null = null;
  let productName: string | null = null;
  let amount: number | null = null;
  let customerEmail: string | null = null;
  let paymentType = "unknown";
  let paymentContext = "unknown";

  /* ================= PRODUCT ================= */
  try {
    if (data.lines?.data?.[0]?.pricing?.price_details?.product) {
      const product = await stripe.products.retrieve(
        data.lines.data[0].pricing.price_details.product
      );
      productName = product.name;
    }

    if (!productName && data.items?.data?.[0]?.price?.product) {
      const product = await stripe.products.retrieve(
        data.items.data[0].price.product
      );
      productName = product.name;
    }

    if (!productName && eventType === "checkout.session.completed") {
      const session = await stripe.checkout.sessions.retrieve(data.id, {
        expand: ["line_items.data.price.product"],
      });
      const productId = session.line_items?.data?.[0]?.price?.product;
      if (productId) {
        const product = await stripe.products.retrieve(productId as string);
        productName = product.name;
      }
    }
  } catch (e) {
    console.warn("⚠️ Product fetch failed:", e);
  }

  /* ================= AMOUNT ================= */
  if (eventType === "invoice.payment_succeeded") {
    amount = data.amount_paid;
    const billingReason = data.billing_reason;
    if (billingReason === "subscription_create") {
      paymentType = "🆕 New Subscription";
      paymentContext = "First payment from new customer";
    } else if (billingReason === "subscription_cycle") {
      paymentType = "🔁 Renewal";
      paymentContext = "Monthly recurring payment";
    } else if (billingReason === "subscription_update") {
      paymentType = "⚙️ Plan Change";
      paymentContext = "Upgrade or downgrade";
    } else {
      paymentType = "💰 Payment";
      paymentContext = billingReason || "Unknown";
    }
  } else if (eventType === "invoice.payment_failed") {
    amount = data.amount_due || data.amount_remaining;
    failureReason = data.last_payment_error?.message || "Payment failed";
    failureCode = data.last_payment_error?.code || "unknown";
  } else if (eventType === "customer.subscription.deleted") {
    amount = data.items?.data?.[0]?.price?.unit_amount || null;
  } else if (eventType === "checkout.session.completed") {
    amount = data.amount_total || null;
  }

  /* ================= EMAIL ================= */
  try {
    if (eventType === "checkout.session.completed") {
      customerEmail = data.customer_details?.email || null;
    }

    if (eventType.startsWith("invoice.")) {
      customerEmail = data.customer_email || data.customer?.email || null;
    }

    if (!customerEmail && data.customer) {
      const customerObj = await stripe.customers.retrieve(data.customer);
      if (!("deleted" in customerObj)) {
        customerEmail = (customerObj as Stripe.Customer).email;
      }
    }
  } catch (e) {
    console.warn("⚠️ Customer lookup failed:", e);
  }

  /* ================= SKIP DUPLICATE INVOICE ON SUBSCRIPTION DELETE ================= */
  if (eventType === "invoice.payment_succeeded") {
    const invoiceStatus = data.status;
    if (invoiceStatus === "void" || invoiceStatus === "uncollectible") {
      console.log("⏭ Skipping voided/uncollectible invoice:", invoiceStatus);
      return NextResponse.json({ skipped: true, reason: invoiceStatus });
    }

    const linkedSubId =
      data.subscription ||
      data.parent?.subscription_details?.subscription ||
      null;

    if (linkedSubId) {
      try {
        const sub = await stripe.subscriptions.retrieve(linkedSubId);
        if (sub.status === "canceled") {
          console.log("⏭ Skipping invoice.payment_succeeded — subscription canceled");
          return NextResponse.json({ skipped: true, reason: "subscription_canceled" });
        }
      } catch {
        console.log("⏭ Subscription not found (deleted), skipping invoice success");
        return NextResponse.json({ skipped: true, reason: "subscription_not_found" });
      }
    }
  }

  /* ================= ALERT CLASSIFICATION ================= */
  let alertLevel: "success" | "warning" | "critical" = "warning";
  let alertType: string = "unknown";

  if (eventType === "invoice.payment_succeeded") {
    alertLevel = "success";
    alertType = "revenue";
  } else if (eventType === "customer.subscription.deleted") {
    alertLevel = "critical";
    alertType = "churn";
  } else if (eventType === "invoice.payment_failed") {
    alertType = "payment_failed";
    const attemptCount = data.attempt_count || 1;
    if (attemptCount >= 3) alertLevel = "critical";
    else if (attemptCount === 2) alertLevel = "warning";
    else alertLevel = "warning";
  }

  /* ================= CUSTOMER RISK LEVEL ================= */
  let customerRiskLevel: "low" | "medium" | "high" = "low";

  if (eventType === "customer.subscription.deleted") {
    customerRiskLevel = "high";
  } else if (eventType === "invoice.payment_failed") {
    const attemptCount = data.attempt_count || 1;
    if (attemptCount >= 3) customerRiskLevel = "high";
    else if (attemptCount === 2) customerRiskLevel = "medium";
    else customerRiskLevel = "low";
  }

  /* ================= USER LOOKUP ================= */
  const stripeAccountId = event.account;

if (!stripeAccountId) {
  console.error("❌ Missing event.account — webhook not from connected account");
  return NextResponse.json({ error: "No account context" });
}

  const { data: user, error: userError } = await supabaseServer
    .from("users")
    .select("id, slack_connected, slack_access_token, slack_channel_id")
    .eq("stripe_account_id", stripeAccountId)
    .maybeSingle();

  if (userError) console.error("❌ User lookup error:", userError);
  console.log(
    "👤 USER:",
    user
      ? `id=${user.id} slack_connected=${user.slack_connected} channel=${user.slack_channel_id}`
      : "NOT FOUND"
  );

  /* ================= SUBSCRIPTION ID ================= */
  const subscriptionId =
    data.subscription ||
    data.subscription_id ||
    data.parent?.subscription_details?.subscription ||
    null;

  /* ================= DB INSERT ================= */
  const { error: dbError } = await supabaseServer.from("stripe_events").upsert({
    user_id: user?.id,
    stripe_event_id: event.id,
    stripe_account_id: stripeAccountId,
    event_type: eventType,
    customer_id: data.customer || null,
    customer_email: customerEmail,
    subscription_id: subscriptionId,
    amount: amount,
    currency: data.currency || null,
    action_status: "required",
    raw: event,
    plan_name: productName,
    invoice_id: invoiceId,
    attempt_count: data.attempt_count || null,
    alert_level: alertLevel,
    alert_type: alertType,
    failure_reason: failureReason,
    customer_risk_level: customerRiskLevel,
    failure_code: failureCode,
  });

  if (dbError) {
    console.error("❌ DB INSERT FAILED:", dbError);
    return NextResponse.json({ error: true });
  }
  console.log("✅ DB insert successful:", event.id);

  /* ================= SLACK GUARD ================= */
  if (!user) {
    console.warn("⚠️ No user found — skipping Slack. stripeAccountId:", stripeAccountId);
    return NextResponse.json({ success: true, slack: "skipped_no_user" });
  }
  if (!user.slack_connected) {
    console.warn("⚠️ Slack not connected for user:", user.id);
    return NextResponse.json({ success: true, slack: "skipped_not_connected" });
  }
  if (!user.slack_channel_id) {
    console.warn("⚠️ No slack_channel_id for user:", user.id);
    return NextResponse.json({ success: true, slack: "skipped_no_channel" });
  }
  if (!process.env.SLACK_BOT_TOKEN) {
    console.error("❌ SLACK_BOT_TOKEN not set in environment");
    return NextResponse.json({ success: true, slack: "skipped_no_token" });
  }

  /* ================= BLOCK BUILDERS ================= */
  const hasEmail = !!customerEmail;
  const emailLink = hasEmail
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(customerEmail!)}`
    : null;

  const buttonValue = JSON.stringify({ eventId: event.id });

  const buildActionBlocks = (title: string, body: string) => {
    const contentBlock = {
      type: "section",
      text: { type: "mrkdwn", text: `${title}\n\n${body}` },
    };

    if (hasEmail) {
      return [
        contentBlock,
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "📧 Contact Customer" },
              url: emailLink!,
              action_id: "contact_customer",
            },
            {
              type: "button",
              text: { type: "plain_text", text: "✅ Mark as Contacted" },
              style: "primary",
              value: buttonValue,
              action_id: "mark_contacted",
            },
          ],
        },
      ];
    } else {
      return [
        contentBlock,
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "⚠️ No email available to contact customer",
            },
          ],
        },
      ];
    }
  };

  const buildCleanBlocks = (title: string, body: string) => [
    {
      type: "section",
      text: { type: "mrkdwn", text: `${title}\n\n${body}` },
    },
  ];

  /* ================= DECISION ENGINE ================= */
  const customer = customerEmail || "Unknown";
  const amountFormatted = amount ? `$${(amount / 100).toFixed(2)}` : "$0.00";
  const productLine = productName ? `Product: ${productName}\n` : "";

  let slackPayload: any = null;

  if (eventType === "invoice.payment_failed") {
    const attempt = data.attempt_count || 1;
    const retryNote = `🔁 Attempt: ${attempt}`;
    let riskNote = "";
    if (attempt >= 3) riskNote = "⚠️ Final attempt failed — high churn risk";
    else if (attempt === 2) riskNote = "⚠️ Retry in progress — monitor closely";
    else riskNote = "⚠️ Initial failure";

    const body = `Customer: ${customer}
${productLine}Amount: ${amountFormatted}

Failure Reason: ${failureReason || "Unknown"}

${retryNote}
${riskNote}`;

    slackPayload = {
      text: "🚨 Payment Failed",
      blocks: buildActionBlocks(
        "🚨 *Payment Failed — Immediate Attention Required*",
        body
      ),
    };
  } else if (eventType === "customer.subscription.deleted") {
    slackPayload = {
      text: "💀 Subscription Cancelled",
      blocks: buildActionBlocks(
        "💀 *Customer Churn Detected*",
        `Customer: ${customer}\n${productLine}Revenue Lost: ${amountFormatted}`
      ),
    };
  } else if (eventType === "checkout.session.completed") {
    slackPayload = {
      text: "🆕 New Subscription",
      blocks: buildCleanBlocks(
        "🆕 *New Subscription*",
        `Customer: ${customer}\n${productLine}Amount: ${amountFormatted}\n\n📌 First payment via checkout`
      ),
    };
  } else if (eventType === "invoice.payment_succeeded") {
    slackPayload = {
      text: "💰 Payment Successful",
      blocks: buildCleanBlocks(
        "💰 *Payment Successful*",
        `*${paymentType}*

Customer: ${customer}
${productLine}Amount: ${amountFormatted}

📌 ${paymentContext}`
      ),
    };
  }

  console.log(
    "📤 slackPayload decision:",
    slackPayload ? slackPayload.text : "NULL — no payload built for " + eventType
  );

  /* ================= SEND TO SLACK ================= */
  if (slackPayload) {
    try {
      const slackRes = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: user.slack_channel_id,
          ...slackPayload,
        }),
      });

      const slackBody = await slackRes.json();
      console.log("🧪 Slack postMessage response:", JSON.stringify(slackBody, null, 2));

      if (!slackBody.ok) {
        console.error("❌ Slack send failed:", slackBody.error);
        if (slackBody.error === "not_in_channel")
          console.error("💡 Fix: Invite bot to channel", user.slack_channel_id);
        else if (slackBody.error === "channel_not_found")
          console.error("💡 Fix: Check slack_channel_id in DB for user", user.id);
        else if (slackBody.error === "invalid_auth")
          console.error("💡 Fix: SLACK_BOT_TOKEN is invalid or revoked");
      } else {
        const messageTs = slackBody.ts;
        const { error: tsUpdateError } = await supabaseServer
          .from("stripe_events")
          .update({
            slack_message_ts: messageTs,
            slack_channel_id: user.slack_channel_id,
          })
          .eq("stripe_event_id", event.id);

        if (tsUpdateError) {
          console.error("❌ Failed to save slack_message_ts to DB:", tsUpdateError);
          console.error("💡 Make sure columns slack_message_ts and slack_channel_id exist in stripe_events table");
        } else {
          console.log("✅ Saved slack_message_ts:", messageTs, "channel:", user.slack_channel_id);
        }
      }
    } catch (e) {
      console.error("❌ Slack postMessage exception:", e);
    }
  } else {
    console.warn("⚠️ No slackPayload for eventType:", eventType);
  }

  return NextResponse.json({ received: true });
}