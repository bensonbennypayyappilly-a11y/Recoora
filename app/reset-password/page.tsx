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
  const isBrowser = typeof window !== "undefined";

  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  
  


useEffect(() => {
  const init = async () => {
    console.log("🚀 Reset page init started");

    try {
      // STEP 1 — Check window
      if (typeof window === "undefined") {
        console.log("❌ Not running in browser");
        return;
      }

      console.log("🌐 Current URL:", window.location.href);

      // STEP 2 — Extract hash
      const hash = window.location.hash;
      console.log("🔗 URL hash:", hash);

      if (!hash) {
        console.log("❌ No hash found");
        setError("Invalid reset link (no hash)");
        return;
      }

      // STEP 3 — Parse hash params
      const params = new URLSearchParams(hash.substring(1));

      const access_token = params.get("access_token");
      const type = params.get("type");

      console.log("🔑 access_token:", access_token);
      console.log("📌 type:", type);

      if (!access_token) {
        console.log("❌ No access_token in hash");
        setError("Invalid reset link (missing token)");
        return;
      }

      if (type !== "recovery") {
        console.log("⚠️ Not a recovery link, type =", type);
      }

      // STEP 4 — Wait a bit (important for Supabase to hydrate session)
      console.log("⏳ Waiting 500ms for session hydration...");
      await new Promise((res) => setTimeout(res, 500));

      // STEP 5 — Get session
      console.log("🔍 Fetching session...");
      const { data, error } = await supabase.auth.getSession();

      console.log("📦 session response:", data);
      console.log("❌ session error:", error);

      if (error) {
        console.log("❌ Error while getting session");
        setError(error.message);
        return;
      }

      if (data.session) {
        console.log("✅ Session established successfully");
        setSessionReady(true);
      } else {
        console.log("❌ Session is NULL");
        setError("Session not established");
      }

    } catch (err: any) {
      console.error("💥 Unexpected error:", err);
      setError("Something went wrong");
    }
  };

  init();
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

// ✅ redirect after success
setTimeout(() => {
  window.location.href = "/login";
}, 2000);
  };

  if (!sessionReady) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>
        {error ? error : "Verifying reset link..."}
      </p>
    </div>
  );
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
  disabled={loading}
  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black py-2 rounded-xl font-semibold"
>
  {loading ? "Updating..." : "Update Password"}
</button>

        </form>
      </div>
    </main>
  );
}