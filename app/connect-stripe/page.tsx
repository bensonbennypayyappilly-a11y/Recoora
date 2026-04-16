"use client";

import { useState } from "react";

export default function ConnectStripePage() {
  const [connected, setConnected] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-12">

      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="font-display text-3xl mb-3">
            Connect Your Stripe Account
          </h1>
          <p className="text-zinc-400 text-sm">
            Recoora needs read-only access to monitor revenue,
            churn, and failed payments in real time.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-8">

          {/* Security Notice */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
            <div className="text-emerald-400 font-medium text-sm mb-1">
              🔐 Read-Only Access
            </div>
            <p className="text-zinc-400 text-xs">
              We cannot create charges, modify subscriptions,
              or access sensitive customer data.
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-8 space-y-3 text-sm text-zinc-300">
            <div>✓ Real-time revenue alerts</div>
            <div>✓ Failed payment detection</div>
            <div>✓ Churn spike monitoring</div>
            <div>✓ Subscription activity tracking</div>
          </div>

          {/* Connect Button */}
          <div className="flex justify-center">
            {!connected ? (
              <button
                onClick={() => setConnected(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-3 rounded-xl font-semibold transition-all"
              >
                Connect Stripe
              </button>
            ) : (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-6 py-3 rounded-xl font-medium">
                Stripe Connected ✓
              </div>
            )}
          </div>

          {/* Footer Trust */}
          <div className="mt-8 text-center text-zinc-500 text-xs">
            Powered by Stripe OAuth • Your data is encrypted at rest
          </div>

        </div>

        {/* Skip Option */}
        <div className="mt-6 text-center">
          <button className="text-zinc-500 text-sm hover:text-white transition">
            Skip for now →
          </button>
        </div>

      </div>

    </div>
  );
}