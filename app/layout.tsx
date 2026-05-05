import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script"; // ✅ ADD THIS

export const metadata: Metadata = {
  title: "Recoora — Real-Time Stripe Payment Failure Alerts for Founders",
  description:
    "Get instant Slack alerts when a payment fails or a subscription cancels.",
  metadataBase: new URL("https://recoora.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        
        {/* ✅ LOAD PADDLE */}
        <Script
          src="https://cdn.paddle.com/paddle/v2/paddle.js"
          strategy="beforeInteractive"
        />

        {/* ✅ INITIALIZE PADDLE */}
        <Script id="paddle-init" strategy="beforeInteractive">
          {`
            window.Paddle = window.Paddle || {};
            Paddle.Initialize({
              token: "${process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN}"
            });
          `}
        </Script>

        {children}
      </body>
    </html>
  );
}