"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("🔍 Reset page loaded");

    const hash = window.location.hash;
    console.log("🔗 Hash:", hash);

    if (!hash) {
      setError("Invalid or expired link");
      return;
    }

    const params = new URLSearchParams(hash.substring(1));

    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const type = params.get("type");

    console.log("📦 Parsed:", {
      access_token,
      refresh_token,
      type,
    });

    if (!access_token || type !== "recovery") {
      setError("Invalid recovery link");
      return;
    }

    supabase.auth
      .setSession({
        access_token,
        refresh_token: refresh_token || "",
      })
      .then(({ error }) => {
        if (error) {
          console.error("❌ Session failed:", error);
          setError("Session creation failed");
        } else {
          console.log("✅ Session established");
          setSessionReady(true);
        }
      });
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      alert("Password updated successfully!");
    }

    setLoading(false);
  };

  if (error) {
    return <p style={{ textAlign: "center" }}>{error}</p>;
  }

  if (!sessionReady) {
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

      <button onClick={handleUpdate} disabled={loading}>
        {loading ? "Updating..." : "Update Password"}
      </button>
    </div>
  );
}