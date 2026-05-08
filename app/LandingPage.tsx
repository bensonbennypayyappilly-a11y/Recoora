

"use client";
{/* Landing page */}


import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import WaitlistModal from "@/components/WaitlistModal";

interface Feature {
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent: string;
  iconColor: string;
  badge?: string;
}

interface FaqItem {
  q: string;
  a: string;
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [showWaitlist, setShowWaitlist] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const faqs: FaqItem[] = [
    {
      q: "Is this safe? What access does Recoora get to my Stripe?",
      a: "Recoora uses Stripe's read-only OAuth scope. We can see events (like payment failures) but we cannot charge cards, refund payments, modify subscriptions, or access full card numbers. We literally cannot touch your money. You can revoke access from Stripe's dashboard at any time in one click.",
    },
    {
      q: "Does Stripe already send me failed payment notifications?",
      a: "Stripe sends email notifications for successful charges only — not failed ones. For failure alerts, Stripe's documentation literally tells you to build your own webhook application. That's what Recoora is — but done in 5 minutes instead of days, delivered to Slack where you actually work, with a recovery email ready to send.",
    },
    {
      q: "Is this a Stripe analytics dashboard?",
      a: "No. Recoora isn't another dashboard you'll forget to open. It's a background watchdog that pushes alerts to you — in Slack — the moment something important changes. Think of it as a smoke detector for your revenue.",
    },
    {
      q: "Do I need to give full API access?",
      a: "We connect via OAuth and only listen to webhook events — we never initiate charges, never modify customer data, and never access your payout settings. Your tokens are encrypted at rest. You can disconnect at any time from your Stripe dashboard.",
    },
    {
      q: "What is the AI recovery email feature exactly?",
      a: "Coming in the Growth plan. Instead of a generic 'your payment failed' email, Recoora's AI writes a personalized message using the customer's name, their plan details, and a natural conversational tone — so it reads like you wrote it yourself. Generic dunning emails get 20% open rates. Personal ones get 50–70%. That difference recovers real money.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes. No contracts, no cancellation fees. Cancel from your dashboard in two clicks and your account closes at the end of the billing period. We'll even remind you 3 days before renewal.",
    },
    {
      q: "I only have a few customers. Is this worth it at my stage?",
      a: "Especially worth it at early stage. When you have 20 customers, losing one to a failed payment is a 5% churn event. At $11/month, recovering one $29/month subscriber in your first week makes Recoora free for the next 2.5 months. The earlier you plug the leak, the more MRR you protect.",
    },
    {
      q: "Does this replace Baremetrics or other analytics tools?",
      a: "Different job. Analytics tools help you understand the past. Recoora watches the present and tells you when something needs your attention right now. Many founders use both.",
    },
  ];

