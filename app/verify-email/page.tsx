"use client";

import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-[0_4px_40px_rgba(0,0,0,0.08)] border border-zinc-100 p-10 text-center">

          <h1 className="text-2xl font-bold text-zinc-900 mb-4">
            Check your inbox 📩
          </h1>

          <p className="text-sm text-zinc-500 mb-6">
            A verification email has been sent.
            Please click the link inside your email to activate your account.
          </p>

          <Link
            href="/login"
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-3 rounded-xl text-sm transition"
          >
            Back to Login
          </Link>

        </div>
      </div>
    </main>
  );
}