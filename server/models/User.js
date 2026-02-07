const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    passwordHash: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    emailOtp: { type: String, default: "" },
    emailOtpExpiresAt: { type: Date, default: null },
    avatar: { type: String, default: "" },
    points: { type: Number, default: 0 },
    lastChatRewardAt: { type: Date, default: null },
    chatRewardDate: { type: String, default: "" },
    chatRewardCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
