"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
  let executed = false;

  const handleAuth = async () => {
    if (executed) return;
    executed = true;

    console.log("EXCHANGE CALLED");

    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    if (!code) {
      setError("Invalid or expired reset link.");
      return;
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("EXCHANGE FAILED:", error.message);
      setError("This link may have expired or already been used.");
    } else {
      setSessionReady(true);
    }
  };

  handleAuth();
}, []);

  // ✅ Password strength validation
  useEffect(() => {
    setValidations({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    });
  }, [password]);

  const isPasswordValid = Object.values(validations).every(Boolean);

  const handleUpdate = async (e: any) => {
    e.preventDefault();

    setError("");
    setSuccess(false);

    // ✅ Check validation
    if (!isPasswordValid) {
      setError("Password does not meet requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

   setLoading(true);

// ✅ Check session FIRST
const {
  data: { session },
} = await supabase.auth.getSession();

if (!session) {
  setError("Session expired. Please request a new reset link.");
  setLoading(false);
  return;
}

// ✅ Then update password
const { error } = await supabase.auth.updateUser({
  password,
});

if (error) {
  setError(error.message);
  setLoading(false);
  return;
}

    setSuccess(true);
    setLoading(false);
  };

  if (!sessionReady && !error) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Verifying reset link...</p>
    </div>
  );

  if (!error) {
  setSuccess(true);
  setTimeout(() => {
    window.location.href = "/login";
  }, 2000);
}
}

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">

        <h1 className="text-xl font-bold mb-2">Reset Password</h1>
        <p className="text-sm text-zinc-500 mb-6">
          Enter a strong new password.
        </p>

        <form onSubmit={handleUpdate} className="space-y-4">

          {/* Password */}
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl"
          />

          {/* Confirm */}
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl"
          />

          {/* Validation UI */}
          <div className="text-xs space-y-1">
            <p className={validations.length ? "text-green-500" : "text-red-500"}>
              • At least 8 characters
            </p>
            <p className={validations.uppercase ? "text-green-500" : "text-red-500"}>
              • One uppercase letter
            </p>
            <p className={validations.lowercase ? "text-green-500" : "text-red-500"}>
              • One lowercase letter
            </p>
            <p className={validations.number ? "text-green-500" : "text-red-500"}>
              • One number
            </p>
            <p className={validations.special ? "text-green-500" : "text-red-500"}>
              • One special character
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Success */}
          {success && (
            <p className="text-green-600 text-sm">
              Password updated successfully. You can now log in.
            </p>
          )}

          <button
  type="submit"
  disabled={loading || !sessionReady}
  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black py-2 rounded-xl font-semibold"
>
  {!sessionReady ? "Verifying link..." : loading ? "Updating..." : "Update Password"}
</button>

        </form>
      </div>
    </main>
  );
}