

"use client";

{/* Dashboard */}

import StripeConnectBanner from "../components/StripeConnectBanner";
import UpgradeButton from "../components/UpgradeButton";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import SlackConnectBanner from "../components/SlackConnectBanner";
import LiveAlerts from "../components/LiveAlerts";
import { useRouter } from "next/navigation";

type Plan = "trial" | "starter" | "Growth";

type AtRiskCustomer = {
  email: string;
  risk: "low" | "medium" | "high";
  attempts: number;
  last_event: string;
};

export default function Dashboard() {
  const [plan, setPlan] = useState<Plan>("trial");
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [slackConnected, setSlackConnected] = useState(false);
  const [range, setRange] = useState<"12h" | "3" | "7" | "15" | "30" | "60">("3");
  const [refreshing, setRefreshing] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertFilter, setAlertFilter] = useState("all");
  const [periodStats, setPeriodStats] = useState({ revenue: 0, failed: 0, lost: 0 });
  const [checkingSession, setCheckingSession] = useState(true);
  const [actionFilter, setActionFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(10);
  const [atRiskCustomers, setAtRiskCustomers] = useState<AtRiskCustomer[]>([]);
  const [unattended, setUnattended] = useState(0);
  const stripeAccountIdRef = useRef<string | null>(null);
  const processedResolvedInvoices = useRef<Set<string>>(new Set());
  const processedInsertedInvoices = useRef<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [subscription_status, setSubscriptionStatus] = useState<string>("inactive");


  const router = useRouter();

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push("/login");
  router.refresh();
};
  

  const isPro = plan === "Growth";
  const isBillingInactive =
  subscription_status !== "active" &&
  !(
    plan === "trial" &&
    trialEndsAt &&
    new Date(trialEndsAt) > new Date()
  );
  const lockedRanges = ["15", "30", "60"];
  const isLocked = (r: string) => lockedRanges.includes(r) && !isPro;
const fetchDashboardData = async () => {
  /* ── Session + data fetch ── */
  
          const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
  window.location.href = "/login";
  return;
}

if (isBillingInactive) {
  setAlerts([]);
  setPeriodStats({ revenue: 0, failed: 0, lost: 0 });
  setUnattended(0);
  return;
}

setUserId(sessionData.session.user.id);
      const { data: userData } = await supabase
        .from("users")
        .select("plan, trial_ends_at, stripe_account_id, slack_connected")
        .eq("id", sessionData.session.user.id)
        .single();

      if (userData) {
        setPlan(userData.plan);
        setTrialEndsAt(userData.trial_ends_at);
        setStripeConnected(!!userData.stripe_account_id);
        setStripeAccountId(userData.stripe_account_id);
        stripeAccountIdRef.current = userData.stripe_account_id;
        setSlackConnected(!!userData.slack_connected);
      }
  
      const { data: billingData } = await supabase
  .from("users")
  .select("plan, subscription_status")
  .eq("id", sessionData.session.user.id)
  .single();

if (billingData) {
  setPlan(billingData.plan);
  setSubscriptionStatus(billingData.subscription_status);
}
      
      const acctId = userData?.stripe_account_id;
      if (!acctId) {
        setCheckingSession(false);
        return;
      }

      let sinceDate = new Date();
      if (range === "12h") {
        sinceDate.setHours(sinceDate.getHours() - 12);
      } else {
        sinceDate.setDate(sinceDate.getDate() - Number(range));
      }

      // Main alert fetch — used for the alerts list UI
      const { data: events } = await supabase
        .from("stripe_events")
        .select(
          "id, stripe_event_id, event_type, customer_email, amount, created_at, action_status, plan_name, attempt_count, failure_reason, customer_risk_level, billing_reason, deleted_at, invoice_id"
           )
        .eq("user_id", sessionData.session.user.id)
        .is("deleted_at", null)
        .in("event_type", [
          "invoice.payment_failed",
          "invoice.payment_succeeded",
          "customer.subscription.deleted",
          "checkout.session.completed",
        ])
        .gte("created_at", sinceDate.toISOString())
        .order("created_at", { ascending: false });

      setAlerts(events || []);

      // Stats fetch — separate query so deleted items don't affect totals
      // ✅ FULL events for stats (range-based)
