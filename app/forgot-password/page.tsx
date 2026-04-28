

"use client";

{/* Forgot password */}

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

   if (error) {
  if (error.message.toLowerCase().includes("rate limit")) {
    setError("Too many requests. Please wait a minute.");
  } else {
    setError(error.message);
  }
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-zinc-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-zinc-100 p-10">
        
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">
            Forgot Password
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            Enter your email and we’ll send you a secure reset link.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}

          {success && (
            <p className="text-emerald-500 text-sm">
              If your email is registered, you’ll receive a reset link shortly.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-70 text-black font-semibold py-3 rounded-xl transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-emerald-500 hover:underline"
          >
            Back to login
          </Link>
        </div>

      </div>
    </main>
  );
}