const express = require("express");
const User = require("../models/User");
const Draw = require("../models/Draw");
const { protect, requireSubscription } = require("../middleware/auth");

const router = express.Router();

// All user routes require authentication
router.use(protect);

// ─── GET /api/user/profile ────────────────────────────────────────────────────
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      plan: user.plan,
      subscribedAt: user.subscribedAt,
      charity: user.charity,
      scores: user.scores,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/user/subscribe ─────────────────────────────────────────────────
router.post("/subscribe", async (req, res) => {
  try {
    const { plan } = req.body;

    if (!["monthly", "yearly"].includes(plan)) {
      return res.status(400).json({ error: "Plan must be 'monthly' or 'yearly'." });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        subscriptionStatus: "active",
        plan,
        subscribedAt: new Date(),
      },
      { new: true }
    );

    res.json({
      message: `Successfully subscribed to ${plan} plan!`,
      subscriptionStatus: user.subscriptionStatus,
      plan: user.plan,
      subscribedAt: user.subscribedAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/user/scores ────────────────────────────────────────────────────
router.post("/scores", requireSubscription, async (req, res) => {
  try {
    const { value, date } = req.body;
    const scoreValue = Number(value);

    if (!scoreValue || scoreValue < 1 || scoreValue > 45) {
      return res.status(400).json({ error: "Score must be between 1 and 45." });
    }

    const user = await User.findById(req.user._id);
    user.addScore(scoreValue, date);
    await user.save();

    res.json({
      message: "Score added successfully.",
      scores: user.scores,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/user/scores ─────────────────────────────────────────────────────
router.get("/scores", requireSubscription, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    // Already stored in newest-first order
    res.json({ scores: user.scores });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/user/scores/:index ─────────────────────────────────────────
// Removes a score from the user's rolling window by array index.
// The frontend uses the same ordering returned by GET /api/user/scores.
router.delete("/scores/:index", requireSubscription, async (req, res) => {
  try {
    const idx = parseInt(req.params.index, 10);
    if (Number.isNaN(idx)) {
      return res.status(400).json({ error: "Invalid score index." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (idx < 0 || idx >= user.scores.length) {
      return res.status(400).json({ error: "Score not found." });
    }

    user.scores.splice(idx, 1);
    await user.save();

    res.json({ message: "Score deleted successfully.", scores: user.scores });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/user/charity ────────────────────────────────────────────────────
router.put("/charity", async (req, res) => {
  try {
    const { charity } = req.body;
    if (!charity) {
      return res.status(400).json({ error: "Charity name is required." });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { charity },
      { new: true }
    );

    res.json({ message: "Charity updated.", charity: user.charity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/user/draw-results ───────────────────────────────────────────────
router.get("/draw-results", requireSubscription, async (req, res) => {
  try {
    // Get last 5 draws (published)
    const draws = await Draw.find({ status: "published" })
      .sort({ createdAt: -1 })
      .limit(5);

    const userId = req.user._id.toString();

    const results = draws.map((draw) => {
      const myWin = draw.winners.find((w) => w.userId?.toString() === userId);
      return {
        drawId: draw._id,
        date: draw.createdAt,
        numbers: draw.numbers,
        myResult: myWin
          ? {
              matchCount: myWin.matchCount,
              matchedNumbers: myWin.matchedNumbers,
              tier: myWin.tier,
              payoutStatus: myWin.payoutStatus,
            }
          : { matchCount: 0, tier: "no_win" },
        totalWinners: draw.winners.length,
      };
    });

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
