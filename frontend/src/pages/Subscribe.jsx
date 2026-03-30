import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Subscribe() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [selected, setSelected] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (user?.subscriptionStatus === "active") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="text-center animate-fade-in">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Syne, sans-serif" }}>
            You're already subscribed!
          </h2>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            You're on the <strong className="text-brand-400">{user.plan}</strong> plan.
          </p>
          <button className="btn-primary" onClick={() => navigate("/dashboard")}>
            Go to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: "£4.99",
      period: "/month",
      badge: null,
      perks: [
        "Monthly prize draw entry",
        "Score tracking (5 rolling)",
        "Charity contribution (10%)",
        "Cancel anytime",
      ],
    },
    {
      id: "yearly",
      name: "Yearly",
      price: "£49.99",
      period: "/year",
      badge: "Save 17%",
      perks: [
        "Everything in Monthly",
        "2 months free",
        "Priority draw entry",
        "Annual impact report",
      ],
    },
  ];

  const handleSubscribe = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/api/user/subscribe", { plan: selected });
      await refreshUser();
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1800);
    } catch (err) {
      setError(err.response?.data?.error || "Subscription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center animate-slide-up">
          <div className="text-5xl mb-4">🎉</div>
          <h2
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "Syne, sans-serif", color: "#4ade80" }}
          >
            You're in!
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Redirecting to your dashboard…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Syne, sans-serif" }}>
            Choose your plan
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Play, win, and give back — starting today.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelected(plan.id)}
              className="w-full text-left card p-5 transition-all duration-200"
              style={{
                borderColor:
                  selected === plan.id
                    ? "rgba(34,197,94,0.5)"
                    : "rgba(255,255,255,0.07)",
                boxShadow:
                  selected === plan.id
                    ? "0 0 0 1px rgba(34,197,94,0.3), 0 0 24px rgba(34,197,94,0.08)"
                    : "none",
                cursor: "pointer",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Radio circle */}
                  <span
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor:
                        selected === plan.id
                          ? "#22c55e"
                          : "rgba(255,255,255,0.2)",
                    }}
                  >
                    {selected === plan.id && (
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-400" />
                    )}
                  </span>
                  <div>
                    <div className="font-bold text-base">{plan.name}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {plan.id === "monthly" ? "Billed monthly" : "Billed annually"}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className="text-2xl font-extrabold"
                    style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {plan.period}
                  </span>
                  {plan.badge && (
                    <div>
                      <span className="badge-green text-xs mt-1">{plan.badge}</span>
                    </div>
                  )}
                </div>
              </div>

              <ul className="space-y-1.5 pl-8">
                {plan.perks.map((p) => (
                  <li
                    key={p}
                    className="text-xs flex items-center gap-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span className="text-brand-400 text-xs">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {error && <div className="alert-error mb-4">{error}</div>}

        <button
          className="btn-primary w-full py-4 text-base"
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading
            ? "Processing…"
            : `Subscribe — ${selected === "monthly" ? "£4.99/mo" : "£49.99/yr"}`}
        </button>

        <p
          className="text-center text-xs mt-4"
          style={{ color: "var(--text-muted)" }}
        >
          No real payment required (MVP demo). Cancel anytime.
        </p>
      </div>
    </div>
  );
}
