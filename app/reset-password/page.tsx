"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Step 1: Check if session already exists (e.g. page refresh)
      const { data: existing } = await supabase.auth.getSession();
      if (existing.session) {
        setSessionValid(true);
        setChecking(false);
        return;
      }

      // Step 2: Parse hash manually — implicit flow puts token in hash
      // e.g. #access_token=xxx&refresh_token=yyy&type=recovery
      const hash = window.location.hash;

      if (!hash || !hash.includes("access_token")) {
        // No hash — link is genuinely expired or already used
        setSessionValid(false);
        setChecking(false);
        return;
      }

      // Step 3: Parse the hash params
      const params = new URLSearchParams(hash.replace("#", ""));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (!accessToken || !refreshToken || type !== "recovery") {
        setSessionValid(false);
        setChecking(false);
        return;
      }

      // Step 4: Set the session explicitly using the tokens from the hash
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        console.error("setSession error:", error.message);
        setSessionValid(false);
        setChecking(false);
        return;
      }

      // Step 5: Clean the hash from the URL so it's not reused
      window.history.replaceState(null, "", window.location.pathname);

      setSessionValid(true);
      setChecking(false);
    };

    init();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    await supabase.auth.signOut();
    setTimeout(() => { window.location.href = "/login"; }, 2000);
    setLoading(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-500 text-sm">Verifying reset link...</p>
      </div>
    );
  }

  if (!sessionValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold text-zinc-900 mb-3">Link expired</h1>
          <p className="text-sm text-zinc-500 mb-6">
            This reset link has already been used or has expired.
          </p>
          <Link href="/forgot-password" className="text-emerald-500 hover:underline text-sm">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-xl font-bold mb-2">Set new password</h1>
        <p className="text-sm text-zinc-500 mb-6">Choose a strong password.</p>

        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-xl text-sm"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-xl text-sm"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {success && (
            <p className="text-emerald-600 text-sm">
              Password updated. Redirecting to login...
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black py-2.5 rounded-xl font-semibold text-sm"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
}