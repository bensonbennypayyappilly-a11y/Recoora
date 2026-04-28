"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  // 🔐 Password rules
  const passwordRules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const isPasswordValid =
    passwordRules.length &&
    passwordRules.upper &&
    passwordRules.lower &&
    passwordRules.number &&
    passwordRules.special;

  const isMatch = password === confirmPassword && password.length > 0;

  useEffect(() => {
    console.log("🚀 Reset page loaded");

    const params = new URLSearchParams(window.location.search);

    const token_hash = params.get("token_hash");
    const type = params.get("type");

    console.log("📦 Params:", { token_hash, type });

    if (!token_hash || type !== "recovery") {
      setError("Invalid or expired reset link");
      return;
    }

    const verify = async () => {
      console.log("🔄 Verifying OTP...");

      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: "recovery",
      });

      console.log("📡 verifyOtp result:", {
        hasSession: !!data.session,
        error,
      });

      if (error) {
        setError("Link expired or invalid");
        return;
      }

      console.log("✅ Recovery session established");
      setReady(true);
    };

    verify();
  }, []);

  const handleUpdate = async () => {
    // 🔴 Validation guard (NEW)
    if (!isPasswordValid) {
      setError("Password does not meet requirements");
      return;
    }

    if (!isMatch) {
      setError("Passwords do not match");
      return;
    }

    console.log("🔄 Updating password...");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    console.log("📡 updateUser:", { error });

    if (error) {
      setError(error.message);
      return;
    }

    alert("Password updated successfully!");

    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (error && !ready) {
    return <p style={{ textAlign: "center" }}>{error}</p>;
  }

  if (!ready) {
    return <p style={{ textAlign: "center" }}>Verifying reset link...</p>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-zinc-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-zinc-100 p-8">

        <h1 className="text-2xl font-bold text-zinc-900 text-center mb-6">
          Reset Password
        </h1>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">
            {error}
          </p>
        )}

        <div className="space-y-4">

          {/* Password */}
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
          />

          {/* Confirm Password */}
          <input
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
          />

          {/* Rules */}
          <div className="text-xs space-y-1">
            <p className={passwordRules.length ? "text-emerald-500" : "text-zinc-400"}>
              • At least 8 characters
            </p>
            <p className={passwordRules.upper ? "text-emerald-500" : "text-zinc-400"}>
              • One uppercase letter
            </p>
            <p className={passwordRules.lower ? "text-emerald-500" : "text-zinc-400"}>
              • One lowercase letter
            </p>
            <p className={passwordRules.number ? "text-emerald-500" : "text-zinc-400"}>
              • One number
            </p>
            <p className={passwordRules.special ? "text-emerald-500" : "text-zinc-400"}>
              • One special character
            </p>
          </div>

          {/* Match Error */}
          {!isMatch && confirmPassword.length > 0 && (
            <p className="text-red-500 text-xs">
              Passwords do not match
            </p>
          )}

          {/* Button */}
          <button
            onClick={handleUpdate}
            disabled={!isPasswordValid || !isMatch}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition"
          >
            Update Password
          </button>

        </div>
      </div>
    </main>
  );
}