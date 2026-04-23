"use client";

import { useState } from "react";

export default function UpgradeButton({
  plan,
  status,
}: {
  plan: string | null;
  status: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create checkout session.");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 1. ACTIVE STARTER (REAL SUBSCRIPTION)
if (status === "active" && plan === "starter") {
  return (
    <button disabled className="...">
      Current Plan (Starter)
    </button>
  );
}

// ✅ 2. REACTIVATE (CANCELED BUT HAD SUB)
if (status === "canceled") {
  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="mt-6 inline-block rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-black hover:bg-yellow-400 transition"
    >
      {loading ? "Redirecting..." : "Reactivate Subscription"}
    </button>
  );
}

// ✅ 3. PAST DUE (FAILED PAYMENT)
if (status === "past_due") {
  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="mt-6 inline-block rounded-lg bg-red-500 px-6 py-3 font-semibold text-black hover:bg-red-400 transition"
    >
      {loading ? "Redirecting..." : "Fix Payment"}
    </button>
  );
}

// ✅ 4. DEFAULT → NEW USER / TRIAL / NO PLAN
return (
  <button
    onClick={handleUpgrade}
    disabled={loading}
    className="mt-6 inline-block rounded-lg bg-green-500 px-6 py-3 font-semibold text-black hover:bg-green-400 transition disabled:opacity-50"
  >
    {loading ? "Redirecting..." : "Start Starter Plan"}
  </button>
);
}