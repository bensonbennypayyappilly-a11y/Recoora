import { NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";    
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    // 🔐 Get logged-in user
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
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  }
);

const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  return NextResponse.json({ error: "Not authenticated" });
}

    // 📦 Get subscription from DB
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("stripe_subscription_id")
      .eq("id", user.id)
      .single();
      
      console.log("USER ID:" , user?.id);
      console.log("DB DATA:", data);
      console.log("SUB ID:", data?.stripe_subscription_id);

    if (error || !data?.stripe_subscription_id) {
      return NextResponse.json({
        error: "No active subscription found",
      });
    }

    const subscriptionId = data.stripe_subscription_id;

    // 🔥 Cancel at period end
    const subscription = await stripe.subscriptions.update(
  subscriptionId,
  {
    cancel_at_period_end: true,
  }
);

    const periodEnd = (subscription as any).current_period_end;

    await supabaseAdmin
  .from("users")
  .update({
    subscription_status: "canceling",
    current_period_end: new Date(periodEnd * 1000).toISOString(),

    // 🔥 disconnect Stripe Connect
    
  })
  .eq("id", user.id);

    return NextResponse.json({
      success: true,
      current_period_end: new Date(periodEnd * 1000).toISOString(),
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" });
  }
}