const { data: allEvents } = await supabase
  .from("stripe_events")
  .select(
    "event_type, amount, invoice_id, stripe_event_id, action_status, deleted_at"
  )
  .eq("user_id", sessionData.session.user.id)
  .gte("created_at", sinceDate.toISOString());


  // ✅ UNATTENDED (7 days ONLY, independent)
const { data: failedEvents } = await supabase
  .from("stripe_events")
  .select(
    "event_type, amount, invoice_id, stripe_event_id, action_status, deleted_at"
  )
  .eq("user_id", sessionData.session.user.id)
  .eq("event_type", "invoice.payment_failed")
  .is("deleted_at", null)
  .gte(
    "created_at",
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  );

      let revenue = 0, failed = 0, lost = 0;

const failedInvoices = new Set();

// ✅ NEW: unattended tracking
let unattendedAmount = 0;
const unattendedInvoices = new Set();

allEvents?.forEach((e) => {
  // ✅ Revenue
  if (
    e.event_type === "invoice.payment_succeeded" ||
    e.event_type === "checkout.session.completed"
  ) {
    revenue += e.amount || 0;
  }

  // ✅ Failed (deduplicated by invoice)
  if (e.event_type === "invoice.payment_failed") {
  const key = e.invoice_id ?? e.stripe_event_id;

  // ✅ TOTAL FAILED (existing)
  if (!failedInvoices.has(key)) {
    failedInvoices.add(key);
    failed += e.amount || 0;
  }
   }

  // ✅ Lost
  if (e.event_type === "customer.subscription.deleted") {
    lost += e.amount || 0;
  }
});

// ✅ UNATTENDED ONLY (NEW LOGIC)
  failedEvents?.forEach((e) => {
const key = e.invoice_id ?? e.stripe_event_id;
  if (
    e.action_status !== "contacted_slack" &&
    e.action_status !== "taken" &&
    e.deleted_at === null
  ) {
    if (!unattendedInvoices.has(key)) {
      unattendedInvoices.add(key);
      unattendedAmount += e.amount || 0;
    }
  }
});

