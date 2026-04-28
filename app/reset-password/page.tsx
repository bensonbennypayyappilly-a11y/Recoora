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
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const log = (msg: string) => {
    console.log("[RESET]", msg);
    setDebugLog((prev) => [...prev, msg]);
  };

  useEffect(() => {
  const check = async () => {
    console.log("🟡 RESET PAGE LOADED");

    console.log("🟡 Full URL:", window.location.href);
    console.log("🟡 Cookies:", document.cookie);

    console.log("🟡 Checking session...");

    const { data, error } = await supabase.auth.getSession();

    console.log("🟡 Session result:", {
      hasSession: !!data.session,
      userId: data.session?.user?.id,
      error: error?.message,
    });

    if (data.session) {
      console.log("✅ SESSION VALID → SHOW FORM");
      setSessionValid(true);
    } else {
      console.log("❌ NO SESSION → AUTH FAILED");
      setSessionValid(false);
    }

    setChecking(false);
  };

  check();
}, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    log("18. Form submitted — updating password...");

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
    log("19. updateUser result: " + (error ? "❌ " + error.message : "✅ success"));

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    await supabase.auth.signOut();
    log("20. ✅ Signed out — redirecting to login");
    setTimeout(() => { window.location.href = "/login"; }, 2000);
    setLoading(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <p className="text-zinc-500 text-sm mb-4">Verifying reset link...</p>
          {/* Show live debug log on screen */}
          <div className="text-left bg-black text-green-400 font-mono text-xs p-4 rounded-xl max-w-lg w-full max-h-60 overflow-y-auto">
            {debugLog.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
      </div>
    );
  }

  if (!sessionValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <div className="text-center max-w-lg w-full">
          <h1 className="text-xl font-bold text-zinc-900 mb-3">Link expired</h1>
          <p className="text-sm text-zinc-500 mb-6">
            This reset link has already been used or has expired.
          </p>
          <Link href="/forgot-password" className="text-emerald-500 hover:underline text-sm">
            Request a new reset link
          </Link>
          {/* Show debug log even on error screen */}
          <div className="mt-6 text-left bg-black text-green-400 font-mono text-xs p-4 rounded-xl max-h-60 overflow-y-auto">
            {debugLog.map((l, i) => <div key={i}>{l}</div>)}
          </div>
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