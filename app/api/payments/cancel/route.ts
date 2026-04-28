import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const { userId } = await req.json();

  const { data } = await supabaseAdmin
    .from("users")
    .select("lemon_subscription_id")
    .eq("id", userId)
    .single();

  const subscriptionId = data?.lemon_subscription_id;

  if (!subscriptionId) {
    return NextResponse.json({ error: "No subscription" }, { status: 404 });
  }

  await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        type: "subscriptions",
        id: subscriptionId,
        attributes: {
          cancel_at_period_end: true,
        },
      },
    }),
  });

  return NextResponse.json({ success: true });
}