import "./globals.css";
import type { Metadata } from "next";



export const metadata: Metadata = {
  title: "Recoora — Real-Time Stripe Payment Failure Alerts for Founders",
  description:
    "Get instant Slack alerts when a payment fails or a subscription cancels. Recover revenue in 2 clicks. Built for micro-SaaS founders. No engineering required.",
  metadataBase: new URL("https://recoora.vercel.app"),
  openGraph: {
    title: "Recoora — Stripe alerts when revenue breaks",
    description:
      "Real-time failed payment and churn alerts for SaaS founders. Slack notifications. 2-click recovery emails. 5-minute setup.",
    url: "https://recoora.vercel.app",
    siteName: "Recoora",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Recoora — Stripe revenue alert dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recoora — Know when your Stripe revenue breaks",
    description:
      "Instant Slack alerts for failed payments and cancellations. Recover in 2 clicks.",
    images: ["/og-image.png"],
  },
  keywords: [
    "Stripe alerts",
    "failed payment alerts",
    "Stripe webhook notifications",
    "SaaS churn alerts",
    "revenue monitoring",
    "micro SaaS tools",
    "Slack payment alerts",
  ],
  robots: {
    index: true,
    follow: true,
  },
};






export default function RootLayout({ children, }:
Readonly<{ children: React.ReactNode; }>) { return ( <html lang="en"> 

<body 
  className="antialiased" > {children} 
  </body> 
  </html> );
 }