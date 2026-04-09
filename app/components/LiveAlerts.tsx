"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Alert = {
  id: string;
  event_type: string;
  customer_email: string;
  amount: number;
  created_at: string;
  action_status: string;
  plan_name?: string;
  stripe_event_id?: string;
  attempt_count?: number;
  failure_reason?: string;
  customer_risk_level?: string;
};

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const EVENT_CONFIG: Record<
  string,
  {
    label: string;
    dotColor: string;
    textAccent: string;
    badgeBg: string;
    badgeText: string;
    badgeLabel: string;
    rowBorder: string;
  }
> = {
  "invoice.payment_failed": {
    label: "Payment Failed",
    dotColor: "bg-amber-400",
    textAccent: "text-amber-400",
    badgeBg: "bg-amber-400/10 border-amber-400/20",
    badgeText: "text-amber-400",
    badgeLabel: "FAILED",
    rowBorder: "border-l-amber-400/60",
  },
  "payment_intent.payment_failed": {
    label: "Payment Failed",
    dotColor: "bg-amber-400",
    textAccent: "text-amber-400",
    badgeBg: "bg-amber-400/10 border-amber-400/20",
    badgeText: "text-amber-400",
    badgeLabel: "FAILED",
    rowBorder: "border-l-amber-400/60",
  },
  "customer.subscription.deleted": {
    label: "Subscription Cancelled",
    dotColor: "bg-red-400",
    textAccent: "text-red-400",
    badgeBg: "bg-red-400/10 border-red-400/20",
    badgeText: "text-red-400",
    badgeLabel: "CHURNED",
    rowBorder: "border-l-red-400/60",
  },
  "invoice.payment_succeeded": {
    label: "Payment Received",
    dotColor: "bg-emerald-400",
    textAccent: "text-emerald-400",
    badgeBg: "bg-emerald-400/10 border-emerald-400/20",
    badgeText: "text-emerald-400",
    badgeLabel: "PAID",
    rowBorder: "border-l-emerald-400/60",
  },
  "checkout.session.completed": {
    label: "New Subscription",
    dotColor: "bg-sky-400",
    textAccent: "text-sky-400",
    badgeBg: "bg-sky-400/10 border-sky-400/20",
    badgeText: "text-sky-400",
    badgeLabel: "NEW",
    rowBorder: "border-l-sky-400/60",
  },
};

// ── Smart email template generator ───────────────────────────────────────────
function generateEmail(alert: Alert): { subject: string; body: string } {
    const amount = `$${((alert.amount || 0) / 100).toFixed(2)}`;
  const plan = alert.plan_name ? ` for ${alert.plan_name}` : "";

  if (alert.event_type === "invoice.payment_failed") {
    const reason = alert.failure_reason
      ? `\n\nThe payment declined with the following reason: "${alert.failure_reason}".`
      : "";
    const attempt = alert.attempt_count || 1;
    const urgency =
      attempt >= 3
        ? "This is our final retry attempt, so updating your payment details soon will prevent any service interruption."
        : attempt === 2
        ? "This is our second attempt — updating your payment details will ensure uninterrupted access."
        : "This is usually a quick fix.";

    return {
  subject: `⚠️ Payment failed — action needed to keep your access`,
  body: `Hi,

Looks like your recent payment of ${amount}${plan} didn’t go through.

No worries — this happens more often than you’d think.

${
  attempt >= 3
    ? "This was the final retry, so there’s a chance your access might get interrupted."
    : attempt === 2
    ? "We’ll retry again shortly, but it might fail unless it’s updated."
    : ""
}

You can quickly fix it here:
[..payment link...]

If something feels off or you need help, just reply — I’ll take care of it personally.

— [Your Product Name]`
};
  }

  if (alert.event_type === "customer.subscription.deleted") {
    return {
  subject: `Can we fix this before you leave?`,
  body: `Hi,

I saw that you cancelled your subscription${plan} — just wanted to check in.

Was something not working the way you expected?

If it was a payment issue, I can help fix it quickly.  
If it was pricing, we can figure something out.  
If it was the product itself, I’d really value your feedback.

No pressure at all — just reply if you’re open to it.

— [Your Product Name]`
};
  }

  return {
  subject: `Quick follow-up`,
  body: `Hi,

Just checking in regarding your account.

If you need any help, feel free to reply — happy to assist.

— Team`
};
}

