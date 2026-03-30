const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const scoreSchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      required: true,
      min: 1,
      max: 45,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Invalid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // never returned by default
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    subscriptionStatus: {
      type: String,
      enum: ["inactive", "active", "cancelled"],
      default: "inactive",
    },
    plan: {
      type: String,
      enum: ["none", "monthly", "yearly"],
      default: "none",
    },
    subscribedAt: {
      type: Date,
      default: null,
    },
    // Rolling window of max 5 scores (oldest removed on new entry)
    scores: {
      type: [scoreSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "A user can have at most 5 scores",
      },
    },
    charity: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// ─── Hash password before save ────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Instance method: compare password ───────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Helper: add score with rolling-5 logic ──────────────────────────────────
userSchema.methods.addScore = function (value, date) {
  const newScore = { value, date: date ? new Date(date) : new Date() };

  // Sort existing scores newest-first so we reliably pop the oldest
  this.scores.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (this.scores.length >= 5) {
    // Remove the oldest entry (last after sort)
    this.scores.pop();
  }

  this.scores.push(newScore);

  // Keep array in newest-first order
  this.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
};

module.exports = mongoose.model("User", userSchema);
