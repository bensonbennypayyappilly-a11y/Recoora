import LandingPage from "./LandingPage";

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Recoora",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Real-time Stripe payment failure and churn alerts for micro-SaaS founders. Get notified in Slack and recover revenue in 2 clicks.",
    offers: {
      "@type": "Offer",
      price: "11",
      priceCurrency: "USD",
    },
    url: "https://recoora.vercel.app",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}