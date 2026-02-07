const Pin = require("../models/Pin");
const User = require("../models/User");
const asyncHandler = require("../middlewares/asyncHandler");

// CREATE
exports.createPin = asyncHandler(async (req, res) => {
  const pin = await Pin.create({
    type: req.body.type,
    buildingId: req.body.buildingId,
    floor: req.body.floor,
    x: req.body.x,
    y: req.body.y,
    lat: req.body.lat,
    lng: req.body.lng,
    author: req.body.author.trim(),
  });

  await User.findOneAndUpdate(
    { name: pin.author },
    { $inc: { points: 10 } },
    { upsert: true, setDefaultsOnInsert: true }
  );

  res.status(201).json(pin);
});

// READ
exports.getPins = asyncHandler(async (req, res) => {
  const buildingId = Number(req.params.buildingId);
  const floor = Number(req.params.floor);
  if (!Number.isFinite(buildingId) || !Number.isFinite(floor)) {
    res.status(400);
    throw new Error("Invalid building or floor");
  }

  const pins = await Pin.find({ buildingId, floor }).sort({ createdAt: -1 });
  res.json(pins);
});

// DELETE
exports.deletePin = asyncHandler(async (req, res) => {
  const pin = await Pin.findById(req.params.id);

  if (!pin) {
    res.status(404);
    throw new Error("Pin not found");
  }

  await pin.deleteOne();
  res.json({ message: "Pin deleted" });
});
