"use client";

import { useState } from "react";

export default function UpgradeButton() {
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

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="mt-6 inline-block rounded-lg bg-green-500 px-6 py-3 font-semibold text-black hover:bg-green-400 transition disabled:opacity-50"
    >
      {loading ? "Redirecting..." : "Upgrade Now"}
    </button>
  );
}