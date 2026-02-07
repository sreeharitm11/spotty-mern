const ChatMessage = require("../models/ChatMessage");
const { maybeRewardChat } = require("../services/chatRewardService");

const BLOCKED_WORDS = ["spamword1", "spamword2"];

const normalizeRoom = (room) => {
  const value = String(room || "global").trim().toLowerCase();
  return value || "global";
};

const hasBlockedWord = (text) => {
  const value = String(text || "").toLowerCase();
  return BLOCKED_WORDS.some((word) => value.includes(word));
};

const registerChatSocket = (io) => {
  io.on("connection", (socket) => {
    socket.join("global");

    socket.on("chat:join", ({ room }) => {
      const targetRoom = normalizeRoom(room);
      socket.join(targetRoom);
      socket.emit("chat:joined", { room: targetRoom });
    });

    socket.on("chat:leave", ({ room }) => {
      const targetRoom = normalizeRoom(room);
      socket.leave(targetRoom);
    });

    socket.on("chat:send", async (payload, ack) => {
      try {
        const room = normalizeRoom(payload?.room);
        const senderName = String(payload?.senderName || "").trim();
        const text = String(payload?.text || "").trim().replace(/\s+/g, " ");

        if (!senderName || !text) {
          if (ack) ack({ ok: false, message: "Sender and message are required" });
          return;
        }
        if (text.length > 280) {
          if (ack) ack({ ok: false, message: "Message too long (max 280)" });
          return;
        }
        if (hasBlockedWord(text)) {
          if (ack) ack({ ok: false, message: "Message blocked by moderation" });
          return;
        }

        const message = await ChatMessage.create({ room, senderName, text });
        const reward = await maybeRewardChat(senderName, text);
        const out = {
          _id: String(message._id),
          room,
          senderName,
          text,
          createdAt: message.createdAt,
          rewarded: reward.rewarded,
          points: reward.points,
        };

        io.to(room).emit("chat:new", out);
        if (ack) ack({ ok: true, message: out, reward: reward.rewardMeta, points: reward.points });
      } catch (err) {
        if (ack) ack({ ok: false, message: "Failed to send message" });
      }
    });
  });
};

module.exports = registerChatSocket;
