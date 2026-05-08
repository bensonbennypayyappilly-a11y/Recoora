"use client";

import { useState } from "react";

export default function WaitlistModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setMessage(null);

    // ✅ Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("❌ Enter a valid email");
      return;
    }

    // ✅ Suggestion limit
    if (suggestion.length > 100) {
      setMessage("❌ Max 100 characters allowed");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        body: JSON.stringify({ email, suggestion }),
      });

      const data = await res.json();

      if (data.message === "duplicate") {
        setMessage("⚠️ You already joined the waitlist");
      } else {
        setMessage("✅ Successfully joined!");
        setEmail("");
        setSuggestion("");
      }

    } catch {
      setMessage("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-md">

        <h2 className="text-lg font-semibold mb-4">
          Join Growth Waitlist
        </h2>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border px-3 py-2 rounded-lg mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* SUGGESTION */}
        <textarea
          placeholder="What features do you want? (optional)"
          className="w-full border px-3 py-2 rounded-lg mb-3"
          value={suggestion}
          maxLength={100}
          onChange={(e) => setSuggestion(e.target.value)}
        />

        <div className="text-xs text-zinc-400 mb-2 text-right">
          {suggestion.length}/100
        </div>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-emerald-500 text-white py-2 rounded-lg"
        >
          {loading ? "Submitting..." : "Join Waitlist"}
        </button>

        {/* MESSAGE */}
        {message && (
          <p className="text-sm mt-3 text-center">{message}</p>
        )}

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="text-xs mt-4 text-zinc-400 w-full"
        >
          Close
        </button>

      </div>
    </div>
  );
}