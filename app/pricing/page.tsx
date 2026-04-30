export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-zinc-400">
            Start free. Upgrade when you see value.
          </p>
          <p className="text-green-400 mt-2 text-sm">
            14-day free trial — no credit card required
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* STARTER */}
          <div className="border border-zinc-800 rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-2">Starter</h2>
            <p className="text-3xl font-bold mb-4">$11<span className="text-sm text-zinc-400">/month</span></p>

            <p className="text-zinc-400 mb-6">
              Monitor and recover revenue in real-time
            </p>

            <ul className="space-y-3 text-sm">
              <li>✔ Real-time failed payment alerts</li>
              <li>✔ 2-click recovery emails (prefilled)</li>
              <li>✔ Churn & cancellation alerts</li>
              <li>✔ Slack notifications included</li>
              <li>✔ 1 Stripe account</li>
              <li>✔ 7-day alert history</li>
            </ul>

            <button className="mt-8 w-full bg-green-500 hover:bg-green-400 text-black py-3 rounded-lg font-semibold">
              Start 14-day free trial
            </button>

            <p className="text-xs text-zinc-500 mt-3 text-center">
              Setup in under 5 minutes
            </p>
          </div>

          {/* GROWTH */}
          <div className="border border-green-500 rounded-2xl p-8 relative">
            <span className="absolute top-4 right-4 text-xs bg-green-500 text-black px-2 py-1 rounded">
              Most Popular
            </span>

            <h2 className="text-xl font-semibold mb-2">Growth</h2>
            <p className="text-3xl font-bold mb-4">$29<span className="text-sm text-zinc-400">/month</span></p>

            <p className="text-zinc-400 mb-6">
              Everything in Starter + advanced recovery
            </p>

            <ul className="space-y-3 text-sm">
              <li>✔ Everything in Starter</li>
              <li>✨ AI-personalized recovery emails</li>
              <li>✔ Email + Slack notifications</li>
              <li>✔ 30-day alert history</li>
            </ul>

            <div className="mt-8 w-full bg-zinc-800 text-center py-3 rounded-lg text-zinc-400">
              Coming soon — Join waitlist
            </div>

            <p className="text-xs text-zinc-500 mt-3 text-center">
              Lock in early access pricing
            </p>
          </div>

        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center text-sm text-zinc-500">
          <p>
            Payments are securely handled by our payment provider.
          </p>
          <p className="mt-2">
            No long-term contracts. Cancel anytime.
          </p>
        </div>

      </div>
    </div>
  );
}