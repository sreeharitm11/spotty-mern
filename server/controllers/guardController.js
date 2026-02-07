const GuardState = require("../models/GuardState");
const asyncHandler = require("../middlewares/asyncHandler");

const MAX_GUARDS = 20;

exports.getLiveGuards = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.buildingId !== undefined) {
    const buildingId = Number(req.query.buildingId);
    if (!Number.isFinite(buildingId)) {
      res.status(400);
      throw new Error("Invalid buildingId");
    }
    query.buildingId = buildingId;
  }
  if (req.query.floor !== undefined) {
    const floor = Number(req.query.floor);
    if (!Number.isFinite(floor)) {
      res.status(400);
      throw new Error("Invalid floor");
    }
    query.floor = floor;
  }

  const guards = await GuardState.find(query).sort({ guardCode: 1 });
  res.json({ maxGuards: MAX_GUARDS, activeGuards: guards.length, guards });
});

exports.reportGuardMovement = asyncHandler(async (req, res) => {
  const { guardCode, displayName, buildingId, floor, lat, lng, reportedBy } = req.body;

  let guard = await GuardState.findOne({ guardCode });
  if (!guard) {
    const total = await GuardState.countDocuments();
    if (total >= MAX_GUARDS) {
      res.status(400);
      throw new Error("Max 20 guards can be tracked at a time");
    }
    guard = await GuardState.create({
      guardCode,
      displayName,
      buildingId,
      floor,
      lat,
      lng,
      reportedBy,
      lastSeenAt: new Date(),
      movementCount: 1,
    });
    return res.status(201).json(guard);
  }

  guard.displayName = displayName || guard.displayName;
  guard.buildingId = buildingId;
  guard.floor = floor;
  guard.lat = lat;
  guard.lng = lng;
  guard.reportedBy = reportedBy;
  guard.lastSeenAt = new Date();
  guard.movementCount += 1;
  await guard.save();

  res.json(guard);
});

exports.removeGuard = asyncHandler(async (req, res) => {
  const guard = await GuardState.findOne({ guardCode: String(req.params.guardCode || "").toUpperCase() });
  if (!guard) {
    res.status(404);
    throw new Error("Guard not found");
  }
  await guard.deleteOne();
  res.json({ message: "Guard removed" });
});
