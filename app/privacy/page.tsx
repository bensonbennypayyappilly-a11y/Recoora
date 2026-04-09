export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-8">

        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-zinc-500">
          Last updated: January 2026
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
          <p>
            We collect account information including name, email address,
            company name, and integration tokens required for the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Stripe & Payment Data</h2>
          <p>
            Payments are processed by Stripe. We do not store credit card
            information. Stripe handles all payment data securely.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Integration Data</h2>
          <p>
            We access limited read-only Stripe data to provide alerts.
            We do not modify billing or customer records.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. How We Use Data</h2>
          <p>
            Data is used solely to deliver revenue monitoring and alert services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Data Storage</h2>
          <p>
            Data is stored securely using Supabase infrastructure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Data Retention</h2>
          <p>
            We retain data as long as your account remains active.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Your Rights</h2>
          <p>
            You may request account deletion or data export by contacting support.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Contact</h2>
          <p>
            Privacy inquiries: support@revenueradar.io
          </p>
        </section>

      </div>
    </div>
  );
}