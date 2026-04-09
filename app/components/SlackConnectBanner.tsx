"use client";

type SlackConnectBannerProps = {
  onConnect: () => void;
};

export default function SlackConnectBanner({
  onConnect,
}: SlackConnectBannerProps) {
  return (
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
          onClick={() => {
          window.location.href = 
          `https://slack.com/oauth/v2/authorize?client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID}&scope=chat:write,chat:write.public,incoming-webhook&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/slack/oauth`;
}}
           className="bg-indigo-500 hover:bg-indigo-400 text-black font-medium px-5 py-2 rounded-xl transition"
        >
          Connect Slack →
        </button>
      </div>
    </div>
  );
}