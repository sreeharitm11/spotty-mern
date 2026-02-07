const mongoose = require("mongoose");

const guardStateSchema = new mongoose.Schema(
  {
    guardCode: { type: String, required: true, unique: true, trim: true, uppercase: true },
    displayName: { type: String, required: true, trim: true },
    buildingId: { type: Number, required: true },
    floor: { type: Number, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    lastSeenAt: { type: Date, default: Date.now },
    reportedBy: { type: String, required: true, trim: true },
    movementCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GuardState", guardStateSchema);
