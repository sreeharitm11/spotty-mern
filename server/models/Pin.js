const mongoose = require("mongoose");

const pinSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["guard", "info", "food", "charging", "event", "seating"],
      required: true,
    },
    buildingId: { type: Number, required: true },
    floor: { type: Number, required: true },
    x: Number,
    y: Number,
    lat: Number,
    lng: Number,
    author: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pin", pinSchema);
