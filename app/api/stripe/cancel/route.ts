import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    // ── 1. Auth via Bearer token (sent by client) ──────────
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "No auth header" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // ── 2. Get subscription ID from DB ─────────────────────
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("stripe_subscription_id")
      .eq("id", user.id)
      .single();

    if (error || !data?.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    const subscriptionId = data.stripe_subscription_id;

    // ── 3. Cancel at period end via Stripe ─────────────────
    await stripe.subscriptions.update(subscriptionId, {
  cancel_at_period_end: true,
});

return NextResponse.json({ success: true });

    
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}