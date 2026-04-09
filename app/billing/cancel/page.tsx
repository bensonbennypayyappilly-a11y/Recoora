export default function BillingCancelPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">

      <div className="bg-zinc-900 border border-rose-500/30 rounded-2xl p-10 max-w-md w-full text-center">

        <div className="w-14 h-14 mx-auto bg-rose-500 rounded-full flex items-center justify-center mb-6">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="black"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-display mb-3">
          Payment Cancelled
        </h1>

        <p className="text-zinc-400 text-sm mb-6">
          Your payment was not completed.
          You can try again anytime.
        </p>

        <div className="flex gap-4">

          <a
            href="/settings"
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 rounded-xl transition text-center"
          >
            Try Again
          </a>

          <a
            href="/dashboard"
            className="flex-1 border border-white/15 py-3 rounded-xl text-center"
          >
            Dashboard
          </a>

        </div>

      </div>

    </div>
  );
}