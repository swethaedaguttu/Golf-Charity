const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Verify JWT token ─────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorised. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ error: "User no longer exists." });
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalid or expired." });
  }
};

// ─── Require active subscription ─────────────────────────────────────────────
const requireSubscription = (req, res, next) => {
  if (req.user.subscriptionStatus !== "active") {
    return res
      .status(403)
      .json({ error: "Active subscription required to access this feature." });
  }
  next();
};

// ─── Require admin role ───────────────────────────────────────────────────────
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
};

module.exports = { protect, requireSubscription, requireAdmin };
