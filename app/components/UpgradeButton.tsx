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

  const isStarter = plan === "starter";

  // ✅ 1. REACTIVATE (HIGHEST PRIORITY)
  if (status === "canceled") {
    return (
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="mt-6 inline-block rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-black hover:bg-yellow-400 transition"
      >
        {loading ? "Redirecting..." : "Reactivate Account"}
      </button>
    );
  }

  // ✅ 2. CANCELING STATE (OPTIONAL BUT CORRECT)
  if (status === "canceling") {
    return (
      <button
        disabled
        className="mt-6 inline-block rounded-lg bg-gray-600 px-6 py-3 font-semibold text-white opacity-50"
      >
        Canceling… Active until period end
      </button>
    );
  }

  // ✅ 3. ACTIVE STARTER
  if (isStarter && status === "active") {
    return (
      <button
        disabled
        className="mt-6 inline-block rounded-lg bg-gray-600 px-6 py-3 font-semibold text-white opacity-50 cursor-not-allowed"
      >
        Upgrade to Pro (Coming Soon)
      </button>
    );
  }

  // ✅ 4. DEFAULT → TRIAL OR EMPTY
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