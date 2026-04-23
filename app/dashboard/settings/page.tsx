"use client";

import { useState } from "react";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import UpgradeButton from "../../components/UpgradeButton";



type Plan = "trial" | "starter" | "pro";
type Tab =
  | "account"
  | "notifications"
  | "integrations"
  | "security"
  | "billing";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const router = useRouter();
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-zinc-900 border-r border-white/5 p-6 hidden md:flex md:flex-col md:justify-between">

        <div>
          <div className="mb-10">
            <h2 className="text-lg font-semibold tracking-tight">
              Recoora
            </h2>
            <p className="text-zinc-500 text-xs mt-1">Settings</p>
          </div>

          <nav className="space-y-1 text-sm">
            <SidebarItem label="Account" active={activeTab === "account"} onClick={() => setActiveTab("account")} />
            <SidebarItem label="Notifications" active={activeTab === "notifications"} onClick={() => setActiveTab("notifications")} />
            <SidebarItem label="Integrations" active={activeTab === "integrations"} onClick={() => setActiveTab("integrations")} />
            <SidebarItem label="Security" active={activeTab === "security"} onClick={() => setActiveTab("security")} />
            <SidebarItem label="Billing" active={activeTab === "billing"} onClick={() => setActiveTab("billing")} />
          </nav>
        </div>

        <div className="text-xs text-zinc-500">
          v1.0.0
        </div>
      </aside>

      {/* ================= CONTENT ================= */}
      <main className="flex-1 p-10">
        <div className="mb-6">
  <button
    onClick={() => router.push("/dashboard")}
    className="text-sm text-zinc-400 hover:text-white"
  >
    ← Dashboard
  </button>
</div>
        {activeTab === "account" && <AccountSection />}
        {activeTab === "notifications" && <NotificationSection />}
        {activeTab === "integrations" && <IntegrationSection />}
        {activeTab === "security" && <SecuritySection />}
        {activeTab === "billing" && <BillingSection />}
      </main>
    </div>
  );
}

/* ================= SIDEBAR ITEM ================= */

function SidebarItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg transition ${
        active
          ? "bg-emerald-500 text-black font-medium"
          : "text-zinc-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

/* ================= ACCOUNT SECTION ================= */

function AccountSection() {
 const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<"trial" | "starter" | "pro" | null>(null);
const [subscription_status, setSubscriptionStatus] = useState<string>("inactive");
 

  useEffect(() => {
    const fetchUser = async () => {
      // ✅ Get auth user (for email)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
  setLoading(false);
  return;
}

      // ✅ Get profile data from DB
      const { data } = await supabase
        .from("users")
        .select("full_name, company_name, plan, subscription_status")
        .eq("id", user.id)
        .single();

      setPlan(data?.plan ?? null);
setSubscriptionStatus(data?.subscription_status ?? "inactive");

setEmail(user.email || "");
      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) {
    return <p className="text-zinc-500">Loading...</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-semibold">Account Details</h2>

      {/* PLAN CARD */}
      <div className="bg-zinc-900 border border-white/5 rounded-xl p-5">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-lg font-medium capitalize">{plan}</div>

          <div className="mt-1 text-xs text-emerald-400">
          Status: {status}

{status === "canceling" && (
  <div className="text-xs text-yellow-400 mt-1">
    Cancels at period end
  </div>
)}
          </div>
          </div>
<UpgradeButton plan={plan} status={subscription_status} />
        </div>
      </div>

      {/* PROFILE DISPLAY ONLY */}
      
      <div className="bg-zinc-900 border border-white/5 rounded-xl p-5">
        <div className="text-zinc-500 text-xs">Email Address</div>
        <div className="mt-1 text-sm">{email || "—"}</div>
      </div>
    </div>
  );
}

/* ================= NOTIFICATIONS ================= */

function NotificationSection() {
  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-semibold">Notification Preferences</h2>

      {/* ✅ SLACK (PRIMARY - ENABLED) */}
      <div className="flex justify-between items-center bg-zinc-900 border border-white/5 rounded-xl p-4">
        <div>
          <span className="text-sm">Slack Alerts</span>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time alerts for payments, churn, and revenue spikes
          </p>
        </div>

        <div className="w-12 h-6 rounded-full bg-emerald-500 flex items-center justify-end px-1">
          <div className="w-4 h-4 bg-black rounded-full" />
        </div>
      </div>

      {/* 🔒 EMAIL (LOCKED) */}
      <LockedNotification label="Email Alerts" />

      {/* 🔒 SMS */}
      <LockedNotification label="SMS Alerts" />

      {/* 🔒 WHATSAPP */}
      <LockedNotification label="WhatsApp Alerts" />
    </div>
  );
}
function LockedNotification({ label }: { label: string }) {
  return (
    <div className="flex justify-between items-center bg-zinc-900 border border-white/5 rounded-xl p-4">
      <div>
        <span className="text-sm">
          {label}
          <span className="ml-2 text-xs text-emerald-400">(Upgrade)</span>
        </span>
        <p className="text-xs text-zinc-500 mt-1">
          Available in Pro plan
        </p>
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
  );
}

/* ================= INTEGRATIONS ================= */
function IntegrationSection() {
  const [loading, setLoading] = useState(true);
  const [slackConnected, setSlackConnected] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // ✅ FIX: prevent infinite loading
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("users")
        .select("slack_connected, stripe_account_id")
        .eq("id", user.id)
        .single();

      if (data) {
        setSlackConnected(data.slack_connected || false);
        setStripeConnected(!!data.stripe_account_id);
      }

      setLoading(false);
    };

    fetchStatus();
  }, []);

  if (loading) {
    return <p className="text-zinc-500">Loading...</p>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-2xl font-semibold">Integrations</h2>

      {/* STRIPE */}
      <IntegrationItem
        title="Stripe"
        connected={stripeConnected}
        onClick={() => {
          if (!stripeConnected) {
            window.location.href = "/api/stripe/oauth";
          } else {
            alert("Stripe already connected");
          }
        }}
      />

      {/* SLACK */}
      <IntegrationItem
        title="Slack"
        connected={slackConnected}
        onClick={() => {
          if (!slackConnected) {
            window.location.href = `https://slack.com/oauth/v2/authorize?client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID}&scope=chat:write,chat:write.public&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/slack/oauth`;
          } else {
            alert("Slack already connected");
          }
        }}
      />
    </div>
  );
}

function IntegrationItem({
  title,
  connected,
  onClick,
}: {
  title: string;
  connected: boolean;
  onClick: () => void;
}) {
  return (
    <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 flex justify-between items-center">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-zinc-500 text-sm">
          {connected ? "Connected ✓" : "Not connected"}
        </p>
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
  );
}


/* ================= BILLING ================= */

