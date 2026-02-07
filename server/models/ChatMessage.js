const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    room: { type: String, required: true, trim: true, index: true },
    senderName: { type: String, required: true, trim: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 280 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
