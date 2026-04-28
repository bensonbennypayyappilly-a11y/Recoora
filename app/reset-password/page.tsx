"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

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

  if (error) {
    return <p style={{ textAlign: "center" }}>{error}</p>;
  }

  if (!ready) {
    return <p style={{ textAlign: "center" }}>Verifying reset link...</p>;
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Reset Password</h2>

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleUpdate}>
        Update Password
      </button>
    </div>
  );
}