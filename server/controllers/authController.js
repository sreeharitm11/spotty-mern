const User = require("../models/User");
const asyncHandler = require("../middlewares/asyncHandler");
const bcrypt = require("bcryptjs");
const { sendOtpEmail } = require("../utils/email");

const OTP_TTL_MS = 10 * 60 * 1000;

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email || "",
  avatar: user.avatar || "",
  points: user.points || 0,
  isVerified: Boolean(user.isVerified),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

exports.requestOtp = asyncHandler(async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!name || name.length < 3) {
    res.status(400);
    throw new Error("Username must be at least 3 characters");
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400);
    throw new Error("Invalid email address");
  }
  if (!password || password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const byName = await User.findOne({ name });
  if (byName && byName.email !== email) {
    res.status(409);
    throw new Error("Username already exists");
  }

  const byEmail = await User.findOne({ email });
  if (byEmail && byEmail.name !== name) {
    res.status(409);
    throw new Error("Email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const otp = generateOtp();
  const emailOtpExpiresAt = new Date(Date.now() + OTP_TTL_MS);

  const user = await User.findOneAndUpdate(
    { email },
    {
      name,
      email,
      passwordHash,
      isVerified: false,
      emailOtp: otp,
      emailOtpExpiresAt,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await sendOtpEmail(email, otp);

  res.json({
    success: true,
    message: "OTP sent to email",
    email: user.email,
    otpFallback: process.env.NODE_ENV === "production" ? undefined : otp,
  });
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const otp = typeof req.body?.otp === "string" ? req.body.otp.trim() : "";

  if (!email || !otp) {
    res.status(400);
    throw new Error("Email and OTP are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("Account not found");
  }
  if (!user.emailOtp || user.emailOtp !== otp) {
    res.status(400);
    throw new Error("Invalid OTP");
  }
  if (!user.emailOtpExpiresAt || user.emailOtpExpiresAt < new Date()) {
    res.status(400);
    throw new Error("OTP expired");
  }

  user.isVerified = true;
  user.emailOtp = "";
  user.emailOtpExpiresAt = null;
  await user.save();

  res.json({ success: true, user: sanitizeUser(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const identifier = typeof req.body?.identifier === "string" ? req.body.identifier.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!identifier || !password) {
    res.status(400);
    throw new Error("Username/email and password are required");
  }

  const isEmail = identifier.includes("@");
  const query = isEmail ? { email: identifier.toLowerCase() } : { name: identifier };

  const user = await User.findOne(query);
  if (!user) {
    res.status(404);
    throw new Error("Account not found");
  }
  if (!user.passwordHash) {
    res.status(400);
    throw new Error("Password login is not enabled for this account");
  }
  if (!user.isVerified) {
    res.status(403);
    throw new Error("Email not verified");
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  res.json(sanitizeUser(user));
});
