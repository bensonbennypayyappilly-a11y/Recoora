export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-white text-zinc-900 px-6 py-20 overflow-hidden">

      {/* 🌿 Subtle emerald gradient */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto">

        <div className="mb-12">
          <h1 className="text-4xl font-semibold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-zinc-500 mt-2">
            Last updated: January 2026
          </p>
        </div>

        <div className="space-y-10 text-[15px] leading-relaxed text-zinc-700">

          <p>
            Recoora provides real-time revenue monitoring and alerting for SaaS businesses.
            This Privacy Policy explains how we collect, use, and protect your data.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">
              Information We Collect
            </h2>
            <p>
              We collect account information (such as email and name) and integration data
              required to operate the service, including Stripe account identifiers and Slack tokens.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">
              Stripe & Payment Data
            </h2>
            <p>
              Payments are processed securely via our payment provider. We do not store or handle credit card data.
              We only access limited metadata necessary for monitoring events.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">
              Integration Permissions
            </h2>
            <p>
              Recoora connects via OAuth to Stripe and Slack. We only access data required
              to deliver alerts and do not modify your systems.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">
              Data Usage
            </h2>
            <p>
              Data is used strictly to provide monitoring, alerts, and analytics.
              We do not sell or share your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">
              Data Storage & Security
            </h2>
            <p>
              Data is stored securely using modern infrastructure. While we implement safeguards,
              no system is completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">
              Data Retention
            </h2>
            <p>
              We retain data while your account is active. You may request deletion anytime.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">
              Third-Party Services
            </h2>
            <p>
              Our service depends on Stripe and Slack. We are not responsible for their
              availability or data practices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">
              Contact
            </h2>
            <p>
              For privacy inquiries: <span className="font-medium">recoora.ai@gmail.com</span>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}