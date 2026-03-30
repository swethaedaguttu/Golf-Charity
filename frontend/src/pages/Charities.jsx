import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CHARITIES } from "../data/charities";
import api from "../api";

export default function Charities() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSelect = async (charityName) => {
    if (!user) { navigate("/register"); return; }

    setSaving(true);
    setMsg("");
    try {
      await api.put("/api/user/charity", { charity: charityName });
      updateUser({ charity: charityName });
      setSelected(charityName);
      setMsg(`You're now supporting ${charityName}!`);
      setTimeout(() => setMsg(""), 4000);
    } catch {
      setMsg("Failed to update charity. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-8 pt-28 pb-16 max-w-5xl mx-auto animate-fade-in">
      <div className="text-center mb-12">
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-4"
          style={{
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.3)",
            color: "#4ade80",
          }}
        >
          ❤️ Giving Back
        </span>
        <h1
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          Choose a Charity
        </h1>
        <p className="max-w-lg mx-auto" style={{ color: "var(--text-secondary)" }}>
          10% of your subscription goes directly to the charity you select.
          Change your choice at any time from your dashboard.
        </p>
      </div>

      {msg && (
        <div
          className={`mb-6 rounded-xl px-4 py-3 text-sm text-center ${
            msg.includes("Failed") ? "alert-error" : "alert-success"
          }`}
        >
          {msg}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CHARITIES.map((c) => {
          const isCurrent = user?.charity === c.name;
          const isJustSelected = selected === c.name;
          return (
            <div
              key={c.id}
              className="card p-6 flex flex-col"
              style={{
                borderColor: isCurrent ? `${c.color}50` : "rgba(255,255,255,0.07)",
                boxShadow: isCurrent ? `0 0 0 1px ${c.color}30, 0 0 24px ${c.color}10` : "none",
              }}
            >
              <div className="text-4xl mb-3">{c.emoji}</div>
              <div className="font-bold text-base mb-1">{c.name}</div>
              <div
                className="text-xs font-semibold mb-3"
                style={{ color: c.color }}
              >
                {c.tagline}
              </div>
              <p
                className="text-sm leading-relaxed mb-4 flex-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {c.description}
              </p>
              <div
                className="text-xs mb-4 font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                📊 {c.impact}
              </div>

              {isCurrent ? (
                <div
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-center"
                  style={{
                    background: `${c.color}18`,
                    color: c.color,
                    border: `1px solid ${c.color}30`,
                  }}
                >
                  ✓ Your Current Charity
                </div>
              ) : (
                <button
                  className="btn-secondary text-sm py-2.5"
                  onClick={() => handleSelect(c.name)}
                  disabled={saving}
                  style={{
                    borderColor: `${c.color}40`,
                    color: c.color,
                  }}
                >
                  {saving && isJustSelected ? "Saving…" : "Support This Charity"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!user && (
        <div className="text-center mt-10">
          <p style={{ color: "var(--text-secondary)" }} className="mb-4">
            Create an account to start supporting your chosen charity.
          </p>
          <button className="btn-primary px-8 py-3" onClick={() => navigate("/register")}>
            Get Started →
          </button>
        </div>
      )}
    </div>
  );
}
