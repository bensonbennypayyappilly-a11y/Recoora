"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AuthHeader from "../components/AuthHeader";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    setLoading(false);

router.push("/dashboard");
router.refresh();
  };

  return (
  <main className="min-h-screen bg-gradient-to-b from-white to-zinc-50 flex items-center justify-center px-4 py-16">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-zinc-100 p-10">

      {/* ✅ ADD HEADER HERE (ONLY ONCE) */}
      <AuthHeader />

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">
          Log in
        </h1>
        <p className="text-sm text-zinc-500 mt-2">
          Continue monitoring your revenue in real-time.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-6">

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm">
            {error}
          </p>
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-70 text-black font-semibold py-3 rounded-xl transition"
        >
          {loading ? "Signing in..." : "Log in"}
        </button>
       <p className="text-xs text-zinc-500 text-center mt-3">
        Secure login • No access to billing or charges
        </p>
      </form>

      {/* Footer Links */}
      <div className="mt-6 text-center space-y-3">

        <Link
          href="/forgot-password"
          className="block text-sm text-emerald-500 hover:underline"
        >
          Forgot password?
        </Link>

        <p className="text-sm text-zinc-500">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="text-emerald-500 hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>

      </div>

    </div>

  </main>
  
);
}