setPeriodStats({ revenue, failed, lost });
setUnattended(unattendedAmount);

      // ── Derive at-risk customers from fetched events ──────────────────────
      const riskOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
      const riskMap: Record<string, AtRiskCustomer> = {};

     events?.forEach((e) => {
  if (!e.customer_email) return;

  // ❌ REMOVE already handled / deleted alerts
  if (
    e.action_status === "contacted_slack" ||
    e.action_status === "taken" ||
    e.deleted_at !== null
  ) {
    return;
  }
        const thisRisk = (e.customer_risk_level as "low" | "medium" | "high") || "low";
        const existing = riskMap[e.customer_email];

        if (!existing) {
          riskMap[e.customer_email] = {
            email: e.customer_email,
            risk: thisRisk,
            attempts: e.attempt_count || 0,
            last_event: e.event_type,
          };
        } else {
          // Keep highest risk
          if (riskOrder[thisRisk] > riskOrder[existing.risk]) {
            riskMap[e.customer_email].risk = thisRisk;
            riskMap[e.customer_email].last_event = e.event_type;
          }
          // Keep highest attempt count
          if ((e.attempt_count || 0) > existing.attempts) {
            riskMap[e.customer_email].attempts = e.attempt_count || 0;
          }
        }
      });

      setAtRiskCustomers(
        Object.values(riskMap).filter((c) => c.risk === "high")
      );

      setCheckingSession(false);
    };

    useEffect(() => {
  fetchDashboardData();
}, [range]);

  useEffect(() => {
    setVisibleCount(10);
    setAtRiskCustomers([]);
  }, [range, alertFilter, actionFilter]);

  /* ── Slack redirect reload ── */
  useEffect(() => {
  if (window.location.search.includes("slack=connected")) {
    console.log("Slack connected successfully");

    window.history.replaceState({}, "", "/dashboard");
  }

  }, []);

  /* ── Realtime ── */
  useEffect(() => {
  if (!stripeAccountId || !userId || isBillingInactive) return;
  
    console.log("📡 Subscribing to realtime for account:", stripeAccountId);

    const channel = supabase
      .channel(`stripe_events_live_${stripeAccountId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "stripe_events",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const inserted = payload.new as any;
          // ✅ ADD: increase unattended on new failure
const key = inserted.invoice_id ?? inserted.stripe_event_id;


if (
  inserted.event_type === "invoice.payment_failed" &&
  inserted.action_status !== "contacted_slack" &&
  inserted.action_status !== "taken" &&
  inserted.deleted_at === null
) {
  // ✅ prevent duplicate ADD
  if (processedInsertedInvoices.current.has(key)) {
  return;
}


processedInsertedInvoices.current.add(key);

  setUnattended((prev) => prev + (inserted.amount || 0));
}

        
          // Do not add soft-deleted alerts
          if (inserted.deleted_at !== null) return;

          setAlerts((prev) => {
            if (prev.find((a) => a.id === inserted.id)) return prev;
            return [inserted, ...prev];
          });

          setPeriodStats((prev) => {
            const amt = inserted.amount || 0;
            if (
              inserted.event_type === "invoice.payment_succeeded" ||
              inserted.event_type === "checkout.session.completed"
            )
              return { ...prev, revenue: prev.revenue + amt };
            if (inserted.event_type === "invoice.payment_failed")
              return { ...prev, failed: prev.failed + amt };
            if (inserted.event_type === "customer.subscription.deleted")
              return { ...prev, lost: prev.lost + amt };
            return prev;
          });

          // Update at-risk list properly
if (
  inserted.customer_risk_level === "high" &&
  inserted.customer_email
) {
  setAtRiskCustomers((prev) => {
    const exists = prev.find(
      (c) => c.email === inserted.customer_email
    );

    if (exists) {
      return prev.map((c) =>
        c.email === inserted.customer_email
          ? {
              ...c,
              attempts: inserted.attempt_count || c.attempts,
              last_event: inserted.event_type,
            }
          : c
      );
    }

    return [
      ...prev,
      {
        email: inserted.customer_email,
        risk: "high",
        attempts: inserted.attempt_count || 0,
        last_event: inserted.event_type,
      },
    ];
  });
}
}
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "stripe_events",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as any;

          // ✅ FIX: update unattended when resolved
if (
  updated.event_type === "invoice.payment_failed" &&
  (updated.action_status === "contacted_slack" ||
    updated.action_status === "taken" ||
    updated.deleted_at !== null)
) {
  const key = updated.invoice_id ?? updated.stripe_event_id;

  if (!key) return;

  // ✅ PREVENT DOUBLE SUBTRACTION
  if (processedResolvedInvoices.current.has(key)) {
    return;
  }

  processedResolvedInvoices.current.add(key);

  setUnattended((prev) => {
    const amt = updated.amount || 0;
    return Math.max(prev - amt, 0);
  });
}

          // Soft-deleted — remove from UI
          if (updated.deleted_at !== null) {
            setAlerts((prev) => prev.filter((a) => a.id !== updated.id));
            return;
          }

          // Otherwise update normally (action_status, contacted_slack, etc.)
          setAlerts((prev) =>
            prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a))
          );
          // ✅ REMOVE from at-risk if resolved
if (
  updated.action_status === "contacted_slack" ||
  updated.action_status === "taken" ||
  updated.deleted_at !== null
) {
  setAtRiskCustomers((prev) =>
    prev.filter((c) => c.email !== updated.customer_email)
  );
}
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "stripe_events",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const deleted = payload.old as any;
          console.log("📡 Realtime DELETE:", deleted?.id);
          setAlerts((prev) => prev.filter((a) => a.id !== deleted.id));
        }
      )
      .subscribe((status) => {
        console.log("📡 Realtime status:", status);
      });

    return () => {
      console.log("📡 Unsubscribing realtime");
      supabase.removeChannel(channel);
    };
  }, [stripeAccountId, userId]);

  // Action required = failed + churn only (not success, not new checkout)
  const actionRequiredCount = alerts.filter(
    (a) =>
      a.event_type !== "invoice.payment_succeeded" &&
      a.event_type !== "checkout.session.completed" &&
      a.action_status === "required"
  ).length;

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse" />
          Loading
        </div>
      </div>
    );
  }
  
  const handleConnect = () => {
  if (!userId) {
    console.error("❌ No userId available for Stripe connect");
    return;
  }

  window.location.href = `/api/stripe/oauth?userId=${userId}`;
};

  const refreshDashboard = async () => {
  setRefreshing(true);

  await fetchDashboardData();

  setRefreshing(false);
};

  /* ── Filter logic ── */
  const filteredAlerts = alerts.filter((a) => {
    const isNoAction =
      a.event_type === "invoice.payment_succeeded" ||
      a.event_type === "checkout.session.completed";

    if (actionFilter !== "all" && isNoAction) return false;

    if (alertFilter !== "all") {
      if (
        alertFilter === "payment_failed" &&
        a.event_type !== "invoice.payment_failed"
      )
        return false;
      if (
        alertFilter === "payment_succeeded" &&
        a.event_type !== "invoice.payment_succeeded"
      )
        return false;
      if (
        alertFilter === "subscription_deleted" &&
        a.event_type !== "customer.subscription.deleted"
      )
        return false;
      if (
        alertFilter === "checkout" &&
        a.event_type !== "checkout.session.completed"
      )
        return false;
    }

    if (actionFilter !== "all") {
      if (actionFilter === "taken") {
        if (
          a.action_status !== "taken" &&
          a.action_status !== "contacted_slack"
        )
          return false;
      } else {
        if (a.action_status !== actionFilter) return false;
      }
    }

    return true;
  });

  const visibleAlerts = filteredAlerts.slice(0, visibleCount);

  const RANGE_LABELS: Record<string, string> = {
    "12h": "12h",
    "3": "3d",
    "7": "7d",
    "15": "15d",
    "30": "30d",
    "60": "60d",
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white">

      <div className="border-b border-white/5 bg-zinc-900 px-6 py-4 flex justify-between items-center">
  <div className="font-display text-lg tracking-tight">
    Recoora
  </div>

  <div className="flex items-center gap-6 text-sm">
    <button
      onClick={handleLogout}
      className="text-rose-400 hover:text-rose-300 transition"
    >
      Logout
    </button>
  </div>
</div>

      {/* ── Trial expired overlay ── */}
      {isBillingInactive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="max-w-sm w-full rounded-2xl border border-white/8 bg-zinc-900 p-8 text-center shadow-2xl mx-4">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <span className="text-amber-400 text-lg font-bold">!</span>
            </div>
            <h2 className="text-lg font-semibold text-white">Trial expired</h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Upgrade to continue monitoring your Stripe revenue in real-time.
            </p>
            <div className="mt-6">
              <UpgradeButton
  plan={plan}
  status={subscription_status}
  subscriptionId={null}
  cancelAtPeriodEnd={false}
/>
            </div>
          </div>
        </div>
      )}

      <div className={isBillingInactive ? "pointer-events-none blur-sm" : ""}>

        {/* ── Banners ── */}
        {!stripeConnected && !isBillingInactive && (
          <StripeConnectBanner onConnect={handleConnect} />
        )}
        {!slackConnected && !isBillingInactive && (
          <SlackConnectBanner onConnect={() => console.log("Slack connect")} />
        )}

        {/* ── Page content ── */}
        <div className="max-w-6xl mx-auto px-6 py-10">

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight">
                Dashboard
              </h1>
              <p className="text-zinc-500 text-sm mt-0.5">
                Revenue activity overview
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refreshDashboard}
                disabled={refreshing}
                className="text-sm text-zinc-400 hover:text-white border border-white/8 hover:border-white/15 px-3.5 py-1.5 rounded-lg transition bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40"
              >
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
              <Link
                href="/dashboard/settings"
                className="text-sm text-zinc-400 hover:text-white border border-white/8 hover:border-white/15 px-3.5 py-1.5 rounded-lg transition bg-zinc-900 hover:bg-zinc-800"
              >
                Settings
              </Link>
            </div>
          </div>

          {/* ── Empty state ── */}
          {!stripeConnected ? (
            <div className="border border-white/6 rounded-xl p-16 text-center bg-zinc-900/40">
              <p className="text-zinc-400 text-sm">
                Connect Stripe to start monitoring revenue
              </p>
            </div>
          ) : (
            <>
             <div className="border border-white/6 rounded-xl p-5 bg-zinc-900/40 mb-6">
  <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1.5">
    Unattended Revenue
  </p>

  <p
    className={`text-2xl font-semibold ${
      unattended > 0 ? "text-red-400" : "text-emerald-400"
    }`}
  >
    ${(unattended / 100).toFixed(2)}
  </p>

  <p className="text-xs text-zinc-500 mt-1">
    last 7 days • not yet handled
  </p>
</div>

              {/* ── Range selector ── */}
              <div className="flex items-center gap-1.5 mb-8">
                {(["12h", "3", "7", "15", "30", "60"] as const).map((r) => {
                  const locked = isLocked(r);
                  return (
                    <button
                      key={r}
                      onClick={() => !locked && setRange(r)}
                      disabled={locked}
                      className={`
                        px-3 py-1.5 rounded-lg text-xs font-medium transition
                        ${
                          range === r
                            ? "bg-white text-black"
                            : "text-zinc-400 hover:text-white border border-white/8 hover:border-white/15 bg-zinc-900/60"
                        }
                        ${locked ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                      `}
                    >
                      {RANGE_LABELS[r]}
                      {locked && (
                        <span className="ml-1 text-[9px] opacity-60">Pro</span>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* ── Stat cards ── */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="border border-white/6 rounded-xl p-5 bg-zinc-900/40">
                  <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
                    Revenue
                  </p>
                  <p className="text-xl font-semibold text-emerald-400">
                    ${(periodStats.revenue / 100).toFixed(2)}
                  </p>
                </div>
                <div className="border border-white/6 rounded-xl p-5 bg-zinc-900/40">
                  <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
                    Failed
                  </p>
                  <p className="text-xl font-semibold text-amber-400">
                    ${(periodStats.failed / 100).toFixed(2)}
                  </p>
                </div>
                <div className="border border-white/6 rounded-xl p-5 bg-zinc-900/40">
                  <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
                    Lost
                  </p>
                  <p className="text-xl font-semibold text-red-400">
                    ${(periodStats.lost / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* ── At-risk customers ── */}
              {atRiskCustomers.length > 0 && (
                <div className="border border-red-500/15 rounded-xl bg-red-500/5 px-5 py-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-red-400 text-xs font-semibold uppercase tracking-widest">
                      🚨 {atRiskCustomers.length} customer
                      {atRiskCustomers.length > 1 ? "s" : ""} at risk
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {atRiskCustomers.map((c) => (
                      <div
                        key={c.email}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                          <span className="text-zinc-300 text-xs font-mono">
                            {c.email}
                          </span>
                        </div>
                        <span className="text-zinc-500 text-[11px]">
                          {c.last_event === "customer.subscription.deleted"
                            ? "subscription cancelled"
                            : `${c.attempts} failed attempt${
                                c.attempts !== 1 ? "s" : ""
                              }`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Alerts panel ── */}
              <div className="border border-white/6 rounded-xl bg-zinc-900/40">

                {/* Panel header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-semibold text-white">
                      Live Alerts
                    </h2>
                    {actionRequiredCount > 0 ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/20">
                        {actionRequiredCount} need attention
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500">
                        All clear
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={alertFilter}
                      onChange={(e) => setAlertFilter(e.target.value)}
                      className="text-xs bg-zinc-800 border border-white/8 text-zinc-300 rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-white/15 transition focus:outline-none"
                    >
                      <option value="all">All events</option>
                      <option value="payment_failed">Failed</option>
                      <option value="payment_succeeded">Paid</option>
                      <option value="subscription_deleted">Churned</option>
                      <option value="checkout">New</option>
                    </select>

                    <select
                      value={actionFilter}
                      onChange={(e) => setActionFilter(e.target.value)}
                      className="text-xs bg-zinc-800 border border-white/8 text-zinc-300 rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-white/15 transition focus:outline-none"
                    >
                      <option value="all">All status</option>
                      <option value="required">Needs attention</option>
                      <option value="taken">Contacted</option>
                    </select>
                  </div>
                </div>

                {/* Alerts list */}
                <div className="p-4">
                  <LiveAlerts alerts={visibleAlerts} />

                  {filteredAlerts.length > visibleCount && (
                    <div className="text-center mt-5 pt-4 border-t border-white/5">
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 10)}
                        className="text-xs text-zinc-500 hover:text-zinc-300 transition"
                      >
                        Load{" "}
                        {Math.min(filteredAlerts.length - visibleCount, 10)}{" "}
                        more ↓
                      </button>
                    </div>
                  )}

                  {filteredAlerts.length === 0 && alerts.length > 0 && (
                    <p className="text-center text-zinc-600 text-xs py-8">
                      No alerts match this filter
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}