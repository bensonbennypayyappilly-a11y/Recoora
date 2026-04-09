 "use client";

export default function StripeConnectBanner({
  onConnect,
}: {
  onConnect: () => void;
}) {
  return (

    <div className="w-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border rounded-2xl border-emerald-500/30 p-6 overflow-hidden">

        {/* Glow effect */}
        <div className="absolute inset-0 bg-emerald-500/5 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          {/* Left Section */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">S</span>
              </div>

              <h3 className="font-display text-lg"> 
                Connect Your Stripe Account
              </h3>
            </div>

            <p className="text-zinc-400 text-sm max-w-lg">
              Start monitoring revenue, churn, failed payments and subscription activity
              in real-time. Secure read-only access via Stripe OAuth.
            </p>

            <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
              <span>✓ Read-only access</span>
              <span>✓ No billing control</span>
              <span>✓ Encrypted storage</span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex flex-col items-start md:items-end gap-3">

            <button
              onClick={onConnect}
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20"
            >
              Connect Stripe →
            </button>

            <span className="text-xs text-zinc-500">
              Takes less than 30 seconds
            </span>
          </div>

        </div>
      </div>
  );
}