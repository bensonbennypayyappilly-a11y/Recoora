"use client";

import Link from "next/link";

import { useState, useEffect } from "react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent: string;
  iconColor: string;
}

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  text: string;
  color: string;
}

interface FaqItem {
  q: string;
  a: string;
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [annual, setAnnual] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const faqs: FaqItem[] = [
    {
      q: "Is this a Stripe analytics dashboard?",
      a: "No. Recoora isn't another dashboard you'll forget to open. It's a background watchdog that pushes alerts to you — in Slack (email coming soon) — the moment something important changes. Think of it as a smoke detector for your revenue.",
    },
    {
      q: "Do I need to give full API access?",
      a: "We request read-only access to your Stripe account. We never touch your customer data, can't initiate charges, and follow SOC 2 security practices. Your Stripe credentials are encrypted at rest.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes. No contracts, no cancellation fees. Cancel from your dashboard in two clicks and your account closes at the end of the billing period. We'll even remind you 3 days before renewal.",
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
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      title: "Instant Payment Failure Alerts",
      desc: "Know the moment a payment fails so you can act before the customer churns.",
      accent: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
        </svg>
      ),
      title: "Know When Customers Leave",
      desc: "Get alerted immediately when a subscription cancels so you can respond before it's too late.",
      accent: "from-rose-500/20 to-pink-500/20",
      iconColor: "text-rose-400",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
      title: "Recover Failed Payments Fast",
      desc: "Every failed charge is recoverable. Reach out instantly with a prefilled email in 2 clicks.",
      accent: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
    },
  ];

  const testimonials: Testimonial[] = [];
    

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
          background: linear-gradient(135deg, #34d399 0%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glow-green { box-shadow: 0 0 40px rgba(52, 211, 153, 0.15); }
        .card-border { border: 1px solid rgba(255,255,255,0.07); }
        .noise::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.4;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .float { animation: float 4s ease-in-out infinite; }
        .pulse-dot::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: #34d399;
          animation: pulse-ring 1.5s ease-out infinite;
        }
      `}</style>

      {/* Sticky Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#09090b]/95 backdrop-blur-xl border-b border-white/5 py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Recoora" className="w-11 h-11 rounded-md" />
            <span className="font-display font-700 text-lg tracking-tight text-white">Recoora</span>
          </div>
          
          <div className="flex items-center gap-4">

  {/* Sign In (Outlined Green → Fills on Hover) */}
  <a
    href="/login"
    className="
      border border-emerald-500
      text-emerald-500
      px-5 py-2.5
      rounded-xl
      text-sm
      font-semibold
      transition-all duration-200
      hover:bg-emerald-500
      hover:text-black
    "
  >
    Sign in
  </a>

  {/* Start Monitoring (Filled Green) */}
  <a
    href="#pricing"
    className="
      bg-emerald-500
      hover:bg-emerald-400
      text-black
      text-sm
      font-semibold
      px-5 py-2.5
      rounded-xl
      transition-all duration-200
      hover:shadow-lg
      hover:shadow-emerald-500/25
    "
  >
    Start Free Trial
  </a>

</div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* bg glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-teal-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <span className="relative w-2 h-2 bg-emerald-400 rounded-full pulse-dot" />
            <span className="text-xs text-zinc-400 font-medium tracking-wide">Early access — Limited beta spots</span>
          </div>

          <h1 className="font-display text-6xl md:text-8xl font-800 tracking-tight mb-4 leading-none">
            <span className="gradient-text">Stripe alerts when revenue breaks.</span>
             <br />
             <span className="accent-text">Fix it before it compounds.</span>
          </h1>

          <p className="text-zinc-400 text-xl md:text-2xl font-300 max-w-2xl mx-auto mt-6 mb-10 leading-relaxed">
            Get alerted the moment a payment fails or a customer cancels — 
            and recover it in 2 clicks.
          </p>
          <p className="text-zinc-500 text-sm mt-4">
  Powered by real Stripe webhooks — not estimates or dashboards.
</p>
          <div className="flex flex-col items-center gap-4 mb-8">
            <a href="#pricing" className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-10 py-4 rounded-xl text-base transition-all duration-200 glow-green hover:shadow-emerald-500/30 hover:shadow-xl">
              Start Free Trial →
            </a>
            <a
  href="#how-it-works"
  className="border border-zinc-300 hover:border-zinc-400 text-zinc-700 font-medium px-6 py-3 rounded-xl text-sm transition-all duration-200 hover:bg-zinc-100"
>
  See How It Works
</a>
          </div>
             
             <div className="flex items-center justify-center gap-4 mt-4 text-zinc-400 text-xs max-w-md mx-auto text-center">
  <span>✓ Read-only Stripe access</span>
  <span>✓ No billing permissions</span>
  <span>✓ Setup in under 5 minutes</span>
</div>

          {/* Product Mockup */}
          <div className="float max-w-3xl mx-auto mt-6">
            <div className="relative bg-zinc-900 card-border rounded-2xl p-1 shadow-2xl shadow-black/60">
              {/* Window chrome */}
              <div className="bg-zinc-800/50 rounded-xl px-4 py-3 flex items-center gap-2 mb-1">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-zinc-600" />
                  <div className="w-3 h-3 rounded-full bg-zinc-600" />
                  <div className="w-3 h-3 rounded-full bg-zinc-600" />
                </div>
                <div className="flex-1 bg-zinc-700/50 rounded-md h-5 mx-4 flex items-center px-3">
                  <span className="text-zinc-500 text-xs">app.recoora/dashboard</span>
                </div>
              </div>

              <div className="bg-zinc-950 rounded-xl p-6 grid grid-cols-3 gap-4">
                {/* Stat cards */}
                {[
                  { label: "Events (24h)", value: "18", change: "Live tracking", up: true },
                  { label: "Alerts Sent", value: "6", change: "Slack delivered", up: true },
                  { label: "Failed Payments", value: "3", change: "Action required", up: false },
                ].map((stat) => (
                  <div key={stat.label} className="bg-zinc-900 card-border rounded-xl p-4 text-left">
                    <div className="text-zinc-500 text-xs mb-1">{stat.label}</div>
                    <div className="font-display font-700 text-xl text-white">{stat.value}</div>
                    <div className={`text-xs mt-1 ${stat.up ? "text-emerald-400" : "text-amber-400"}`}>{stat.change}</div>
                  </div>
                ))}

                {/* Alert feed */}
                <div className="col-span-3 bg-zinc-900 card-border rounded-xl p-4">
                  <div className="text-zinc-500 text-xs mb-3 font-medium uppercase tracking-wider">Example alerts from a connected Stripe account</div>
                  <div className="space-y-2">
                    {[
                      { time: "2m ago", msg: "Payment Failed — $149 — customer@email.com", color: "text-amber-400", icon: "⚠" },
                      { time: "14m ago", msg: "Payment Received — $39", color: "text-emerald-400", icon: "✓" },
                      { time: "1h ago", msg: "Subscription Cancelled — $29 - customer@email.com", color: "text-rose-400", icon: "↓" },
                    ].map((alert, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <span className={`${alert.color} font-bold w-4 text-center`}>{alert.icon}</span>
                        <span className="text-zinc-300 flex-1 text-left">{alert.msg}</span>
                        <span className="text-zinc-600 text-xs shrink-0">{alert.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-zinc-500 text-sm uppercase tracking-widest mb-8 font-medium">Built for indie SaaS founders</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {["Micro SaaS", "Solo Founders", "Indie Hackers", "Bootstrappers", "Side Projects"].map((label) => (
              <div key={label} className="bg-white/5 border border-white/8 rounded-xl px-5 py-2.5 text-zinc-400 text-sm font-medium">
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-800 gradient-text mb-4">Built for revenue-critical events</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">Covers the only events that actually lose you money: failed payments and cancellations.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className={`relative bg-gradient-to-br ${f.accent} bg-zinc-900 card-border rounded-2xl p-8 hover:border-white/15 transition-all duration-300 group`}>
                <div className={`${f.iconColor} mb-6 p-3 bg-white/5 rounded-xl inline-block`}>{f.icon}</div>
                <h3 className="font-display font-700 text-xl text-white mb-3">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
<section id="how-it-works" className="py-24 px-6 bg-white">
  <div className="max-w-4xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="font-display text-4xl md:text-5xl font-800 text-black mb-4">
        Set up in minutes
      </h2>
      <p className="text-gray-600 text-lg">
        No engineering required. No complex setup.
      </p>
    </div>

    <div className="relative">
      <div className="hidden md:block absolute top-8 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            step: "01",
            title: "Connect Stripe",
            desc: "Authorize read-only access in one click. We'll never touch your billing or customer data.",
          },
          {
            step: "02",
            title: "Automatic Detection",
            desc: "We detect failed payments and cancellations automatically — no configuration needed.",
          },
          {
            step: "03",
            title: "Get Notified Instantly",
            desc: "Alerts land in Slack within seconds. You act. You fix it.",
          },
        ].map((item) => (
          <div
            key={item.step}
            className="text-center relative bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <span className="font-display font-800 text-emerald-600 text-lg">
                {item.step}
              </span>
            </div>

            <h3 className="font-display font-700 text-xl text-black mb-3">
              {item.title}
            </h3>

            <p className="text-gray-600 text-sm leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

      {/* Pricing */}
<section id="pricing" className="py-24 px-6">
  <div className="max-w-3xl mx-auto text-center">

    {/* Header */}
    <div className="mb-16">
      <h2 className="font-display text-4xl md:text-5xl font-800 gradient-text mb-4">
        Stop revenue leaks before they cost you
      </h2>

      <p className="text-emerald-400 text-sm font-medium">
        14-day free trial — no credit card required
      </p>

      <p className="text-zinc-400 text-lg mt-3">
        One recovered payment pays for months of monitoring.
      </p>
    </div>

    {/* Card */}
    <div className="flex justify-center">
      <div className="w-full max-w-md">

        <div className="
          relative
          bg-gradient-to-b from-zinc-900 to-black
          border border-white/10
          rounded-2xl
          p-8
          shadow-[0_20px_60px_rgba(0,0,0,0.8)]
          hover:shadow-[0_30px_80px_rgba(16,185,129,0.15)]
          transition-all duration-300
        ">

          {/* Glow */}
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/5 blur-2xl opacity-20 pointer-events-none"></div>

          <div className="relative">

            <div className="mb-6">
              <div className="text-zinc-400 text-sm font-medium mb-2">Starter</div>

              <div className="flex items-end gap-1 justify-center">
                <span className="font-display font-800 text-4xl text-white">$11</span>
                <span className="text-zinc-500 mb-1">/month</span>
              </div>

              <div className="text-zinc-500 text-xs mt-2">
                Monitor and recover revenue in real-time
              </div>
            </div>

            <ul className="space-y-3 mb-8 text-sm text-left">
              {[
                "Real-time failed payment alerts",
                "2-click recovery emails (prefilled)",
                "Churn & cancellation alerts",
                "Slack notifications included",
                "1 Stripe account",
                "7-day alert history",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-zinc-300">
                  <span className="text-emerald-400 shrink-0">✓</span> {f}
                </li>
              ))}
            </ul>

            <a
              href="/login"
              className="block w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 rounded-xl text-center text-sm transition-all"
            >
              Start Free Trial
            </a>

            <p className="text-xs text-zinc-500 text-center mt-3">
              Setup in under 2 minutes
            </p>

          </div>
        </div>

      </div>
    </div>

    {/* AI TEASER */}
    <div className="mt-10 text-center">
      <div className="inline-block border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 rounded-xl text-sm text-emerald-400">
        AI-assisted recovery emails — coming soon
      </div>
    </div>

  </div>
</section>


      {/* Testimonials */}
      

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-800 gradient-text mb-4">Common questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-zinc-900 card-border rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/3 transition-colors"
                >
                  <span className="font-medium text-white text-sm pr-4">{faq.q}</span>
                  <span className={`text-zinc-400 transition-transform duration-200 shrink-0 ${openFaq === i ? "rotate-45" : ""}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-zinc-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/20 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-2xl mx-auto text-center relative">
          <h2 className="font-display text-5xl md:text-6xl font-800 gradient-text mb-4">Know when it matters.</h2>
          <p className="text-zinc-400 text-xl mb-10">If revenue breaks, you should know in seconds — not hours.</p>
          <a href="#pricing" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-10 py-4 rounded-xl text-base transition-all duration-200 glow-green hover:shadow-emerald-500/40 hover:shadow-2xl">
            Start Free Trial Today →
          </a>
          <div className="flex items-center justify-center gap-6 mt-8 text-zinc-500 text-xs">
            <span>✓ 5-minute setup</span>
            <span>✓ Cancel anytime</span>
            <span>✓ No card for trial</span>
          </div>
        </div>
      </section>


       <div className="hidden">
  Stripe alerts tool, failed payment alerts, Stripe churn alerts, SaaS revenue monitoring, Stripe webhook alerts
</div>


      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Recoora" className="w-11 h-11 rounded-md" />
              <span className="font-display font-700 text-white">Recoora</span>
            </div>
            <div className="flex items-center gap-8">
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
      className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
    >
      {link.name}
    </a>
  ))}
</div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/5 text-center text-zinc-600 text-xs">
            © 2026 Recoora. Built for founders who'd rather ship than stare at dashboards.
          </div>
        </div>
      </footer>
    </div>
  );
}
