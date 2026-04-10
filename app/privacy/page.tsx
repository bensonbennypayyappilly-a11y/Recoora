// app/privacy/page.tsx

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-8">

        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-zinc-500">
          Last updated: January 2026
        </p>

        <p className="text-zinc-400 text-sm leading-relaxed">
          Recoora ("we", "our", "us") provides real-time revenue monitoring and alerting
          services for SaaS businesses. This Privacy Policy explains how we collect,
          use, and protect your data.
        </p>

        <section>
          <h2 className="text-lg font-semibold">1. Information We Collect</h2>
          <p className="text-zinc-400 text-sm">
            We collect account information (email, name), and integration data required
            to operate the Service, including Stripe account identifiers and Slack tokens.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. Stripe & Payment Data</h2>
          <p className="text-zinc-400 text-sm">
            Payments are processed securely by Stripe. We do not store or process
            credit card data. We only access limited account metadata required
            to monitor events.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. Integration Permissions</h2>
          <p className="text-zinc-400 text-sm">
            Recoora accesses Stripe and Slack via OAuth. We only access data necessary
            to deliver alerts and do not modify or interfere with your billing systems.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Data Usage</h2>
          <p className="text-zinc-400 text-sm">
            Your data is used strictly to provide monitoring, alerting, and analytics.
            We do not sell or share your data with third parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. Data Storage & Security</h2>
          <p className="text-zinc-400 text-sm">
            Data is stored securely using Supabase infrastructure. We implement
            reasonable safeguards, but no system is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. Data Retention</h2>
          <p className="text-zinc-400 text-sm">
            Data is retained while your account is active. You may request deletion
            at any time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">7. Your Rights</h2>
          <p className="text-zinc-400 text-sm">
            You may request access, correction, or deletion of your data by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">8. Third-Party Services</h2>
          <p className="text-zinc-400 text-sm">
            Our service depends on third-party platforms (Stripe, Slack). We are not
            responsible for their data handling practices or outages.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">9. Contact</h2>
          <p className="text-zinc-400 text-sm">
            For privacy-related inquiries: recoora.ai@gmail.com
          </p>
        </section>

      </div>
    </div>
  );
}