function BillingSection() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<"trial" | "starter" | "pro">("trial");
  const [status, setStatus] = useState("trial");
  const [periodEnd, setPeriodEnd] = useState<string | null>(null);

  useEffect(() => {
    const fetchBilling = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("users")
        .select("plan, subscription_status, current_period_end")
        .eq("id", user.id)
        .single();

      if (data) {
        setPlan(data.plan);
        setStatus(data.subscription_status);
        setPeriodEnd(data.current_period_end);
      }

      setLoading(false);
    };

    fetchBilling();
  }, []);

  if (loading) {
    return <p className="text-zinc-500">Loading...</p>;
  }

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="max-w-6xl space-y-10">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Billing</h1>
        <p className="text-zinc-400 text-sm">
          Manage subscription and billing.
        </p>
      </div>

      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-8">
        <div className="flex justify-between items-center flex-wrap gap-6">
          <div>
            <div className="text-zinc-400 text-sm">Current Plan</div>
            <div className="text-2xl font-semibold capitalize">
              {plan}
            </div>

            <div className="text-zinc-500 text-sm mt-1">
              {plan === "starter" && "$11 / monthly"}
            </div>

            <div className="mt-1 text-xs text-emerald-400">
              Status: {status}
            </div>

            {/* ✅ NEXT BILLING DATE */}
            {periodEnd && (
              <div className="text-xs text-zinc-500 mt-2">
                Active until: {formatDate(periodEnd)}
              </div>
            )}
          </div>

          <div className="flex gap-3 flex-wrap">
            {/* 🔥 UPGRADE LOGIC */}
            {plan === "trial" && (
              <button
                onClick={async () => {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
  });

  const data = await res.json();

  if (data.url) {
    window.location.href = data.url;
  } else {
    alert("Checkout failed");
  }
}}
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-semibold"
              >
                Start Starter Plan
              </button>
            )}

            
            {plan === "starter" && (
              <button
                onClick={() =>
                  alert("🚧 Pro plan launching soon")
                }
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-semibold"
              >
                Upgrade to Pro
              </button>
            )}

            {/* 🔥 CANCEL SUBSCRIPTION */}
            {plan !== "trial" && (
              <button
                onClick={async () => {
                  const confirmCancel = confirm(
                    "Are you sure you want to cancel your subscription?"
                  );

                  if (!confirmCancel) return;


const session = await supabase.auth.getSession();

const res = await fetch("/api/stripe/cancel-subscription", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${session.data.session?.access_token}`,
  },
});

                  const data = await res.json();

                  if (!data.success) {
                    alert("❌ " + data.error);
                  } else {
                    alert(
                      `✅ Subscription cancelled. Active until ${formatDate(
                        data.current_period_end
                      )}`
                    );
                    window.location.reload();
                  }
                }}
                className="border border-rose-500/40 text-rose-400 px-6 py-3 rounded-xl text-sm hover:bg-rose-500/10"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= SECURITY ================= */

function SecuritySection() {
  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-semibold">Security</h2>

      <div className="bg-zinc-900 border border-white/5 rounded-xl p-6 flex justify-between items-center">
        <div>
          <p className="font-medium">Password</p>
          <p className="text-zinc-500 text-sm">
            Last updated 30 days ago
          </p>
        </div>

        <button
  onClick={async () => {
    const confirmChange = confirm(
      "Are you sure you want to change your password? A reset link will be sent to your email."
    );

    if (!confirmChange) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      alert("No email found");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      user.email,
      {
        redirectTo: `${window.location.origin}/login`,
      }
    );

    if (error) {
      alert("❌ " + error.message);
    } else {
      alert("📩 Password reset email sent. Please check your inbox.");

      // ✅ LOG OUT USER
      await supabase.auth.signOut();

      // ✅ REDIRECT TO LOGIN
      window.location.href = "/login";
    }
  }}
  className="border border-white/10 px-5 py-2 rounded-lg text-sm"
>
  Change Password
</button>
      </div>
    </div>
  );
}

/* ================= REUSABLE ================= */

function Toggle({ label, locked }: { label: string; locked?: boolean }) {
  const [enabled, setEnabled] = useState(!locked);

  return (
    <div className="flex justify-between items-center bg-zinc-900 border border-white/5 rounded-xl p-4">
      <span className="text-sm">
        {label}
        {locked && <span className="ml-2 text-xs text-emerald-400">(Upgrade)</span>}
      </span>

      <button
        disabled={locked}
        onClick={() => !locked && setEnabled(!enabled)}
        className={`w-12 h-6 rounded-full transition ${
          enabled ? "bg-emerald-500" : "bg-zinc-700"
        }`}
      />
    </div>
  );
}

function IntegrationCard({
  title,
  description,
  locked,
}: {
  title: string;
  description: string;
  locked?: boolean;
}) {
  return (
    <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 flex justify-between items-center">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-zinc-500 text-sm">{description}</p>
      </div>

      {locked ? (
        <button className="border border-white/15 px-4 py-2 rounded-lg text-sm">
          Upgrade
        </button>
      ) : (
        <button className="bg-emerald-500 text-black px-4 py-2 rounded-lg text-sm">
          Manage
        </button>
      )}
    </div>
  );
}