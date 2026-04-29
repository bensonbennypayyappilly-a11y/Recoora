import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";



export async function POST(req: Request) {

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

const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
  

  const { data } = await supabaseAdmin
    .from("users")
    .select("lemon_subscription_id")
    .eq("id", user.id)
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