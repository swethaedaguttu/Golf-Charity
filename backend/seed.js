/**
 * seed.js — Run once to create the admin account in MongoDB
 * Usage: node seed.js
 * Requires .env file with MONGODB_URI set
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, default: "user" },
  subscriptionStatus: { type: String, default: "inactive" },
  plan: { type: String, default: "none" },
  scores: { type: Array, default: [] },
  charity: { type: String, default: null },
});

const User = mongoose.model("User", userSchema);

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@golfcharity.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@1234";

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    console.log(`ℹ️  Admin already exists: ${adminEmail}`);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(adminPassword, 12);
  await User.create({
    name: "Platform Admin",
    email: adminEmail,
    password: hashed,
    role: "admin",
    subscriptionStatus: "active",
    plan: "yearly",
  });

  console.log(`✅ Admin created: ${adminEmail} / ${adminPassword}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
