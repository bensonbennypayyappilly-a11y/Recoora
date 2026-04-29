import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { checkBilling } from "@/lib/billingGuard";

export async function POST() {
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

const billing = await checkBilling(user.id);

// 🚫 Block if already active
if (billing.allowed && billing.user?.subscription_status === "active") {
  return NextResponse.json(
    { error: "Already subscribed" },
    { status: 400 }
  );
}

  const url = `https://checkout.lemonsqueezy.com/checkout/buy/${
    process.env.LEMON_SQUEEZY_VARIANT_ID
  }?checkout[email]=${user.email}&checkout[custom][user_id]=${user.id}`;

  return NextResponse.json({ url });
}