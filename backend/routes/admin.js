const express = require("express");
const User = require("../models/User");
const Draw = require("../models/Draw");
const { protect, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, requireAdmin);

// ─── Helper: match logic ──────────────────────────────────────────────────────
const getTier = (matchCount) => {
  if (matchCount === 5) return "jackpot";
  if (matchCount === 4) return "medium";
  if (matchCount === 3) return "small";
  return null;
};

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      total: users.length,
      users,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/admin/users/:userId/scores ─────────────────────────────────────
// Allows admin to update a user's scores list (max 5, keep latest by date).
router.put("/users/:userId/scores", async (req, res) => {
  try {
    const { scores } = req.body;
    if (!Array.isArray(scores)) {
      return res.status(400).json({ error: "scores must be an array." });
    }

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const normalized = [];
    for (const s of scores) {
      const value = Number(s.value);
      if (!Number.isFinite(value) || value < 1 || value > 45) {
        return res.status(400).json({ error: "Score value must be between 1 and 45." });
      }

      const dateObj = new Date(s.date);
      if (Number.isNaN(dateObj.getTime())) {
        return res.status(400).json({ error: "Each score must have a valid date." });
      }

      normalized.push({ value, date: dateObj });
    }

    // Keep only latest 5 scores (based on date).
    normalized.sort((a, b) => a.date.getTime() - b.date.getTime()); // oldest -> newest
    const latest5 = normalized.length > 5 ? normalized.slice(-5) : normalized;

    // Store in newest-first order (matches existing dashboard expectations).
    latest5.sort((a, b) => b.date.getTime() - a.date.getTime());
    user.scores = latest5;

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select("name email scores subscriptionStatus plan role charity");

    res.json({
      message: "Scores updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/admin/draw ─────────────────────────────────────────────────────
// Generates 5 unique random numbers (1-45), compares with all active subscribers' scores
router.post("/draw", async (req, res) => {
  try {
    // ── 1. Generate 5 unique random numbers in range 1–45 ──
    const drawNumbers = [];
    while (drawNumbers.length < 5) {
      const n = Math.floor(Math.random() * 45) + 1;
      if (!drawNumbers.includes(n)) drawNumbers.push(n);
    }

    // ── 2. Get all active subscribers with at least 1 score ──
    const subscribers = await User.find({
      subscriptionStatus: "active",
      role: "user",
      "scores.0": { $exists: true },
    }).select("name email scores");

    // ── 3. Compare each user's scores against drawn numbers ──
    const winners = [];

    for (const user of subscribers) {
      const userScoreValues = user.scores.map((s) => s.value);
      const matched = drawNumbers.filter((n) => userScoreValues.includes(n));

      if (matched.length >= 3) {
        winners.push({
          userId: user._id,
          name: user.name,
          email: user.email,
          matchCount: matched.length,
          matchedNumbers: matched,
          tier: getTier(matched.length),
          payoutStatus: "pending",
        });
      }
    }

    // ── 4. Check jackpot rollover ──
    const hasJackpot = winners.some((w) => w.tier === "jackpot");

    // ── 5. Save draw ──
    const draw = await Draw.create({
      numbers: drawNumbers,
      winners,
      jackpotRolledOver: !hasJackpot,
      totalParticipants: subscribers.length,
      runBy: req.user._id,
      status: "published",
    });

    res.json({
      message: "Draw completed successfully.",
      draw: {
        id: draw._id,
        numbers: draw.numbers,
        date: draw.createdAt,
        totalParticipants: draw.totalParticipants,
        winners: draw.winners,
        jackpotRolledOver: draw.jackpotRolledOver,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/admin/draws ─────────────────────────────────────────────────────
router.get("/draws", async (req, res) => {
  try {
    const draws = await Draw.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("runBy", "name email");

    res.json({ draws });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/admin/draws/:id/payout ───────────────────────────────────────
// Mark a specific winner's payout as 'paid'
router.patch("/draws/:id/payout", async (req, res) => {
  try {
    const { userId } = req.body;
    const draw = await Draw.findById(req.params.id);

    if (!draw) return res.status(404).json({ error: "Draw not found." });

    const winner = draw.winners.find((w) => w.userId?.toString() === userId);
    if (!winner) return res.status(404).json({ error: "Winner not found in this draw." });

    winner.payoutStatus = "paid";
    await draw.save();

    res.json({ message: "Payout marked as paid." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const activeSubscribers = await User.countDocuments({
      role: "user",
      subscriptionStatus: "active",
    });
    const totalDraws = await Draw.countDocuments();
    const lastDraw = await Draw.findOne().sort({ createdAt: -1 });

    res.json({
      totalUsers,
      activeSubscribers,
      totalDraws,
      lastDrawDate: lastDraw?.createdAt || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
