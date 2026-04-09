import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    // Exchange code for token
    const response = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code,
      }),
    });

    const data = await response.json();
    
    
    if (!data.ok) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    const accessToken = data.access_token;

   const teamId = data.team.id;

const channelId =
  data.incoming_webhook?.channel_id ||
  data.incoming_webhook?.channel ||
  null;

if (!channelId) {
  console.error("No channel selected during OAuth:", data);
  return NextResponse.json({ error: "No channel selected" }, { status: 400 });
}


    // Get logged-in user
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Store Slack token securely
    await supabaseServer
  .from("users")
  .update({
    slack_access_token: accessToken,
    slack_team_id: teamId,
    slack_connected: true,
    slack_channel_id: channelId,
  })
  .eq("id", user.id);

    // Send test message
    const slackRes = await fetch("https://slack.com/api/chat.postMessage", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    channel: channelId,
    text: "🚀 Revenue Radar connected.\n\nYou'll now receive real-time alerts here when:\n• Payments fail\n• Subscriptions cancel\n• Revenue drops\n\nStay sharp ⚡",
  }),
});

const slackData = await slackRes.json();

if (!slackData.ok) {
  console.error("Slack message failed:", slackData);
}

console.log("Slack connected for user:", user.id);
console.log("Slack response:", slackData);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?slack=connected`
    );

  } catch (error) {
    console.error("Slack OAuth error:", error);
    return NextResponse.json({ error: "OAuth failed" }, { status: 500 });
  }
}