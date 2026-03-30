import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CHARITIES } from "../data/charities";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const steps = [
    { n: "01", title: "Subscribe", body: "Choose monthly or yearly. No hidden fees, cancel anytime." },
    { n: "02", title: "Enter Scores", body: "Log your Stableford scores (1–45) after each round. We keep your best 5." },
    { n: "03", title: "Monthly Draw", body: "Match 3, 4 or 5 drawn numbers to win. Jackpot rolls over if unclaimed." },
    { n: "04", title: "Give Back", body: "10% of your subscription goes directly to the charity you choose." },
  ];

  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 pt-40 pb-32 overflow-hidden"
        style={{ minHeight: "100vh" }}
      >
        {/* Background glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-3xl animate-slide-up">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6"
            style={{
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.3)",
              color: "#4ade80",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            Golf · Charity · Monthly Draws
          </span>

          <h1
            className="text-5xl md:text-7xl font-extrabold leading-none tracking-tight mb-6"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Play with
            <br />
            <span className="text-brand-400">Purpose.</span>
          </h1>

          <p
            className="text-lg md:text-xl font-light max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Track your golf scores, enter monthly prize draws, and support a
            charity you believe in — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <button className="btn-primary px-8 py-4 text-base" onClick={() => navigate("/dashboard")}>
                Go to Dashboard →
              </button>
            ) : (
              <>
                <Link to="/register" className="btn-primary px-8 py-4 text-base">
                  Start Playing for Good →
                </Link>
                <Link to="/login" className="btn-secondary px-8 py-4 text-base">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="relative z-10 mt-20 grid grid-cols-3 gap-8 max-w-lg w-full">
          {[
            { value: "£2,400+", label: "Donated to charities" },
            { value: "840", label: "Active players" },
            { value: "12", label: "Monthly draws run" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: "Syne, sans-serif", color: "#4ade80" }}
              >
                {s.value}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            How it works
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Four simple steps. One meaningful subscription.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-5">
          {steps.map((s) => (
            <div key={s.n} className="card p-6">
              <div
                className="text-3xl font-black mb-4"
                style={{
                  fontFamily: "Syne, sans-serif",
                  color: "rgba(34,197,94,0.25)",
                }}
              >
                {s.n}
              </div>
              <h3 className="font-bold text-base mb-2">{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Prize tiers ──────────────────────────────────────────────────── */}
      <section
        className="px-6 py-24"
        style={{ background: "var(--bg-secondary)" }}
      >
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Monthly Prize Draw
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            5 numbers drawn each month. Match yours to win.
          </p>
        </div>
        <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-5">
          {[
            {
              tier: "3 Matches",
              label: "Small Win",
              share: "25%",
              color: "#3b82f6",
              rollover: false,
            },
            {
              tier: "4 Matches",
              label: "Medium Win",
              share: "35%",
              color: "#f59e0b",
              rollover: false,
            },
            {
              tier: "5 Matches",
              label: "🏆 Jackpot",
              share: "40%",
              color: "#22c55e",
              rollover: true,
            },
          ].map((p) => (
            <div
              key={p.tier}
              className="card p-6 text-center"
              style={{ borderColor: `${p.color}30` }}
            >
              <div
                className="text-2xl font-black mb-1"
                style={{ fontFamily: "Syne, sans-serif", color: p.color }}
              >
                {p.tier}
              </div>
              <div className="font-bold text-base mb-3">{p.label}</div>
              <div
                className="text-3xl font-extrabold mb-2"
                style={{ fontFamily: "Syne, sans-serif", color: p.color }}
              >
                {p.share}
              </div>
              <div
                className="text-xs mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                of total prize pool
              </div>
              {p.rollover && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{
                    background: "rgba(34,197,94,0.12)",
                    color: "#4ade80",
                    border: "1px solid rgba(34,197,94,0.2)",
                  }}
                >
                  Rolls over if unclaimed
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Charities spotlight ──────────────────────────────────────────── */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Your subscription gives back
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Choose a cause you care about. 10% of every subscription goes directly to them.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {CHARITIES.slice(0, 3).map((c) => (
            <div key={c.id} className="card p-5">
              <div className="text-3xl mb-3">{c.emoji}</div>
              <div className="font-bold mb-1">{c.name}</div>
              <div
                className="text-xs mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                {c.tagline}
              </div>
              <span
                className="text-xs font-semibold"
                style={{ color: c.color }}
              >
                {c.impact}
              </span>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/charities" className="btn-secondary">
            View all charities →
          </Link>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section
        className="px-6 py-24 text-center"
        style={{ background: "var(--bg-secondary)" }}
      >
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-3xl md:text-5xl font-extrabold mb-5 leading-tight"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Ready to play
            <br />
            <span style={{ color: "var(--accent)" }}>for something bigger?</span>
          </h2>
          <p
            className="text-lg mb-8"
            style={{ color: "var(--text-secondary)" }}
          >
            From £4.99/month. Cancel anytime. Every round counts.
          </p>
          <Link to={user ? "/subscribe" : "/register"} className="btn-primary px-10 py-4 text-base">
            {user ? "Subscribe Now" : "Create Free Account"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="text-center py-8 text-xs"
        style={{
          color: "var(--text-muted)",
          borderTop: "1px solid var(--border)",
        }}
      >
        © 2025 Par &amp; Purpose · Built by Digital Heroes
      </footer>
    </div>
  );
}
