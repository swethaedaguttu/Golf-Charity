import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { CHARITIES } from "../data/charities";

// ─── Small reusable stat card ─────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }) {
  return (
    <div className="card p-5">
      <div className="text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        {label}
      </div>
      <div className="text-2xl font-bold mb-0.5" style={{ fontFamily: "Syne, sans-serif", color: accent || "var(--text-primary)" }}>
        {value}
      </div>
      {sub && <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{sub}</div>}
    </div>
  );
}

// ─── Tier badge ───────────────────────────────────────────────────────────────
function TierBadge({ tier }) {
  const map = {
    jackpot: { label: "🏆 Jackpot!", cls: "badge-green" },
    medium: { label: "🥈 Medium Win", cls: "badge-yellow" },
    small: { label: "🥉 Small Win", cls: "badge-blue" },
    no_win: { label: "No match", cls: "badge" },
  };
  const t = map[tier] || map.no_win;
  return (
    <span className={t.cls} style={t.cls === "badge" ? { background: "rgba(255,255,255,0.05)", color: "var(--text-muted)", border: "1px solid var(--border)" } : {}}>
      {t.label}
    </span>
  );
}

function formatDateDDMMMYYYY(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default function Dashboard() {
  const { user, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [scores, setScores] = useState([]);
  const [drawResults, setDrawResults] = useState([]);
  const [scoreForm, setScoreForm] = useState({ value: "", date: new Date().toISOString().split("T")[0] });
  const [scoreError, setScoreError] = useState("");
  const [scoreSuccess, setScoreSuccess] = useState("");
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreDeleteLoading, setScoreDeleteLoading] = useState(false);
  const [charityEdit, setCharityEdit] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState(user?.charity || "");
  const [charityLoading, setCharityLoading] = useState(false);
  const [charityMsg, setCharityMsg] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [scoresRes, drawsRes] = await Promise.all([
        api.get("/api/user/scores"),
        api.get("/api/user/draw-results"),
      ]);
      setScores(scoresRes.data.scores);
      setDrawResults(drawsRes.data.results);
    } catch {}
  }, []);

  useEffect(() => {
    if (user?.subscriptionStatus === "active") fetchData();
  }, [user, fetchData]);

  // Gate: not subscribed
  if (user?.subscriptionStatus !== "active") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Syne, sans-serif" }}>
          Subscription Required
        </h2>
        <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
          Subscribe to unlock your dashboard, score tracking, and draws.
        </p>
        <button className="btn-primary px-8 py-3" onClick={() => navigate("/subscribe")}>
          View Plans →
        </button>
      </div>
    );
  }

  const handleAddScore = async (e) => {
    e.preventDefault();
    setScoreError("");
    setScoreSuccess("");
    const val = Number(scoreForm.value);
    if (!val || val < 1 || val > 45) {
      setScoreError("Score must be between 1 and 45.");
      return;
    }
    setScoreLoading(true);
    try {
      const res = await api.post("/api/user/scores", { value: val, date: scoreForm.date });
      setScores(res.data.scores);
      setScoreSuccess("Score added!");
      setScoreForm({ value: "", date: new Date().toISOString().split("T")[0] });
      setTimeout(() => setScoreSuccess(""), 3000);
    } catch (err) {
      setScoreError(err.response?.data?.error || "Failed to add score.");
    } finally {
      setScoreLoading(false);
    }
  };

  const handleDeleteScore = async (index) => {
    if (scoreDeleteLoading) return;
    if (scores.length === 0) return;

    // Simple confirm to avoid accidental deletion.
    if (!window.confirm("Remove this score?")) return;

    setScoreError("");
    setScoreSuccess("");
    setScoreDeleteLoading(true);
    try {
      const res = await api.delete(`/api/user/scores/${index}`);
      setScores(res.data.scores);
      setScoreSuccess("Score removed!");
      setTimeout(() => setScoreSuccess(""), 3000);
    } catch (err) {
      setScoreError(err.response?.data?.error || "Failed to remove score.");
    } finally {
      setScoreDeleteLoading(false);
    }
  };

  const handleSaveCharity = async () => {
    if (!selectedCharity) return;
    setCharityLoading(true);
    try {
      await api.put("/api/user/charity", { charity: selectedCharity });
      updateUser({ charity: selectedCharity });
      setCharityMsg("Charity updated!");
      setCharityEdit(false);
      setTimeout(() => setCharityMsg(""), 3000);
    } catch {
      setCharityMsg("Failed to update.");
    } finally {
      setCharityLoading(false);
    }
  };

  const lastDraw = drawResults[0];
  const subscriptionLabel = user.plan === "yearly" ? "Yearly Plan" : "Monthly Plan";
  const lastMatchCount = lastDraw?.myResult?.matchCount ?? 0;
  const displayName = user?.name?.trim() ? user.name.trim() : "User";
  // Seeded admin name currently starts with "Platform ". Strip it for display only.
  const displayNameForUi = displayName.replace(/^Platform\s+/i, "").trim() || "User";

  return (
    <div className="min-h-screen px-4 md:px-8 pt-28 pb-16 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
          Hello, {displayNameForUi} 👋
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>Your personal golf &amp; giving dashboard.</p>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Subscription"
          value={user.subscriptionStatus === "active" ? "Active" : "Inactive"}
          sub={subscriptionLabel}
          accent={user.subscriptionStatus === "active" ? "#4ade80" : "#f87171"}
        />
        <StatCard
          label="Scores logged"
          value={scores.length}
          sub="of 5 max"
        />
        <StatCard
          label="Last draw result"
          value={lastDraw ? `${lastMatchCount} ${lastMatchCount === 1 ? "Match" : "Matches"}` : "—"}
          sub={lastDraw ? formatDateDDMMMYYYY(lastDraw.date) : "No draws yet"}
          accent={lastMatchCount >= 3 ? "#4ade80" : undefined}
        />
        <StatCard
          label="Charity"
          value={user.charity ? "Selected" : "None"}
          sub={user.charity || "Choose below"}
          accent={user.charity ? "#4ade80" : "#94a3b8"}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ── Score Entry ────────────────────────────────────────────────── */}
        <section className="card p-6">
          <div className="section-title">⛳ Enter a Score</div>
          <p className="section-sub">Stableford format · Range 1–45 · Keeps latest 5</p>

          <form onSubmit={handleAddScore} className="space-y-3 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Score (1–45)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="e.g. 32"
                  min={1}
                  max={45}
                  value={scoreForm.value}
                  onChange={(e) => setScoreForm({ ...scoreForm, value: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  className="input"
                  value={scoreForm.date}
                  onChange={(e) => setScoreForm({ ...scoreForm, date: e.target.value })}
                  required
                />
              </div>
            </div>

            {scoreError && <div className="alert-error">{scoreError}</div>}
            {scoreSuccess && <div className="alert-success">{scoreSuccess}</div>}

            <button type="submit" className="btn-primary w-full" disabled={scoreLoading}>
              {scoreLoading ? "Adding…" : "Add Score"}
            </button>
          </form>

          {/* Score list */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Your last 5 scores
            </div>
            {scores.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No scores yet. Add your first score above.</p>
            ) : (
              <div className="space-y-2">
                {scores.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl px-4 py-2.5"
                    style={{ background: "var(--bg-card-hover)" }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}
                      >
                        {s.value}
                      </span>
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {formatDateDDMMMYYYY(s.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {i === 0 && (
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80" }}
                        >
                          Latest
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteScore(i)}
                        disabled={scoreDeleteLoading}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold"
                        style={{
                          background: "rgba(248,113,113,0.12)",
                          color: "#f87171",
                          border: "1px solid rgba(248,113,113,0.25)",
                          opacity: scoreDeleteLoading ? 0.6 : 1,
                          cursor: scoreDeleteLoading ? "not-allowed" : "pointer",
                        }}
                        aria-label="Remove score"
                        title="Remove score"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Right column ───────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Charity selection */}
          <section className="card p-6">
            <div className="section-title">❤️ Your Charity</div>
            <p className="section-sub">10% of your subscription goes here</p>

            {charityMsg && <div className="alert-success mb-3">{charityMsg}</div>}

            {charityEdit ? (
              <div className="space-y-3">
                <select
                  className="select"
                  value={selectedCharity}
                  onChange={(e) => setSelectedCharity(e.target.value)}
                >
                  <option value="">Select a charity…</option>
                  {CHARITIES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    className="btn-primary flex-1 py-2.5 text-sm"
                    onClick={handleSaveCharity}
                    disabled={charityLoading || !selectedCharity}
                  >
                    {charityLoading ? "Saving…" : "Save"}
                  </button>
                  <button
                    className="btn-secondary flex-1 py-2.5 text-sm"
                    onClick={() => { setCharityEdit(false); setSelectedCharity(user.charity || ""); }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {user.charity ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm">
                        {CHARITIES.find((c) => c.name === user.charity)?.emoji || "❤️"}{" "}
                        {user.charity}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        Receiving 10% of your subscription
                      </div>
                    </div>
                    <button
                      className="text-xs text-brand-400 hover:underline font-medium"
                      onClick={() => setCharityEdit(true)}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
                      You haven't selected a charity yet.
                    </p>
                    <button className="btn-secondary text-sm py-2.5" onClick={() => setCharityEdit(true)}>
                      Choose a Charity
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Draw history */}
          <section className="card p-6">
            <div className="section-title">🎯 Draw Results</div>
            <p className="section-sub">Your last 5 monthly draws</p>

            {drawResults.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No draws have been run yet.
              </p>
            ) : (
              <div className="space-y-3">
                {drawResults.map((d) => (
                  <div
                    key={d.drawId}
                    className="rounded-xl p-4"
                    style={{ background: "var(--bg-card-hover)" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                        {formatDateDDMMMYYYY(d.date)}
                      </span>
                      {d.myResult?.tier && d.myResult.tier !== "no_win" ? (
                        <TierBadge tier={d.myResult.tier} />
                      ) : null}
                    </div>

                    {/* Drawn numbers (inline) */}
                    <div className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                      Draw Numbers:{" "}
                      {d.numbers.map((n, idx) => {
                        const isMatch = d.myResult?.matchedNumbers?.includes(n);
                        return (
                          <span key={n} style={{ color: isMatch ? "#4ade80" : "var(--text-secondary)" }}>
                            {n}
                            {idx < d.numbers.length - 1 ? ", " : ""}
                          </span>
                        );
                      })}
                    </div>

                    {!d.myResult ? (
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        No result available.
                      </p>
                    ) : (
                      <>
                        <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
                          Your Matches: {d.myResult.matchCount}
                        </p>
                        <p
                          className="text-xs"
                          style={{
                            color: d.myResult.matchCount >= 3 ? "#4ade80" : "var(--text-secondary)",
                          }}
                        >
                          Result:{" "}
                          {d.myResult.tier === "jackpot"
                            ? "🏆 Jackpot"
                            : d.myResult.tier === "medium"
                              ? "💰 Medium Win"
                              : d.myResult.tier === "small"
                                ? "🎉 Small Win"
                                : "❌ No Win"}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
