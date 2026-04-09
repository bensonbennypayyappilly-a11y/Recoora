"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔐 Properly handle recovery session
  useEffect(() => {
    const initialize = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setValidSession(false);
      } else {
        setValidSession(true);
      }

      setChecking(false);
    };

    initialize();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess("Password updated successfully.");

    // Optional: sign out recovery session for safety
    await supabase.auth.signOut();

    setTimeout(() => {
      router.push("/login");
    }, 2000);

    setLoading(false);
  };

  // Still checking
  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 flex items-center justify-center">
        <p className="text-zinc-600">Checking session...</p>
      </div>
    );
  }

  // Invalid or expired link
  if (!validSession) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">
            Invalid or expired link
          </h1>
          <p className="text-zinc-500 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link
            href="/forgot-password"
            className="text-emerald-500 hover:underline"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-[0_4px_40px_rgba(0,0,0,0.08)] border border-zinc-100 p-10">

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">
              Set a new password
            </h1>
            <p className="text-sm text-zinc-500">
              Choose a strong password to secure your account.
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-400 hover:bg-emerald-500 disabled:opacity-70 text-black font-semibold text-sm py-3 rounded-xl transition"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

        </div>
      </div>
    </main>
  );
}