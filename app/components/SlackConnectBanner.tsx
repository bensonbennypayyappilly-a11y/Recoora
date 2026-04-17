"use client";
import { useState } from "react";

type SlackConnectBannerProps = {
  onConnect: () => void;
};

export default function SlackConnectBanner({
  onConnect,
}: SlackConnectBannerProps) {

  // ✅ FIX 1 — move inside component
  const [showSlackModal, setShowSlackModal] = useState(false);

  return (
    <>
      {/* ── MAIN BANNER ── */}
      <div className="bg-indigo-500/10 border border-indigo-500/40 text-indigo-300 p-6 rounded-2xl mb-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Connect Slack to Receive Alerts
            </h2>
            <p className="text-sm text-indigo-200 mt-1">
              Get real-time revenue, churn, and failed payment alerts directly in your Slack workspace.
            </p>
          </div>

          <button
            onClick={() => setShowSlackModal(true)}
            className="bg-indigo-500 hover:bg-indigo-400 text-black font-medium px-5 py-2 rounded-xl transition"
          >
            Connect Slack →
          </button>
        </div>
      </div>

      {/* ── MODAL (OUTSIDE LAYOUT) ── */}
      {showSlackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            
            <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
              <span className="text-indigo-400 text-sm font-bold">⚡</span>
            </div>

            <h3 className="text-white text-sm font-semibold mb-1">
              Setup Slack alerts
            </h3>

            <p className="text-zinc-400 text-xs leading-relaxed mb-4">
              You need a Slack channel where alerts will be sent.
            </p>

            <div className="text-xs text-zinc-400 mb-5 space-y-1">
              <p>• Create a channel like <span className="text-white">#alerts</span></p>
              <p>• You will select it in the next step</p>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSlackModal(false)}
                className="text-xs text-zinc-400 hover:text-white border border-white/8 hover:border-white/15 px-3.5 py-1.5 rounded-lg transition bg-zinc-800/60"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowSlackModal(false);
                  window.location.href = `https://slack.com/oauth/v2/authorize?client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID}&scope=chat:write,chat:write.public,incoming-webhook&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/slack/oauth`;
                }}
                className="text-xs text-black font-medium bg-indigo-500 hover:bg-indigo-400 px-3.5 py-1.5 rounded-lg transition"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}