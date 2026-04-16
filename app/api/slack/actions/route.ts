import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";



export async function POST(req: Request) {
  try {
  const slackSigningSecret = process.env.SLACK_SIGNING_SECRET!;
const timestamp = req.headers.get("x-slack-request-timestamp") || "";
const slackSig = req.headers.get("x-slack-signature") || "";

// Reject requests older than 5 minutes (replay attack protection)
const reqTime = parseInt(timestamp, 10);
if (Math.abs(Date.now() / 1000 - reqTime) > 300) {
  return new NextResponse("Request too old", { status: 400 });
}

// Read raw body ONCE
const rawBody = await req.text();

const sigBasestring = `v0:${timestamp}:${rawBody}`;
const encoder = new TextEncoder();

const key = await crypto.subtle.importKey(
  "raw",
  encoder.encode(slackSigningSecret),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign"]
);

const signatureBuffer = await crypto.subtle.sign(
  "HMAC",
  key,
  encoder.encode(sigBasestring)
);

const computedSig =
  "v0=" +
  Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

if (computedSig !== slackSig) {
  return new NextResponse("Invalid signature", { status: 401 });
}
  

 let payloadRaw: string | null = null;

try {
  const params = new URLSearchParams(rawBody);
  payloadRaw = params.get("payload");

  if (!payloadRaw) {
    console.error("❌ payload missing from Slack request");
    return new NextResponse("Bad Request", { status: 400 });
  }
} catch (e) {
  console.error("❌ Failed to parse Slack payload:", e);
  return new NextResponse("Bad Request", { status: 400 });
}

// ─── Parse JSON ───────────────────────────────────────────
let payload: any;

try {
  payload = JSON.parse(payloadRaw);
} catch (e) {
  console.error("❌ Failed to JSON.parse Slack payload:", e);
  console.error("Raw value was:", payloadRaw.substring(0, 200));
  return new NextResponse("Bad Request", { status: 400 });
}

  // Slack URL verification (needed when first registering the endpoint)
  if (payload.type === "url_verification") {
    console.log("🔗 Slack URL verification challenge");
    return NextResponse.json({ challenge: payload.challenge });
  }

  console.log("📩 Slack action type:", payload.type);
  console.log("📩 Action ID:", payload.actions?.[0]?.action_id);
  console.log("📩 Action value (raw):", payload.actions?.[0]?.value);
  console.log("📩 Message TS:", payload.message?.ts);
  console.log("📩 Channel ID:", payload.channel?.id);

  const action = payload.actions?.[0];
  if (!action) {
    console.warn("⚠️ No actions array in payload");
    return NextResponse.json({ ok: true });
  }

  const actionId: string = action.action_id;
  console.log("🎯 Processing actionId:", actionId);

  // ─── MARK AS CONTACTED ────────────────────────────────────────────────────
  if (actionId === "mark_contacted") {

    /* Step 1 — Parse eventId from button value */
    let eventId: string | null = null;
let userId: string | null = null;

try {
let parsed: any;

try {
  parsed = action.value ? JSON.parse(action.value) : {};
} catch (e) {
  console.error("❌ Invalid JSON in action.value:", action.value);
  return NextResponse.json({ ok: true });
}
  eventId = parsed.eventId || null;
  userId = parsed.user_id || null;

  console.log("✅ Parsed eventId:", eventId);
  console.log("✅ Parsed userId:", userId);

} catch (e) {
      console.error("❌ JSON.parse(action.value) failed.");
      console.error("   action.value was:", action.value);
      console.error("   Error:", e);
      // Return 200 so Slack doesn't show an error to the user
      return NextResponse.json({ ok: true, error: "value_parse_failed" });
    }
    if (!userId) {
  console.error("❌ user_id missing in action.value");
  return NextResponse.json({ ok: true, error: "missing_user_id" });
}

    if (!eventId) {
      console.error("❌ eventId is null or undefined after parsing. action.value:", action.value);
      return NextResponse.json({ ok: true, error: "missing_event_id" });
    }
    const slackUserId = payload.user?.id;

const { data: user } = await supabaseServer
  .from("users")
  .select("id, slack_access_token")
  .eq("id", userId)
  .eq("slack_connected", true)
  .maybeSingle();

  if (!user) {
  console.error("❌ No user found for Slack payload");
  return NextResponse.json({ ok: true });
}

    /* Step 2 — Fetch current DB row for this event */
    const { data: eventRow, error: fetchError } = await supabaseServer
  .from("stripe_events")
  .select("id, slack_message_ts, slack_channel_id, action_status, user_id")
  .eq("stripe_event_id", eventId)
  .maybeSingle();

    if (fetchError) {
      console.error("❌ DB fetch error for eventId:", eventId, fetchError);
    }

    console.log(
      "📦 DB row found:",
      eventRow
        ? `id=${eventRow.id} | ts=${eventRow.slack_message_ts} | channel=${eventRow.slack_channel_id} | status=${eventRow.action_status}`
        : "ROW NOT FOUND — check stripe_event_id match"
    );

    if (!eventRow) {
      console.error("❌ No DB row found for stripe_event_id:", eventId);
      console.error("💡 Check that the webhook stored this event correctly");
      return NextResponse.json({ ok: true, error: "event_not_found" });
    }

   /* Step 3 — Update action_status in DB */
const { data: updatedRows, error: dbUpdateError } = await supabaseServer
  .from("stripe_events")
  .update({ action_status: "contacted_slack" })
  .eq("stripe_event_id", eventId)
  .select();

if (dbUpdateError) {
  console.error("❌ DB update FAILED:", dbUpdateError);
} else if (!updatedRows || updatedRows.length === 0) {
  console.error("❌ DB update matched 0 rows for:", eventId);
} else {
  console.log("✅ DB updated:", updatedRows[0].id);
}
      

    /* Step 4 — Resolve Slack channel + ts
       Primary source: DB (saved by webhook after postMessage)
       Fallback: Slack payload itself (always present in button click payloads) */
    const slackChannel =
  eventRow?.slack_channel_id || payload.channel?.id || null;

const slackTs =
  eventRow?.slack_message_ts || payload.message?.ts || null;

    console.log("📬 Slack update target — channel:", slackChannel, "| ts:", slackTs);

    if (!slackChannel || !slackTs) {
      console.error(
        "❌ Cannot update Slack message — channel or ts is missing.",
        "\n   DB slack_channel_id:", eventRow.slack_channel_id,
        "\n   DB slack_message_ts:", eventRow.slack_message_ts,
        "\n   Payload channel.id:", payload.channel?.id,
        "\n   Payload message.ts:", payload.message?.ts,
        "\n💡 If DB values are null, the webhook failed to save them after postMessage."
      );
      return NextResponse.json({ ok: true, error: "missing_slack_refs" });
    }

    
    /* Step 5 — Build updated blocks
       Take the original message blocks from the Slack payload,
       remove the actions block (buttons), add "✅ Contacted" context */
    const originalBlocks: any[] = payload.message?.blocks || [];
    console.log("📐 Original block count:", originalBlocks.length);

    const blocksWithoutActions = originalBlocks.filter(
      (block: any) => block.type !== "actions"
    );

    const updatedBlocks = [
      ...blocksWithoutActions,
      {
        type: "divider",
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "✅ Contacted",
          },
        ],
      },
    ];

    console.log("📐 Updated block count:", updatedBlocks.length);

    /* Step 6 — Call chat.update */
    try {
      const updateRes = await fetch("https://slack.com/api/chat.update", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.slack_access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: slackChannel,
          ts: slackTs,
          text: payload.message?.text || "Updated",
          blocks: updatedBlocks,
        }),
      });

      const updateBody = await updateRes.json();
      console.log("🧪 Slack chat.update response:", JSON.stringify(updateBody, null, 2));

      if (!updateBody.ok) {
        console.error("❌ Slack chat.update failed:", updateBody.error);
        if (updateBody.error === "message_not_found")
          console.error("💡 ts or channel is wrong. ts:", slackTs, "channel:", slackChannel);
        else if (updateBody.error === "cant_update_message")
          console.error("💡 Bot doesn't own this message, or it was sent by a different token");
        else if (updateBody.error === "invalid_auth")
          console.error("💡 SLACK_BOT_TOKEN is invalid or revoked");
        else if (updateBody.error === "channel_not_found")
          console.error("💡 Bot is not in channel:", slackChannel);
      } else {
        console.log("✅ Slack message updated — buttons removed, Contacted shown");
      }
    } catch (e) {
      console.error("❌ Slack chat.update exception:", e);
    }
  }

  // Always return 200 — Slack requires this within 3 seconds
  return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("🔥 SLACK ACTION CRASH:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

 