  const features: Feature[] = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      title: "Instant Payment Failure Alerts",
      desc: "The moment Stripe registers a declined charge, you know about it. Not 3 hours later when you check your dashboard — within seconds. Every failed payment is an opportunity to recover before the customer moves on.",
      accent: "from-amber-50 to-orange-50",
      iconColor: "text-amber-500",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
        </svg>
      ),
      title: "Cancellation Alerts — Before They're Gone",
      desc: "When a customer cancels, the first 15 minutes are critical. A personal response in that window recovers 30–40% of cancellations. Recoora puts that window in your hands, every time.",
      accent: "from-rose-50 to-pink-50",
      iconColor: "text-rose-500",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
      title: "2-Click Recovery Emails",
      desc: "Every alert includes a pre-filled, editable recovery email — the customer's name, the amount, their email pre-loaded. You review, adjust if needed, and send. Done in under 90 seconds.",
      accent: "from-emerald-50 to-teal-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      ),
      title: "AI-Personalized Recovery Emails",
      desc: "Generic dunning emails get ignored. AI-written emails that feel personal — referencing the customer by name, their plan, their context — get read, get clicked, and get payments recovered. Not a template. A real human-sounding message every time.",
      accent: "from-violet-50 to-purple-50",
      iconColor: "text-violet-500",
      badge: "Coming in Growth plan",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Syne', sans-serif; }

        .gradient-text {
          background: linear-gradient(135deg, #0f0f0f 0%, #3f3f46 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .accent-text {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glow-green { box-shadow: 0 0 40px rgba(16, 185, 129, 0.25); }
        .card-border { border: 1px solid rgba(0,0,0,0.07); }
        .card-border-emerald { border: 1px solid rgba(16,185,129,0.25); }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .float { animation: float 4s ease-in-out infinite; }

        .pulse-dot::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse-ring 1.5s ease-out infinite;
        }

        .animate-fade-up   { animation: fadeUp 0.6s ease both; }
        .animate-fade-up-1 { animation: fadeUp 0.6s 0.1s ease both; opacity: 0; }
        .animate-fade-up-2 { animation: fadeUp 0.6s 0.2s ease both; opacity: 0; }
        .animate-fade-up-3 { animation: fadeUp 0.6s 0.3s ease both; opacity: 0; }
        .animate-fade-up-4 { animation: fadeUp 0.6s 0.4s ease both; opacity: 0; }

        .roi-card {
          background: linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(5,150,105,0.03) 100%);
          border: 1px solid rgba(16,185,129,0.18);
        }

        .comparison-row:hover td { background: rgba(0,0,0,0.015); }

        .ai-email-section {
          background: linear-gradient(135deg, rgba(139,92,246,0.04) 0%, rgba(109,40,217,0.02) 100%);
          border: 1px solid rgba(139,92,246,0.12);
        }

        @media (max-width: 640px) {
          .nav-links-desktop { display: none; }
          .hero-title { font-size: 2.8rem !important; letter-spacing: -0.05em; }
          .hero-sub { font-size: 1.05rem !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .comp-table-wrap { overflow-x: auto; }
          .roi-grid { grid-template-columns: 1fr 1fr !important; }
          .ai-grid { grid-template-columns: 1fr !important; }
          .footer-inner { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .footer-links { flex-wrap: wrap; gap: 1rem; }
          .trust-row { flex-direction: column; gap: 0.5rem; align-items: center; }
        }

        @media (max-width: 768px) {
          .comp-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .comp-table { min-width: 560px; }
        }
      `}</style>

      {/* ═══════════════════════════════════════
          NAV
      ═══════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-zinc-200 py-3 shadow-sm"
          : "bg-transparent py-5"
      }`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Recoora" className="w-9 h-9 rounded-md" />
            <span className="font-display font-bold text-lg tracking-tight text-zinc-900">Recoora</span>
          </div>

          <div className="nav-links-desktop hidden md:flex items-center gap-8">
            {[
              { label: "Features", href: "#features" },
              { label: "How it works", href: "#how-it-works" },
              { label: "Pricing", href: "#pricing" },
              { label: "FAQ", href: "#faq" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors duration-200"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="border border-emerald-500 text-emerald-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-emerald-500 hover:text-white"
            >
              Sign in
            </a>
            <a
              href="#pricing"
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        {/* Background glows — light, subtle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-400/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-teal-400/6 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-rose-400/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">

          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-8">
            <span className="relative w-2 h-2 bg-emerald-500 rounded-full pulse-dot" />
            <span className="text-xs text-emerald-700 font-medium tracking-wide">Early access — Limited beta spots</span>
          </div>

          {/* Headline */}
          <h1 className="hero-title animate-fade-up-1 font-display text-6xl md:text-8xl font-bold tracking-tight mb-4 leading-none">
            <span className="gradient-text">Your Stripe revenue<br />is leaking </span>
            <span className="accent-text italic">silently.</span>
            <br />
            <span className="gradient-text">Fix it in </span>
            <span className="accent-text">seconds.</span>
          </h1>

          <p className="hero-sub animate-fade-up-2 text-zinc-500 text-xl md:text-2xl font-light max-w-2xl mx-auto mt-6 mb-3 leading-relaxed">
            Get alerted the{" "}
            <strong className="text-zinc-800 font-medium">moment a payment fails or a customer cancels</strong>{" "}
            — and recover it before they're gone. Built for indie founders who can't afford to miss a single dollar.
          </p>

          <p className="animate-fade-up-2 text-zinc-400 text-sm mb-10">
            Powered by real Stripe webhooks — not estimates or dashboards.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up-3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href="#pricing"
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-10 py-4 rounded-xl text-base transition-all duration-200 glow-green hover:shadow-emerald-500/30 hover:shadow-xl"
            >
              Start Free Trial →
            </a>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto border border-zinc-300 hover:border-zinc-400 text-zinc-600 hover:text-zinc-900 font-medium px-6 py-4 rounded-xl text-sm transition-all duration-200 hover:bg-zinc-50 text-center"
            >
              See How It Works
            </a>
          </div>

          {/* Trust row */}
          <div className="trust-row animate-fade-up-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-2 text-zinc-400 text-xs">
            <span className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> Read-only Stripe access</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> No billing permissions</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> Setup in under 5 minutes</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> 14-day free trial</span>
          </div>

          {/* Product Mockup */}
          <div className="float max-w-3xl mx-auto mt-12">
            <div className="relative bg-zinc-900 rounded-2xl p-1 shadow-2xl shadow-zinc-400/30 border border-zinc-200">
              {/* Window chrome */}
              <div className="bg-zinc-800/80 rounded-xl px-4 py-3 flex items-center gap-2 mb-1">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-zinc-700/60 rounded-md h-5 mx-4 flex items-center px-3">
                  <span className="text-zinc-400 text-xs">app.recoora/dashboard</span>
                </div>
              </div>

              <div className="bg-zinc-950 rounded-xl p-4 md:p-6">
                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[
                    { label: "Events (24h)", value: "18", change: "Live tracking", up: true },
                    { label: "Alerts Sent", value: "6", change: "Slack delivered", up: true },
                    { label: "Failed Payments", value: "3", change: "Action required", up: false },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-zinc-900 border border-white/5 rounded-xl p-3 md:p-4 text-left">
                      <div className="text-zinc-500 text-xs mb-1">{stat.label}</div>
                      <div className="font-display font-bold text-lg md:text-xl text-white">{stat.value}</div>
                      <div className={`text-xs mt-1 ${stat.up ? "text-emerald-400" : "text-amber-400"}`}>{stat.change}</div>
                    </div>
                  ))}
                </div>

                {/* Alert feed */}
                <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
                  <div className="text-zinc-500 text-xs mb-3 font-medium uppercase tracking-wider">
                    Example alerts from a connected Stripe account
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { time: "2m ago", msg: "Payment Failed — $149 — customer@email.com", color: "text-amber-400", icon: "⚠", actionable: true },
                      { time: "14m ago", msg: "Payment Received — $391", color: "text-emerald-400", icon: "✓", actionable: false },
                      { time: "1h ago", msg: "Subscription Cancelled — $29 — customer@email.com", color: "text-rose-400", icon: "↓", actionable: true },
                    ].map((alert, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <span className={`${alert.color} font-bold w-4 text-center shrink-0`}>{alert.icon}</span>
                        <span className="text-zinc-300 flex-1 text-left text-xs md:text-sm truncate">{alert.msg}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {alert.actionable && (
                            <span className="hidden sm:inline-block text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                              Recover →
                            </span>
                          )}
                          <span className="text-zinc-600 text-xs">{alert.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SOCIAL PROOF STRIP
      ═══════════════════════════════════════ */}
      <section className="py-14 px-6 border-y border-zinc-100 bg-zinc-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-zinc-400 text-xs uppercase tracking-widest mb-7 font-medium">Built for indie SaaS founders</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["Micro SaaS", "Solo Founders", "Indie Hackers", "Bootstrappers", "Side Projects"].map((label) => (
              <div
                key={label}
                className="bg-white border border-zinc-200 rounded-xl px-5 py-2.5 text-zinc-600 text-sm font-medium hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200 shadow-sm"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ROI BANNER
      ═══════════════════════════════════════ */}
      <section className="py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="roi-card rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="flex-1">
              <div className="text-emerald-600 text-xs font-semibold tracking-widest uppercase mb-3 font-display">The math is simple</div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-zinc-900 mb-3 leading-tight">
                One recovered payment.<br />Months of Recoora paid for.
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-md">
                At $11/month, a single $29 subscription recovered pays for nearly 3 months. The ROI is immediate and obvious — no spreadsheet needed.
              </p>
            </div>
            <div className="roi-grid grid grid-cols-3 gap-3 w-full md:w-auto md:shrink-0">
              {[
                { value: "9%", label: "avg MRR lost to\nfailed payments", color: "text-rose-500" },
                { value: "$11", label: "cost per month\nto fix it", color: "text-amber-500" },
                { value: "∞", label: "ROI after first\nrecovery", color: "text-emerald-600" },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-zinc-200 rounded-xl p-4 text-center shadow-sm min-w-[90px]">
                  <div className={`font-display text-2xl md:text-3xl font-bold mb-1.5 ${s.color}`}>{s.value}</div>
                  <div className="text-zinc-400 text-xs leading-tight whitespace-pre-line">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════ */}
      <section id="features" className="py-20 px-6 bg-zinc-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-emerald-600 text-xs font-semibold tracking-widest uppercase mb-4 font-display">Features</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold gradient-text mb-4">
              Everything you need.<br />Nothing you don't.
            </h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">
              Covers the only events that actually lose you money — and makes recovery effortless.
            </p>
          </div>
          <div className="features-grid grid md:grid-cols-2 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className={`relative bg-gradient-to-br ${f.accent} border border-zinc-200 rounded-2xl p-7 md:p-8 hover:border-zinc-300 hover:shadow-md transition-all duration-300 group bg-white`}
              >
                <div className={`${f.iconColor} mb-5 p-3 bg-white border border-zinc-200 rounded-xl inline-block shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-xl text-zinc-900 mb-3">{f.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
                {f.badge && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-600 text-xs font-medium px-3 py-1.5 rounded-lg">
                    <span>✦</span> {f.badge}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-emerald-600 text-xs font-semibold tracking-widest uppercase mb-4 font-display">How it works</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold gradient-text mb-4">
              Up and running<br />in under 5 minutes.
            </h2>
            <p className="text-zinc-500 text-lg">No engineering required. No complex setup.</p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-10 left-[18%] right-[18%] h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent" />
            <div className="steps-grid grid md:grid-cols-3 gap-5">
              {[
                {
                  step: "01",
                  title: "Connect Stripe",
                  desc: "Connect via Stripe OAuth in one click. Read-only access only — we never touch your billing or customer data.",
                  badge: "Zero billing permissions",
                },
                {
                  step: "02",
                  title: "Automatic Detection",
                  desc: "The moment a payment fails or a subscription cancels, Recoora catches it via real Stripe webhooks — not polling, not estimates.",
                  badge: "Powered by webhooks",
                },
                {
                  step: "03",
                  title: "Get Notified. Recover.",
                  desc: "Alert hits Slack in seconds. Click to open a pre-filled recovery email. Send it. Most recoveries happen before the customer even notices.",
                  badge: "2-click recovery",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="text-center bg-white border border-zinc-200 rounded-2xl p-7 hover:border-emerald-300 hover:shadow-md transition-all duration-300 shadow-sm"
                >
                  <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <span className="font-display font-bold text-emerald-600 text-lg">{item.step}</span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-zinc-900 mb-3">{item.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-4">{item.desc}</p>
                  <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium">
                    <span>✓</span> {item.badge}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          AI EMAIL SECTION
      ═══════════════════════════════════════ */}
      <section className="py-20 px-6 bg-zinc-50">
        <div className="max-w-5xl mx-auto">
          <div className="ai-grid grid md:grid-cols-2 gap-8 md:gap-12 items-center ai-email-section rounded-2xl p-7 md:p-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-600 text-xs font-medium px-3 py-1.5 rounded-lg mb-5">
                <span>✦</span> Coming soon · Growth plan
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-zinc-900 mb-4 leading-tight">
                The difference between<br />a template and{" "}
                <span className="italic text-violet-600">a conversation.</span>
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                Generic "your payment failed" emails get a 20% open rate and get ignored. Recoora's AI writes recovery emails that feel like they came from you personally — because that's what actually recovers revenue.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-rose-500 mt-0.5 shrink-0">✗</span>
                  <span className="text-zinc-400 italic">"Your payment of $29 has failed. Please update your payment method."</span>
                </div>
                <div className="text-zinc-300 text-xs pl-5 font-mono">vs</div>
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                  <span className="text-zinc-700">AI writes a message that sounds like <em>you</em>. Personal. Warm. Gets read. Gets paid.</span>
                </div>
              </div>
            </div>

            {/* Email preview card */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-lg shadow-zinc-200/60">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 bg-zinc-50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  R
                </div>
                <div>
                  <div className="text-zinc-800 text-sm font-medium">Ryan (via Recoora AI)</div>
                  <div className="text-zinc-400 text-xs font-mono">ryan@yourapp.com</div>
                </div>
              </div>
              <div className="px-5 pt-4 pb-1 border-b border-zinc-100">
                <div className="text-zinc-400 text-xs mb-1">Subject</div>
                <div className="text-zinc-800 text-sm font-medium">Re: Quick thing on your account, Sarah</div>
              </div>
              <div className="px-5 py-4 text-zinc-700 text-sm leading-relaxed">
                Hey Sarah,<br /><br />
                Hope the <span className="text-emerald-600 font-medium">design work</span> is going well — just flagged that your card had a small hiccup on the renewal today.<br /><br />
                Probably just expired (happens to everyone). Here's a{" "}
                <span className="text-emerald-600 underline cursor-pointer">direct link to update it</span>{" "}
                — takes 30 seconds.<br /><br />
                Let me know if anything comes up.<br /><br />
                — Ryan
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          COMPETITOR COMPARISON
      ═══════════════════════════════════════ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-emerald-600 text-xs font-semibold tracking-widest uppercase mb-4 font-display">Why Recoora</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold gradient-text mb-4">
              Built for founders,<br />not enterprises.
            </h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">
              Enterprise tools charge $249–$599/month for features you don't need. Recoora does the one thing that matters — at a price that makes sense.
            </p>
          </div>

          <div className="comp-table-wrap rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            <table className="comp-table w-full border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="text-left px-5 py-4 text-zinc-500 font-medium text-xs uppercase tracking-wider">Feature</th>
                  <th className="text-center px-5 py-4 text-emerald-600 font-semibold text-xs uppercase tracking-wider bg-emerald-50">Recoora</th>
                  <th className="text-center px-5 py-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Churn Buster</th>
                  <th className="text-center px-5 py-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Baremetrics</th>
                  <th className="text-center px-5 py-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">DIY Stripe</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feature: "Real-time failure alerts",
                    r:   { v: "✓ Instant",  c: "text-emerald-600 font-medium" },
                    cb:  { v: "✓",          c: "text-emerald-500" },
                    bm:  { v: "~ Delayed",  c: "text-amber-500" },
                    diy: { v: "✗ Manual",   c: "text-rose-500" },
                  },
                  {
                    feature: "2-click recovery emails",
                    r:   { v: "✓",         c: "text-emerald-600 font-medium" },
                    cb:  { v: "~ Complex", c: "text-amber-500" },
                    bm:  { v: "✗",         c: "text-rose-500" },
                    diy: { v: "✗",         c: "text-rose-500" },
                  },
                  {
                    feature: "AI-personalized emails",
                    r:   { v: "✦ Coming", c: "text-violet-600 font-medium" },
                    cb:  { v: "✗",        c: "text-rose-500" },
                    bm:  { v: "✗",        c: "text-rose-500" },
                    diy: { v: "✗",        c: "text-rose-500" },
                  },
                  {
                    feature: "Cancellation alerts",
                    r:   { v: "✓", c: "text-emerald-600 font-medium" },
                    cb:  { v: "✓", c: "text-emerald-500" },
                    bm:  { v: "✓", c: "text-emerald-500" },
                    diy: { v: "✗", c: "text-rose-500" },
                  },
                  {
                    feature: "Setup time",
                    r:   { v: "5 minutes", c: "text-emerald-600 font-medium" },
                    cb:  { v: "Hours",     c: "text-amber-500" },
                    bm:  { v: "30+ min",   c: "text-amber-500" },
                    diy: { v: "Days",      c: "text-rose-500" },
                  },
                  {
                    feature: "Pricing",
                    r:   { v: "From $11/mo",   c: "text-emerald-600 font-semibold" },
                    cb:  { v: "From $249/mo",  c: "text-rose-500" },
                    bm:  { v: "From $129/mo",  c: "text-rose-500" },
                    diy: { v: "Dev time cost", c: "text-amber-500" },
                  },
                ].map((row, i) => (
                  <tr key={i} className="comparison-row border-t border-zinc-100">
                    <td className="px-5 py-4 text-zinc-700 font-medium">{row.feature}</td>
                    <td className={`px-5 py-4 text-center ${row.r.c} bg-emerald-50/50`}>{row.r.v}</td>
                    <td className={`px-5 py-4 text-center ${row.cb.c}`}>{row.cb.v}</td>
                    <td className={`px-5 py-4 text-center ${row.bm.c}`}>{row.bm.v}</td>
                    <td className={`px-5 py-4 text-center ${row.diy.c}`}>{row.diy.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PRICING
      ═══════════════════════════════════════ */}
      <section id="pricing" className="py-24 px-6 bg-zinc-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-emerald-600 text-xs font-semibold tracking-widest uppercase mb-4 font-display">Pricing</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold gradient-text mb-4">
              Start free.<br />Upgrade when you grow.
            </h2>
            <p className="text-emerald-600 text-sm font-medium mb-2">14-day free trial — no credit card required</p>
            <p className="text-zinc-500 text-lg">One recovered payment pays for months of monitoring.</p>
          </div>

          <div className="pricing-grid grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">

            {/* STARTER */}
            <div className="relative bg-white border border-zinc-200 rounded-2xl p-8 hover:border-zinc-300 hover:shadow-md transition-all duration-300 shadow-sm">
              <div className="mb-6">
                <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3 font-display">Starter</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="font-display font-bold text-4xl text-zinc-900">$11</span>
                  <span className="text-zinc-400 mb-1.5 text-sm">/month</span>
                </div>
                <p className="text-zinc-400 text-xs mt-1">Monitor and recover revenue in real-time</p>
              </div>

              <ul className="space-y-3 mb-8 text-sm">
                {[
                  "Real-time failed payment alerts",
                  "2-click recovery emails (prefilled)",
                  "Churn & cancellation alerts",
                  "Slack notifications included",
                  "1 Stripe account",
                  "7-day alert history",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-zinc-600">
                    <span className="text-emerald-500 shrink-0 mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>

              <a
                href="/login"
                className="block w-full border border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white font-semibold py-3.5 rounded-xl text-center text-sm transition-all duration-200"
              >
                Start 14-day free trial
              </a>
              <p className="text-xs text-zinc-400 text-center mt-3">Setup in under 5 minutes</p>
            </div>

            {/* GROWTH — Featured */}
            <div className="relative bg-white rounded-2xl p-8 shadow-xl shadow-emerald-100/80 hover:shadow-emerald-200/80 transition-all duration-300 border border-emerald-300">
              {/* Most popular badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap font-display">
                MOST POPULAR
              </div>

              <div className="mb-6">
                <div className="text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-3 font-display">Growth</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="font-display font-bold text-4xl text-zinc-900">$33</span>
                  <span className="text-zinc-400 mb-1.5 text-sm">/month</span>
                </div>
                <p className="text-zinc-400 text-xs mt-1">Everything in Starter + AI recovery emails</p>
              </div>

              <ul className="space-y-3 mb-4 text-sm">
                {[
                  { text: "Everything in Starter", ai: false },
                  { text: "AI-personalized recovery emails", ai: true },
                  { text: "Email + Slack notifications", ai: false },
                  { text: "30-day alert history", ai: false },
                  
                ].map((f) => (
                  <li key={f.text} className="flex items-start gap-3 text-zinc-600">
                    <span className={`shrink-0 mt-0.5 ${f.ai ? "text-violet-500" : "text-emerald-500"}`}>
                      {f.ai ? "✦" : "✓"}
                    </span>
                    <span className={f.ai ? "text-violet-700 font-medium" : ""}>{f.text}</span>
                  </li>
                ))}
              </ul>

              {/* Launching soon notice */}
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
                <span className="text-amber-500 shrink-0 mt-0.5 text-sm">⚡</span>
                <p className="text-amber-700 text-xs leading-relaxed">
                  <strong className="text-amber-800">Launching soon.</strong> Join the waitlist — you'll be first to know and get early access pricing locked in.
                </p>
              </div>

              <button
  onClick={() => setShowWaitlist(true)}
  className="block w-full bg-emerald-500 text-white py-3.5 rounded-xl text-sm"
>
  Join the waitlist →
</button>
              <p className="text-xs text-zinc-400 text-center mt-3">Lock in early access pricing</p>
            </div>

          </div>

          <p className="text-center text-zinc-400 text-xs mt-8 font-mono">
            ✓ 14-day free trial on Starter &nbsp;·&nbsp; ✓ No credit card required &nbsp;·&nbsp; ✓ Cancel anytime
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FAQ
      ═══════════════════════════════════════ */}
      <section id="faq" className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-emerald-600 text-xs font-semibold tracking-widest uppercase mb-4 font-display">FAQ</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold gradient-text mb-4">Questions answered.</h2>
            <p className="text-zinc-500">Everything a founder wants to know before connecting their Stripe.</p>
          </div>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-zinc-300 hover:shadow-sm transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors gap-4"
                >
                  <span className="font-medium text-zinc-800 text-sm">{faq.q}</span>
                  <span className={`text-emerald-500 transition-transform duration-200 shrink-0 text-lg leading-none ${openFaq === i ? "rotate-45" : ""}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-zinc-500 text-sm leading-relaxed border-t border-zinc-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6 relative overflow-hidden bg-zinc-50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />

        <div className="max-w-2xl mx-auto text-center relative">
          <h2 className="font-display text-4xl md:text-6xl font-bold gradient-text mb-4 leading-tight">
            Stop losing revenue<br />you've already earned.
          </h2>
          <p className="text-zinc-500 text-lg md:text-xl mb-10 max-w-lg mx-auto leading-relaxed">
            Every day without Recoora is a day where failed payments silently cancel themselves. Set it up in 5 minutes.
          </p>
          <a
            href="#pricing"
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-10 py-4 rounded-xl text-base transition-all duration-200 glow-green hover:shadow-emerald-500/30 hover:shadow-xl"
          >
            Start Free Trial Today →
          </a>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-zinc-400 text-xs">
            <span className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> 5-minute setup</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> Read-only Stripe access</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}
      <footer className="border-t border-zinc-200 bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="footer-inner flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Recoora" className="w-9 h-9 rounded-md" />
              <span className="font-display font-bold text-zinc-900 text-lg">Recoora</span>
            </div>
            <div className="footer-links flex items-center gap-6 md:gap-8">
              {[
                { name: "Features", href: "#features" },
                { name: "Pricing", href: "#pricing" },
                { name: "FAQ", href: "#faq" },
                { name: "Privacy", href: "/privacy" },
                { name: "Terms", href: "/terms" },
              ].map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-zinc-400 hover:text-zinc-700 text-sm transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-zinc-100 text-center text-zinc-400 text-xs">
            © 2026 Recoora. Built for founders who'd rather ship than stare at dashboards.
          </div>
        </div>
      </footer>

      {showWaitlist && (
  <WaitlistModal onClose={() => setShowWaitlist(false)} />
)}

    </div>
  );
}