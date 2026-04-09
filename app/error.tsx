"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6 relative overflow-hidden">

        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="text-center relative z-10 max-w-xl">

          {/* Error code */}
          <h1 className="font-display text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-zinc-500 bg-clip-text text-transparent">
            Something went wrong
          </h1>

          {/* Description */}
          <p className="text-zinc-400 mb-8 text-sm md:text-base">
            An unexpected error occurred. Don’t worry — our system
            is probably yelling at Stripe right now.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <button
              onClick={() => reset()}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-3 rounded-xl transition-all"
            >
              Try Again
            </button>

            <Link
              href="/dashboard"
              className="border border-black/15 hover:border-white/30 text-Black px-6 py-3 rounded-xl transition-all"
            >
              Go to Dashboard
            </Link>

          </div>

        </div>
      </body>
    </html>
  );
}