import { supabaseServer } from "@/lib/supabaseServer";

export async function checkBilling(userId: string) {
  const { data: user } = await supabaseServer
    .from("users")
    .select("plan, subscription_status, trial_ends_at, current_period_end")
    .eq("id", userId)
    .single();

  if (!user) return { allowed: false };

  const now = new Date();

  const isTrialValid =
    user.plan === "trial" &&
    user.trial_ends_at &&
    new Date(user.trial_ends_at) > now;

  const isActive = user.subscription_status === "active";

  const isCanceling =
    user.subscription_status === "canceling" &&
    user.current_period_end &&
    new Date(user.current_period_end) > now;

  const allowed = isActive || isTrialValid || isCanceling;

  return { allowed, user };
}