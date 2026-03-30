import { useState, useEffect, useCallback } from "react";
import api from "../api";

function StatBox({ label, value, color }) {
  return (
    <div className="card p-5 text-center">
      <div
        className="text-3xl font-extrabold mb-1"
        style={{ fontFamily: "Syne, sans-serif", color: color || "#4ade80" }}
      >
        {value ?? "—"}
      </div>
      <div className="text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--text-muted)" }}>
        {label}
      </div>
    </div>
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

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [draws, setDraws] = useState([]);
  const [tab, setTab] = useState("overview");
  const [drawLoading, setDrawLoading] = useState(false);
  const [drawResult, setDrawResult] = useState(null);
  const [drawError, setDrawError] = useState("");
  const [payoutMsg, setPayoutMsg] = useState("");
  const [scoresEditOpen, setScoresEditOpen] = useState(false);
  const [scoresEditUser, setScoresEditUser] = useState(null);
  const [scoresEditValues, setScoresEditValues] = useState([]);
  const [scoresEditLoading, setScoresEditLoading] = useState(false);
  const [scoresEditMsg, setScoresEditMsg] = useState("");
  const [scoresEditError, setScoresEditError] = useState("");

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, usersRes, drawsRes] = await Promise.all([
        api.get("/api/admin/stats"),
        api.get("/api/admin/users"),
        api.get("/api/admin/draws"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setDraws(drawsRes.data.draws);
    } catch {}
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const runDraw = async () => {
    setDrawLoading(true);
    setDrawError("");
    setDrawResult(null);
    try {
      const res = await api.post("/api/admin/draw");
      setDrawResult(res.data.draw);
      await fetchAll();
      setTab("draws");
    } catch (err) {
      setDrawError(err.response?.data?.error || "Draw failed.");
    } finally {
      setDrawLoading(false);
    }
  };

  const markPaid = async (drawId, userId) => {
    try {
      await api.patch(`/api/admin/draws/${drawId}/payout`, { userId });
      setPayoutMsg("Payout marked as paid.");
      setTimeout(() => setPayoutMsg(""), 3000);
      await fetchAll();
    } catch {
      setPayoutMsg("Failed to update payout.");
    }
  };

  const dateToYmd = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
      d.getUTCDate()
    ).padStart(2, "0")}`;
  };

  const sortByDateDesc = (arr) => {
    return [...arr].sort((a, b) => new Date(`${b.date}T00:00:00.000Z`).getTime() - new Date(`${a.date}T00:00:00.000Z`).getTime());
  };

  const openScoresEditor = (user) => {
    const current = (user?.scores || []).map((s, idx) => ({
      _id: `${user._id}-${idx}-${Date.now()}`,
      value: s.value,
      date: dateToYmd(s.date),
    }));
    const sorted = sortByDateDesc(current);
    setScoresEditUser(user);
    setScoresEditValues(sorted.slice(0, 5));
    setScoresEditError("");
    setScoresEditMsg("");
    setScoresEditOpen(true);
  };

  const closeScoresEditor = () => {
    setScoresEditOpen(false);
    setScoresEditUser(null);
    setScoresEditValues([]);
    setScoresEditLoading(false);
    setScoresEditError("");
  };

  const handleScoresFieldChange = (scoreId, field, nextValue) => {
    setScoresEditValues((prev) => {
      const next = prev.map((s) => (s._id === scoreId ? { ...s, [field]: nextValue } : s));
      return sortByDateDesc(next).slice(0, 5);
    });
  };

  const handleAddScore = () => {
    const nowYmd = dateToYmd(new Date());
    setScoresEditValues((prev) => {
      const next = [
        { _id: `new-${Date.now()}-${Math.random()}`, value: 1, date: nowYmd },
        ...prev,
      ];
      return sortByDateDesc(next).slice(0, 5);
    });
  };

  const handleDeleteScore = (scoreId) => {
    setScoresEditValues((prev) => prev.filter((s) => s._id !== scoreId));
  };

  const handleSaveScores = async () => {
    if (!scoresEditUser?._id) return;
    setScoresEditError("");
    setScoresEditMsg("");
    setScoresEditLoading(true);
    try {
      const normalized = scoresEditValues.map((s) => {
        const value = Number(s.value);
        if (!Number.isFinite(value) || value < 1 || value > 45) {
          throw new Error("Score value must be between 1 and 45.");
        }
        const dateObj = new Date(`${s.date}T00:00:00.000Z`);
        if (Number.isNaN(dateObj.getTime())) {
          throw new Error("Each score must have a valid date.");
        }
        return { value, date: s.date };
      });

      // Keep only latest 5 by date.
      normalized.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const latest5 = normalized.length > 5 ? normalized.slice(-5) : normalized;
      latest5.sort((a, b) => new Date(`${b.date}T00:00:00.000Z`).getTime() - new Date(`${a.date}T00:00:00.000Z`).getTime());

      await api.put(`/api/admin/users/${scoresEditUser._id}/scores`, { scores: latest5 });
      setScoresEditMsg("Scores updated successfully.");
      setTimeout(() => setScoresEditMsg(""), 3000);
      closeScoresEditor();
      await fetchAll();
    } catch (err) {
      setScoresEditError(err.response?.data?.error || err.message || "Failed to update scores.");
    } finally {
      setScoresEditLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Users" },
    { id: "draws", label: "Draws" },
  ];

  return (
    <div className="min-h-screen px-4 md:px-8 pt-28 pb-16 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
            Admin Panel
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>Platform management &amp; draw control</p>
        </div>
        <button
          className="btn-primary px-6 py-3"
          onClick={runDraw}
          disabled={drawLoading}
        >
          {drawLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Running draw…
            </span>
          ) : (
            "🎯 Run Monthly Draw"
          )}
        </button>
      </div>

      {drawError && <div className="alert-error mb-6">{drawError}</div>}
      {payoutMsg && <div className="alert-success mb-6">{payoutMsg}</div>}
      {scoresEditMsg && <div className="alert-success mb-6">{scoresEditMsg}</div>}
      {scoresEditError && <div className="alert-error mb-6">{scoresEditError}</div>}

      {/* Last draw result flash */}
      {drawResult && (
        <div
          className="rounded-2xl p-5 mb-6"
          style={{
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.25)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🎯</span>
            <span className="font-bold text-brand-400" style={{ fontFamily: "Syne, sans-serif" }}>
              Draw Complete
            </span>
          </div>
          <div className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
            Draw Numbers: {drawResult.numbers.join(", ")}
          </div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {drawResult.winners.length} winner(s) · {drawResult.totalParticipants} participants
            {drawResult.jackpotRolledOver && (
              <>
                {" · "}
                <span className="badge-yellow">Jackpot Rolled Over</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: "var(--bg-secondary)" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{
              background: tab === t.id ? "var(--bg-card-hover)" : "transparent",
              color: tab === t.id ? "var(--text-primary)" : "var(--text-muted)",
              border: tab === t.id ? "1px solid var(--border-accent)" : "1px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox label="Total Users" value={stats?.totalUsers} />
            <StatBox label="Active Subscribers" value={stats?.activeSubscribers} color="#4ade80" />
            <StatBox label="Draws Run" value={stats?.totalDraws} color="#3b82f6" />
            <StatBox
              label="Last Draw"
              value={stats?.lastDrawDate ? formatDateDDMMMYYYY(stats.lastDrawDate) : "None"}
              color="#f59e0b"
            />
          </div>
        </div>
      )}

      {/* ── Users ────────────────────────────────────────────────────────── */}
      {tab === "users" && (
        <div className="animate-fade-in">
          <div className="section-title mb-1">All Users</div>
          <p className="section-sub">{users.length} registered users</p>

          {users.length === 0 ? (
            <div className="card p-8 text-center" style={{ color: "var(--text-muted)" }}>
              No users yet.
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u._id} className="card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-sm">{u.name}</span>
                        {u.subscriptionStatus === "active" ? (
                          <span className="badge-green">Active</span>
                        ) : (
                          <span className="badge-red">Inactive</span>
                        )}
                        {u.plan !== "none" && (
                          <span className="badge-blue text-xs">{u.plan}</span>
                        )}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{u.email}</div>
                      {u.charity && (
                        <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                          Charity: {u.charity}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-brand-400">
                        {u.scores?.length || 0} score{u.scores?.length !== 1 ? "s" : ""}
                      </div>
                      <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        {u.scores?.map((s) => s.value).join(", ") || "—"}
                      </div>
                      <button
                        className="btn-secondary text-xs py-1.5 px-3 mt-3"
                        onClick={() => openScoresEditor(u)}
                        type="button"
                      >
                        Edit Scores
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Draws ────────────────────────────────────────────────────────── */}
      {tab === "draws" && (
        <div className="animate-fade-in">
          <div className="section-title mb-1">Draw History</div>
          <p className="section-sub">Most recent draws &amp; winners</p>

          {draws.length === 0 ? (
            <div className="card p-8 text-center" style={{ color: "var(--text-muted)" }}>
              No draws run yet. Use the "Run Monthly Draw" button above.
            </div>
          ) : (
            <div className="space-y-4">
              {draws.map((d) => (
                <div key={d._id} className="card p-5">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <span className="font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
                        Draw —{" "}
                        {formatDateDDMMMYYYY(d.createdAt)}
                      </span>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {d.totalParticipants} participant{d.totalParticipants !== 1 ? "s" : ""}
                        {d.jackpotRolledOver && (
                          <>
                            {" · "}
                            <span className="badge-yellow">Jackpot Rolled Over</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Drawn numbers */}
                    <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Draw Numbers: {d.numbers.join(", ")}
                    </div>
                  </div>

                  {/* Winners */}
                  {d.winners.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      No winners (no user reached 3 matches)
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {d.winners.map((w, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-xl px-4 py-3 flex-wrap gap-3"
                          style={{ background: "var(--bg-card-hover)" }}
                        >
                          <div>
                            <span className="font-semibold text-sm">{w.name}</span>
                            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{w.email}</div>
                            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                              {w.name} → {w.matchCount} Matches →{" "}
                              {w.tier === "jackpot"
                                ? "Jackpot"
                                : w.tier === "medium"
                                  ? "Medium Win"
                                  : w.tier === "small"
                                    ? "Small Win"
                                    : "No Win"}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                              Matched: {w.matchedNumbers.join(", ")}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {w.tier === "jackpot" && <span className="badge-green">🏆 Jackpot</span>}
                            {w.tier === "medium" && <span className="badge-yellow">🥈 Medium</span>}
                            {w.tier === "small" && <span className="badge-blue">🥉 Small</span>}

                            {w.payoutStatus === "paid" ? (
                              <span className="badge-green">Paid ✓</span>
                            ) : (
                              <button
                                className="btn-secondary text-xs py-1.5 px-3"
                                onClick={() => markPaid(d._id, w.userId)}
                              >
                                Mark Paid
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Edit User Scores Modal ───────────────────────────────────────── */}
      {scoresEditOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeScoresEditor}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="card p-6 max-w-2xl w-full"
            style={{ background: "var(--bg-card)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="section-title">✍️ Edit Scores</div>
                <p className="section-sub">Max 5 scores (oldest auto-removed)</p>
                {scoresEditUser && (
                  <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                    Editing: <span className="font-semibold">{scoresEditUser.name}</span>
                  </p>
                )}
              </div>
              <button
                type="button"
                className="btn-secondary text-xs py-1.5 px-3"
                onClick={closeScoresEditor}
              >
                Close
              </button>
            </div>

            {scoresEditError && <div className="alert-error mb-3">{scoresEditError}</div>}
            {scoresEditMsg && <div className="alert-success mb-3">{scoresEditMsg}</div>}

            <div className="space-y-2">
              {scoresEditValues.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  No scores yet.
                </p>
              ) : (
                scoresEditValues.map((s) => (
                  <div
                    key={s._id}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
                    style={{ background: "var(--bg-card-hover)" }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="number"
                        className="input w-24"
                        min={1}
                        max={45}
                        value={s.value}
                        onChange={(e) =>
                          handleScoresFieldChange(s._id, "value", e.target.value)
                        }
                      />
                      <input
                        type="date"
                        className="input flex-1"
                        value={s.date}
                        onChange={(e) =>
                          handleScoresFieldChange(s._id, "date", e.target.value)
                        }
                      />
                    </div>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold"
                      style={{
                        background: "rgba(248,113,113,0.12)",
                        color: "#f87171",
                        border: "1px solid rgba(248,113,113,0.25)",
                        cursor: "pointer",
                      }}
                      aria-label="Delete score"
                      title="Delete score"
                      onClick={() => handleDeleteScore(s._id)}
                      disabled={scoresEditLoading}
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2 mt-5">
              <button
                type="button"
                className="btn-secondary flex-1 py-2.5 text-sm"
                onClick={handleAddScore}
                disabled={scoresEditLoading}
              >
                Add Score
              </button>
              <button
                type="button"
                className="btn-primary flex-1 py-2.5 text-sm"
                onClick={handleSaveScores}
                disabled={scoresEditLoading}
              >
                {scoresEditLoading ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
