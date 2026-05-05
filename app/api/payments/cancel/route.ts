import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const { subscriptionId } = await req.json();

  const res = await fetch(
    `https://api.paddle.com/subscriptions/${subscriptionId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "canceled",
      }),
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Cancel failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}