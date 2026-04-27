export default function BillingSuccessPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">

      <div className="bg-zinc-900 border border-emerald-500/30 rounded-2xl p-10 max-w-md w-full text-center">

        <div className="w-14 h-14 mx-auto bg-emerald-500 rounded-full flex items-center justify-center mb-6">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <path
              d="M5 13l4 4L19 7"
              stroke="black"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-display mb-3">
          Payment Successful 🎉
        </h1>

        <p className="text-zinc-400 text-sm mb-6">
          Your subscription has been updated successfully.
          You now have access toGrowth features.
        </p>

        <a
          href="/dashboard"
          className="block bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 rounded-xl transition"
        >
          Go to Dashboard
        </a>

      </div>

    </div>
  );
}