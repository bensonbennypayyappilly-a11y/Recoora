import Script from "next/script";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>

        {/* ✅ Load Paddle */}
        <Script
          src="https://cdn.paddle.com/paddle/v2/paddle.js"
          strategy="afterInteractive"
          onLoad={() => {
            // @ts-ignore
            if (window.Paddle) {
              // @ts-ignore
              window.Paddle.Initialize({
                token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
              });
              console.log("✅ Paddle Initialized");
            }
          }}
        />

        {children}
      </body>
    </html>
  );
}