export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-8">

        <h1 className="text-3xl font-bold">Terms & Conditions</h1>
        <p className="text-sm text-zinc-500">
          Last updated: January 2026
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Revenue Radar (“Service”), you agree to be bound
            by these Terms. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Description of Service</h2>
          <p>
            Revenue Radar provides automated revenue monitoring and alerting
            services connected to third-party platforms including Stripe and Slack.
            We do not process payments on your behalf.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Account Registration</h2>
          <p>
            You must provide accurate information during registration. You are
            responsible for maintaining the confidentiality of your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Free Trial</h2>
          <p>
            Revenue Radar offers a 14-day free trial. We reserve the right to
            restrict or deny trial access if duplicate or abusive activity is detected.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Subscription & Billing</h2>
          <p>
            Paid subscriptions are billed monthly or annually via Stripe.
            By subscribing, you authorize recurring charges.
            You may cancel anytime. Cancellation becomes effective at the end
            of your billing cycle.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Third-Party Services</h2>
          <p>
            Our Service integrates with Stripe, Slack, and other third-party
            providers. We are not responsible for their performance or policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Limitation of Liability</h2>
          <p>
            Revenue Radar is provided “as is.” We are not liable for lost revenue,
            missed alerts, or business interruption.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Termination</h2>
          <p>
            We may suspend or terminate accounts that violate these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">9. Contact</h2>
          <p>
            For legal inquiries, contact: support@revenueradar.io
          </p>
        </section>

      </div>
    </div>
  );
}