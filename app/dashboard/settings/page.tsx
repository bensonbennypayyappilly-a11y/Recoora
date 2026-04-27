"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import UpgradeButton from "@/components/UpgradeButton";

type Plan = "trial" | "starter" | "pro" | null;
type Tab  = "account" | "notifications" | "integrations" | "security" | "billing";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">

      {/* ── SIDEBAR ── */}
      <aside className="w-64 bg-zinc-900 border-r border-white/5 p-6 hidden md:flex md:flex-col md:justify-between">
        <div>
          <div className="mb-10">
            <h2 className="text-lg font-semibold tracking-tight">Recoora</h2>
            <p className="text-zinc-500 text-xs mt-1">Settings</p>
          </div>
          <nav className="space-y-1 text-sm">
            {(["account", "notifications", "integrations", "security", "billing"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-3 py-2 rounded-lg transition capitalize ${
                  activeTab === tab
                    ? "bg-emerald-500 text-black font-medium"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="text-xs text-zinc-500">v1.0.0</div>
      </aside>

      {/* ── CONTENT ── */}
      <main className="flex-1 p-10">
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-zinc-400 hover:text-white"
          >
            ← Dashboard
          </button>
        </div>

        {activeTab === "account"       && <AccountSection />}
        {activeTab === "notifications" && <NotificationSection />}
        {activeTab === "integrations"  && <IntegrationSection />}
        {activeTab === "security"      && <SecuritySection />}
        {activeTab === "billing"       && <BillingSection />}
      </main>
    </div>
  );
}

/* ── ACCOUNT SECTION ── */
function AccountSection() {
  const [email, setEmail]     = useState("");
  const [plan, setPlan]       = useState<Plan>(null);
  const [status, setStatus]   = useState<string>("inactive");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("users")
        .select("plan, subscription_status")
        .eq("id", user.id)
        .single();

      setEmail(user.email ?? "");
      setPlan(data?.plan ?? null);
      setStatus(data?.subscription_status ?? "inactive");
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-zinc-500">Loading...</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-semibold">Account Details</h2>

      <div className="bg-zinc-900 border border-white/5 rounded-xl p-5">
        <div className="text-zinc-400 text-sm mb-1">Current Plan</div>
        <div className="text-lg font-medium capitalize">{plan ?? "Trial"}</div>
        <div className="text-xs text-emerald-400 mt-1">Status: {status}</div>
      </div>

      <div className="bg-zinc-900 border border-white/5 rounded-xl p-5">
        <div className="text-zinc-500 text-xs">Email Address</div>
        <div className="mt-1 text-sm">{email || "—"}</div>
      </div>
    </div>
  );
}

/* ── BILLING SECTION ── */
function BillingSection() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<"trial" | "starter" | "pro">("trial");
  const [status, setStatus] = useState("trial");
  const [periodEnd, setPeriodEnd] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);

  const fetchBilling = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("users")
      .select("plan, subscription_status, current_period_end")
      .eq("id", user.id)
      .single();

    if (data) {
      setPlan(data.plan ?? "trial");
      setStatus(data.subscription_status ?? "trial");
      setPeriodEnd(data.current_period_end ?? null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  if (loading) return <p className="text-zinc-500">Loading...</p>;

  const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString() : null;



const handleCancel = async () => {
  setLocalStatus("canceling");
  setCancelLoading(true);

  try {
    const res = await fetch("/api/stripe/cancel", {
      method: "POST",
    });

    if (!res.ok) throw new Error("Cancel failed");

    // immediate sync attempt
    await fetchBilling();

    // fallback sync
    setTimeout(fetchBilling, 3000);

    setLocalStatus(null);
    setCancelLoading(false);

  } catch (err) {
    setLocalStatus(null);
    setCancelLoading(false);
    alert("Failed to cancel subscription");
  }
};

  const handleCheckout = async () => {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert("Failed to create checkout session.");
  };


  const effectiveStatus = localStatus ?? status;

const isActiveEffective = effectiveStatus === "active" && plan !== "trial";
const isCancelingEffective = effectiveStatus === "canceling";
const isCanceledEffective = effectiveStatus === "canceled";

  return (
    <div className="max-w-6xl space-y-10">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Billing</h1>
        <p className="text-zinc-400 text-sm">Manage subscription and billing.</p>
      </div>

      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-8">
        <div className="flex justify-between items-center flex-wrap gap-6">
          <div>
            <div className="text-zinc-400 text-sm">Current Plan</div>
            <div className="text-2xl font-semibold capitalize">{plan}</div>

            {plan === "starter" && (
              <div className="text-zinc-500 text-sm mt-1">$11 / monthly</div>
            )}

            <div className="mt-1 text-xs text-emerald-400">
             Status: {localStatus ?? status}
            </div>

            {/* Period end label — changes text based on state */}
            {periodEnd && (
              <div className="text-xs text-zinc-500 mt-2">
               {isCancelingEffective
                  ? `Access until: ${formatDate(periodEnd)}`
                  : `Next billing date: ${formatDate(periodEnd)}`}
              </div>
            )}
          </div>

          <div className="flex gap-3 flex-wrap items-center">

            {/* Trial → Start plan */}
            {plan === "trial" && (
              <button
                onClick={handleCheckout}
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-semibold"
              >
                Start Starter Plan
              </button>
            )}

            {/* Active starter → Upgrade to Pro (coming soon) */}
            {isActiveEffective && (
              <button
                onClick={() => alert("🚧 Pro plan launching soon")}
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-semibold"
              >
                Upgrade to Pro
              </button>
            )}

            {/* Canceling — informational only, no action */}
            {isCancelingEffective && (
              <span className="text-yellow-400 text-sm font-medium">
                Cancels at period end
                {periodEnd && ` (${formatDate(periodEnd)})`}
              </span>
            )}

            {/* Canceled → Reactivate */}
            {isCanceledEffective && (
              <button
                onClick={handleCheckout}
                className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-xl font-semibold"
              >
                Reactivate Subscription
              </button>
            )}

            {/* Cancel button — ONLY when active and NOT already canceling */}
           {isActiveEffective && !isCancelingEffective && (
              <button
                onClick={handleCancel}
                disabled={cancelLoading}
                className="border border-rose-500/40 text-rose-400 px-6 py-3 rounded-xl text-sm hover:bg-rose-500/10 disabled:opacity-50"
              >
                {cancelLoading ? "Canceling..." : "Cancel Subscription"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── NOTIFICATION SECTION ── */
function NotificationSection() {
  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-semibold">Notification Preferences</h2>

      <div className="flex justify-between items-center bg-zinc-900 border border-white/5 rounded-xl p-4">
        <div>
          <span className="text-sm">Slack Alerts</span>
          <p className="text-xs text-zinc-500 mt-1">Real-time alerts for payments, churn, and revenue spikes</p>
        </div>
        <div className="w-12 h-6 rounded-full bg-emerald-500 flex items-center justify-end px-1">
          <div className="w-4 h-4 bg-black rounded-full" />
        </div>
      </div>

      {["Email Alerts", "SMS Alerts", "WhatsApp Alerts"].map((label) => (
        <div key={label} className="flex justify-between items-center bg-zinc-900 border border-white/5 rounded-xl p-4">
          <div>
            <span className="text-sm">
              {label}
              <span className="ml-2 text-xs text-emerald-400">(Upgrade)</span>
            </span>
            <p className="text-xs text-zinc-500 mt-1">Available in Pro plan</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-6 rounded-full bg-zinc-700" />
            <button
              onClick={() => alert("🚧 Pro plan launching soon")}
              className="text-xs text-emerald-400 hover:underline"
            >
              Upgrade
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── INTEGRATIONS SECTION ── */
function IntegrationSection() {
  const [loading, setLoading]                 = useState(true);
  const [slackConnected, setSlackConnected]   = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("users")
        .select("slack_connected, stripe_account_id")
        .eq("id", user.id)
        .single();

      if (data) {
        setSlackConnected(data.slack_connected ?? false);
        setStripeConnected(!!data.stripe_account_id);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-zinc-500">Loading...</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-2xl font-semibold">Integrations</h2>

      {[
        {
          title:     "Stripe",
          connected: stripeConnected,
          onClick:   () => stripeConnected
            ? alert("Stripe already connected")
            : (window.location.href = "/api/stripe/oauth"),
        },
        {
          title:     "Slack",
          connected: slackConnected,
          onClick:   () => slackConnected
            ? alert("Slack already connected")
            : (window.location.href = `https://slack.com/oauth/v2/authorize?client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID}&scope=chat:write,chat:write.public&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/slack/oauth`),
        },
      ].map(({ title, connected, onClick }) => (
        <div key={title} className="bg-zinc-900 border border-white/5 rounded-xl p-5 flex justify-between items-center">
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-zinc-500 text-sm">{connected ? "Connected ✓" : "Not connected"}</p>
          </div>
          <button
            onClick={onClick}
            disabled={connected}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              connected
                ? "border border-white/15 text-white opacity-60 cursor-not-allowed"
                : "bg-emerald-500 text-black hover:bg-emerald-400"
            }`}
          >
            {connected ? "Connected" : "Connect"}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ── SECURITY SECTION ── */
function SecuritySection() {
  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-semibold">Security</h2>

      <div className="bg-zinc-900 border border-white/5 rounded-xl p-6 flex justify-between items-center">
        <div>
          <p className="font-medium">Password</p>
          <p className="text-zinc-500 text-sm">Last updated 30 days ago</p>
        </div>
        <button
          onClick={async () => {
            const confirmed = confirm(
              "A password reset link will be sent to your email. You will be signed out."
            );
            if (!confirmed) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) { alert("No email found"); return; }

            const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
              redirectTo: `${window.location.origin}/login`,
            });

            if (error) { alert("❌ " + error.message); return; }

            alert("📩 Password reset email sent.");
            await supabase.auth.signOut();
            window.location.href = "/login";
          }}
          className="border border-white/10 px-5 py-2 rounded-lg text-sm hover:bg-white/5 transition"
        >
          Change Password
        </button>
      </div>
    </div>
  );
}