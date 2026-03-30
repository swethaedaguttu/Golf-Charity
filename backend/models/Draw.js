const mongoose = require("mongoose");

const winnerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    email: String,
    matchCount: { type: Number, enum: [3, 4, 5] },
    matchedNumbers: [Number],
    tier: { type: String, enum: ["small", "medium", "jackpot"] },
    payoutStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
  },
  { _id: false }
);

const drawSchema = new mongoose.Schema(
  {
    numbers: {
      type: [Number],
      required: true,
      validate: {
        validator: (arr) => arr.length === 5,
        message: "Draw must have exactly 5 numbers",
      },
    },
    winners: [winnerSchema],
    jackpotRolledOver: {
      type: Boolean,
      default: false,
    },
    totalParticipants: {
      type: Number,
      default: 0,
    },
    runBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Draw", drawSchema);
