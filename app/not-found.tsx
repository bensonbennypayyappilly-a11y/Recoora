"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-white flex items-center justify-center px-6 relative overflow-hidden">

      {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-400 blur-[300px] rounded-full pointer-events-none" />

      <div className="text-center relative z-10 max-w-xl">

        {/* 404 number */}
        <h1 className="font-display text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-zinc-500 bg-clip-text text-transparent">
          404
        </h1>

        {/* Heading */}
        <h2 className="font-display text-2xl md:text-3xl mb-4 bg-gradient-to-r from-emerald-400 to-zinc-500 bg-clip-text text-transparent">
          Page not found
        </h2>

        {/* Description */}
        <p className="text-zinc-400 mb-8 text-sm md:text-base">
          The page you’re looking for doesn’t exist or has been moved.
          Let’s get you back on track.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">

          <Link
            href="/dashboard"
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-3 rounded-xl transition-all"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/"
            className="border border-black/15 hover:border-black/30 text-black px-6 py-3 rounded-xl transition-all"
          >
            Back to Home
          </Link>

        </div>

      </div>
    </div>
  );
}