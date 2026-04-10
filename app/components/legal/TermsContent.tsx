export default function TermsContent() {
  return (
    <div className="space-y-8 text-[14px] leading-relaxed text-zinc-700">

      <section>
        <h2 className="text-base font-semibold text-zinc-900 mb-1">
          Acceptance
        </h2>
        <p>
          By using Recoora, you agree to these Terms. If you do not agree, do not use the Service.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900 mb-1">
          Service Description
        </h2>
        <p>
          Recoora provides real-time monitoring of Stripe events and delivers alerts via Slack and dashboard.
          We do not process payments or act as a financial intermediary.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900 mb-1">
          User Responsibility
        </h2>
        <p>
          You are responsible for your Stripe account, Slack setup, and actions taken based on alerts.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900 mb-1">
          Billing
        </h2>
        <p>
          Subscriptions are billed via Stripe. All payments are non-refundable unless required by law.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900 mb-1">
          Third-Party Dependencies
        </h2>
        <p>
          The Service depends on Stripe and Slack. We are not liable for outages or failures from these services.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900 mb-1">
          No Guarantees
        </h2>
        <p>
          We do not guarantee real-time delivery or accuracy of alerts. Delays or missed events may occur.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900 mb-1">
          Limitation of Liability
        </h2>
        <p>
          Recoora is not liable for revenue loss, missed alerts, or business interruption under any circumstances.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900 mb-1">
          Termination
        </h2>
        <p>
          We may suspend or terminate accounts for misuse or violations.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900 mb-1">
          Governing Law
        </h2>
        <p>
          These Terms are governed by applicable international laws.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900 mb-1">
          Contact
        </h2>
        <p>
          Legal inquiries: <span className="font-medium">recoora.ai@gmail.com</span>
        </p>
      </section>

    </div>
  );
}