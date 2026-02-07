const ChatMessage = require("../models/ChatMessage");
const asyncHandler = require("../middlewares/asyncHandler");

const normalizeRoom = (room) => {
  const value = String(room || "global").trim().toLowerCase();
  return value || "global";
};

exports.getMessages = asyncHandler(async (req, res) => {
  const room = normalizeRoom(req.query.room);
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
  const messages = await ChatMessage.find({ room }).sort({ createdAt: -1 }).limit(limit).lean();
  res.json(messages.reverse());
});
