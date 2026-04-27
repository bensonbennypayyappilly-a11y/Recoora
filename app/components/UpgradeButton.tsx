"use client";

import { useState } from "react";


type Plan   = "trial" | "starter" | "pro" | null;
type Status = string; // "active" | "canceled" | "canceling" | "past_due" | "incomplete" | "unpaid" | "inactive"

interface UpgradeButtonProps {
  plan:              Plan;
  status:            Status;
  subscriptionId:    string | null;
  cancelAtPeriodEnd: boolean;
}


const [localStatus, setLocalStatus] = useState<Status | null>(null);
const effectiveStatus = localStatus ?? status;

export default function UpgradeButton({
  plan,
  status,
  subscriptionId,
  cancelAtPeriodEnd,
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  // ── Redirect to Stripe Checkout ──────────────────────────
  const goToCheckout = async () => {
    if (loading) return; // prevent duplicate clicks
    setLoading(true);
    try {
      const res  = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create checkout session. Please try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────
  // CASE 1 — Active Starter subscription
  // Show "Upgrade to Pro (Coming Soon)" — no redirect to Stripe
  // ────────────────────────────────────────────────────────
  if (plan === "starter" && effectiveStatus === "active" && !cancelAtPeriodEnd) {
  return (
    
      <button
        onClick={() => alert("🚧 Pro plan coming soon. Stay tuned!")}
        className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-xl text-sm font-semibold"
      >
        Upgrade to Pro
      </button>
   
  );
}

  // ────────────────────────────────────────────────────────
  // CASE 2 — Canceling (scheduled to cancel at period end)
  // cancelAtPeriodEnd = true OR status = "canceling" (set by webhook)
  // Informational only — Cancel button is hidden in this state
  // ────────────────────────────────────────────────────────
if (effectiveStatus === "canceling") {
  return (
    <button
      disabled
      className="bg-zinc-800 text-zinc-400 border border-zinc-700 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed"
    >
      Cancels at Period End
    </button>
  );
}

  // ────────────────────────────────────────────────────────
  // CASE 3 — Subscription was canceled (fully ended)
  // Let the user reactivate with a new checkout
  // ────────────────────────────────────────────────────────
  if (status === "canceled") {
    return (
      <button
        onClick={goToCheckout}
        disabled={loading}
        className="bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Redirecting..." : "Reactivate Subscription"}
      </button>
    );
  }

  // ────────────────────────────────────────────────────────
  // CASE 4 — Payment failed (Stripe status: past_due)
  // User needs to update their payment method
  // ────────────────────────────────────────────────────────
  if (status === "past_due") {
    return (
      <button
        onClick={goToCheckout}
        disabled={loading}
        className="bg-rose-500 hover:bg-rose-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Redirecting..." : "Fix Payment"}
      </button>
    );
  }

  // ────────────────────────────────────────────────────────
  // CASE 5 — Incomplete or unpaid
  // Checkout was started but not completed, or first payment failed
  // ────────────────────────────────────────────────────────
  if (status === "incomplete" || status === "unpaid") {
    return (
      <button
        onClick={goToCheckout}
        disabled={loading}
        className="bg-orange-500 hover:bg-orange-400 text-black px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Redirecting..." : "Complete Payment"}
      </button>
    );
  }

  // ────────────────────────────────────────────────────────
  // DEFAULT — Trial (or any unrecognized state)
  // New user, start the Starter plan
  // ────────────────────────────────────────────────────────
  return (
    <button
      onClick={goToCheckout}
      disabled={loading}
      className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Redirecting..." : "Start Starter Plan"}
    </button>
  );
}