// ── Confirmation Modal ────────────────────────────────────────────────────────
function ConfirmModal({
  count,
  onConfirm,
  onCancel,
}: {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        <div className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <span className="text-red-400 text-sm font-bold">!</span>
        </div>
        <h3 className="text-white text-sm font-semibold mb-1">
          Delete {count} alert{count > 1 ? "s" : ""}?
        </h3>
        <p className="text-zinc-400 text-xs leading-relaxed mb-5">
          This will permanently remove{" "}
          {count === 1 ? "this alert" : `these ${count} alerts`} from your
          database. This action cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="text-xs text-zinc-400 hover:text-white border border-white/8 hover:border-white/15 px-3.5 py-1.5 rounded-lg transition bg-zinc-800/60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="text-xs text-white font-medium bg-red-500/80 hover:bg-red-500 border border-red-500/50 px-3.5 py-1.5 rounded-lg transition"
          >
            Delete {count > 1 ? `${count} alerts` : "alert"}
          </button>
        </div>
      </div>
    </div>
  );
}
function EmailGuideModal({
  onClose,
  onContinue,
  dontShow,
  setDontShow,
}: {
  onClose: () => void;
  onContinue: () => void;
  dontShow: boolean;
  setDontShow: (v: boolean) => void;
}) 

{
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-5 w-full max-w-md mx-4">
        <h3 className="text-white text-sm font-semibold mb-2">
          Improve recovery rate
        </h3>

        <ul className="text-zinc-400 text-xs space-y-2 mb-4">
          <li>• Add payment link</li>
          <li>• Offer help or discount</li>
          <li>• Keep it personal</li>
        </ul>

        <label className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
          <input
            type="checkbox"
            checked={dontShow}
            onChange={(e) => setDontShow(e.target.checked)}
          />
          Don’t show again
        </label>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-xs text-zinc-400">
            Cancel
          </button>
          <button
            onClick={onContinue}
            className="text-xs bg-white text-black px-3 py-1 rounded"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LiveAlerts({ alerts }: { alerts: Alert[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [localAlerts, setLocalAlerts] = useState<Alert[]>(alerts);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [emailGuideOpen, setEmailGuideOpen] = useState(false);
  const [dontShowGuide, setDontShowGuide] = useState(false);
  const [pendingEmailAlert, setPendingEmailAlert] = useState<Alert | null>(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  useEffect(() => {
    setLocalAlerts(alerts);
  }, [alerts]);

  const allSelected =
    localAlerts.length > 0 &&
    localAlerts.every((a) => selectedIds.includes(a.id));

  const someSelected = selectedIds.length > 0;

  const requestBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setPendingDeleteIds([...selectedIds]);
    setModalOpen(true);
  };

  const requestSingleDelete = (id: string) => {
    setPendingDeleteIds([id]);
    setModalOpen(true);
  };

  const executeDelete = async () => {
    const idsToDelete = pendingDeleteIds;
    setModalOpen(false);
    setPendingDeleteIds([]);

    const { error } = await supabase
      .from("stripe_events")
      .update({ deleted_at: new Date().toISOString() })
      .in("id", idsToDelete);

    if (error) {
      console.error("❌ Delete failed:", error);
      return;
    }

    setLocalAlerts((prev) => prev.filter((a) => !idsToDelete.includes(a.id)));
    setSelectedIds((prev) => prev.filter((id) => !idsToDelete.includes(id)));
    console.log("✅ Soft-deleted", idsToDelete.length, "alerts from DB");
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
          <span className="text-zinc-500 text-sm">○</span>
        </div>
        <p className="text-zinc-400 text-sm font-medium">No alerts yet</p>
        <p className="text-zinc-600 text-xs mt-1">
          Alerts appear here when Stripe activity happens
        </p>
      </div>
    );
  }

  return (
    <>

    {emailGuideOpen && pendingEmailAlert && (
  <EmailGuideModal
    dontShow={dontShowGuide}
    setDontShow={setDontShowGuide}
    onClose={() => {
      setEmailGuideOpen(false);
      setPendingEmailAlert(null);
    }}
    onContinue={async () => {
      const alert = pendingEmailAlert;
      setEmailGuideOpen(false);
      setDontShowGuide(true);

      if (!alert) return;

      setLoadingId(alert.id);

      const { error } = await supabase
        .from("stripe_events")
        .update({ action_status: "taken" })
        .eq("id", alert.id);

      if (!error) {
        setLocalAlerts((prev) =>
          prev.map((a) =>
            a.id === alert.id ? { ...a, action_status: "taken" } : a
          )
        );
      }

      setLoadingId(null);

      if (alert.customer_email) {
        const email = generateEmail(alert);
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
          alert.customer_email
        )}&su=${encodeURIComponent(
          email.subject
        )}&body=${encodeURIComponent(email.body)}`;
        window.open(gmailUrl, "_blank");
      }

      setPendingEmailAlert(null);
    }}
  />
)}
      {modalOpen && (
        <ConfirmModal
          count={pendingDeleteIds.length}
          onConfirm={executeDelete}
          onCancel={() => {
            setModalOpen(false);
            setPendingDeleteIds([]);
          }}
        />
      )}

      <div>
        {/* ── Top action bar ── */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds(localAlerts.map((a) => a.id));
                } else {
                  setSelectedIds([]);
                }
              }}
              className="w-3.5 h-3.5 rounded border-zinc-600 bg-zinc-800 accent-zinc-400 cursor-pointer"
            />
            <span className="text-xs text-zinc-500">
              {someSelected
                ? `${selectedIds.length} of ${localAlerts.length} selected`
                : "Select all"}
            </span>
          </label>

          {someSelected && (
            <button
              onClick={requestBulkDelete}
              className="text-xs text-red-400/80 hover:text-red-400 transition px-2.5 py-1 rounded-lg border border-red-400/20 hover:border-red-400/40 hover:bg-red-400/5"
            >
              Delete {selectedIds.length} selected
            </button>
          )}
        </div>

        {/* ── Alert rows ── */}
        <div className="space-y-1.5">
          {localAlerts.map((alert) => {
            const config = EVENT_CONFIG[alert.event_type];
            if (!config) return null;

            const isSuccess = alert.event_type === "invoice.payment_succeeded";
            const isNew = alert.event_type === "checkout.session.completed";
            const isActionable = !isSuccess && !isNew;

            const isContacted =
              alert.action_status === "taken" ||
              alert.action_status === "contacted_slack";
            const isContactedSlack = alert.action_status === "contacted_slack";
            const isActionRequired =
              isActionable && alert.action_status === "required";

            return (
              <div key={alert.id} className="flex items-center gap-3 group">
                {/* Checkbox — ALL events selectable */}
                <div className="w-4 shrink-0">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(alert.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds((prev) => [...prev, alert.id]);
                      } else {
                        setSelectedIds((prev) =>
                          prev.filter((id) => id !== alert.id)
                        );
                      }
                    }}
                    className="w-3.5 h-3.5 rounded border-zinc-600 bg-zinc-800 accent-zinc-400 cursor-pointer"
                  />
                </div>

                {/* ── Main card ── */}
                <div
                  className={`
                    flex-1 flex items-center gap-4
                    bg-zinc-900 border border-white/[0.06] rounded-lg
                    px-4 py-2.5
                    border-l-2 ${config.rowBorder}
                    hover:bg-zinc-800/60 transition-colors duration-150
                    min-w-0
                  `}
                >
                  {/* LEFT — info */}
                  <div className="flex-1 min-w-0">
                    {/* Row 1: dot + label + badges + status pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${config.dotColor}`}
                      />
                      <span
                        className={`text-[13px] font-medium shrink-0 ${config.textAccent}`}
                      >
                        {config.label}
                      </span>
                      <span
                        className={`text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${config.badgeBg} ${config.badgeText}`}
                      >
                        {config.badgeLabel}
                      </span>

                      {isActionRequired && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-zinc-800 border-white/10 text-zinc-400 shrink-0">
                          Needs attention
                        </span>
                      )}
                      {(isSuccess || isNew) && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded border bg-zinc-800/50 border-white/5 text-zinc-500 shrink-0">
                          No action
                        </span>
                      )}
                      {alert.action_status === "taken" && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shrink-0">
                          ✓ Contacted
                        </span>
                      )}
                      {isContactedSlack && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-sky-500/10 border-sky-500/20 text-sky-400 inline-flex items-center gap-1 shrink-0">
                          <svg
                            width="8"
                            height="8"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                          </svg>
                          Slack
                        </span>
                      )}
                    </div>

                    {/* Row 2: metadata — email · amount · plan · attempt · failure reason · copy */}
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-zinc-500 text-[11px] font-mono">
                        {alert.customer_email || "—"}
                      </span>
                      <span className="text-zinc-600 text-[11px]">·</span>
                      <span
                        className={`text-[11px] font-medium ${
                          isSuccess ? "text-emerald-400" : "text-zinc-300"
                        }`}
                      >
                        ${((alert.amount || 0) / 100).toFixed(2)}
                      </span>

                      {alert.plan_name && (
                        <>
                          <span className="text-zinc-600 text-[11px]">·</span>
                          <span className="text-zinc-500 text-[11px]">
                            {alert.plan_name}
                          </span>
                        </>
                      )}

                      {alert.event_type === "invoice.payment_failed" &&
                        alert.attempt_count && (
                          <>
                            <span className="text-zinc-600 text-[11px]">·</span>
                            <span className="text-amber-400/70 text-[11px]">
                              Attempt {alert.attempt_count}
                            </span>
                          </>
                        )}

                      {/* Failure reason — inline, subtle */}
                      {alert.event_type === "invoice.payment_failed" &&
                        alert.failure_reason && (
                          <>
                            <span className="text-zinc-600 text-[11px]">·</span>
                            <span
                              className="text-zinc-500 text-[11px] italic truncate max-w-[200px]"
                              title={alert.failure_reason}
                            >
                              {alert.failure_reason}
                            </span>
                          </>
                        )}

                      {alert.customer_email && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(alert.customer_email);
                            setCopiedId(alert.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="text-[11px] text-zinc-700 hover:text-zinc-400 transition opacity-0 group-hover:opacity-100"
                        >
                          {copiedId === alert.id ? "✓ copied" : "copy"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* RIGHT — timestamp + action button + delete — one line */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Timestamp */}
                    <span className="text-zinc-600 text-[11px] whitespace-nowrap">
                      {timeAgo(alert.created_at)}
                    </span>

                    {/* Contact / Undo */}
                    {isActionable &&
                      (!isContacted ? (
                        <button
                          onClick={async () => {
  if (!dontShowGuide) {
    setPendingEmailAlert(alert);
    setEmailGuideOpen(true);
    return;
  }

  setLoadingId(alert.id);

  const { data, error } = await supabase
    .from("stripe_events")
    .update({ action_status: "taken" })
    .eq("id", alert.id)
    .select();

  if (!error) {
    setLocalAlerts((prev) =>
      prev.map((a) =>
        a.id === alert.id ? { ...a, action_status: "taken" } : a
      )
    );
  }

  setLoadingId(null);

  if (alert.customer_email) {
    const email = generateEmail(alert);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      alert.customer_email
    )}&su=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(
      email.body
    )}`;
    window.open(gmailUrl, "_blank");
  }
}}
                          disabled={loadingId === alert.id}
                          className="text-[11px] font-medium text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 px-2.5 py-1 rounded-md transition disabled:opacity-40 whitespace-nowrap bg-zinc-800/60 hover:bg-zinc-800"
                        >
                          {loadingId === alert.id ? "..." : "Contact →"}
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            setLoadingId(alert.id);
                            const { error } = await supabase
                              .from("stripe_events")
                              .update({ action_status: "required" })
                              .eq("id", alert.id);
                            if (!error) {
                              setLocalAlerts((prev) =>
                                prev.map((a) =>
                                  a.id === alert.id
                                    ? { ...a, action_status: "required" }
                                    : a
                                )
                              );
                            }
                            setLoadingId(null);
                          }}
                          className="text-[11px] text-zinc-500 hover:text-zinc-300 border border-white/5 hover:border-white/10 px-2.5 py-1 rounded-md transition bg-zinc-800/30 whitespace-nowrap"
                        >
                          Undo
                        </button>
                      ))}

                    {/* Delete — hover only */}
                    <button
                      onClick={() => requestSingleDelete(alert.id)}
                      className="text-[11px] text-zinc-700 hover:text-red-400 border border-transparent hover:border-red-400/20 w-6 h-6 flex items-center justify-center rounded-md transition opacity-0 group-hover:opacity-100"
                      title="Delete alert"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}