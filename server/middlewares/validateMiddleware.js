const validatePin = (req, res, next) => {
  const { type, author } = req.body;
  const buildingId = Number(req.body.buildingId);
  const floor = Number(req.body.floor);
  const x = req.body.x !== undefined ? Number(req.body.x) : undefined;
  const y = req.body.y !== undefined ? Number(req.body.y) : undefined;
  const lat = req.body.lat !== undefined ? Number(req.body.lat) : undefined;
  const lng = req.body.lng !== undefined ? Number(req.body.lng) : undefined;

  if (!type || author === undefined || author === null || String(author).trim() === "" || req.body.buildingId === undefined || req.body.floor === undefined) {
    return res.status(400).json({ message: "Missing pin fields" });
  }

  if (!Number.isFinite(buildingId) || !Number.isFinite(floor)) {
    return res.status(400).json({ message: "Invalid data types" });
  }

  if ((x !== undefined && !Number.isFinite(x)) || (y !== undefined && !Number.isFinite(y))) {
    return res.status(400).json({ message: "Invalid coordinate values" });
  }
  if ((lat !== undefined && !Number.isFinite(lat)) || (lng !== undefined && !Number.isFinite(lng))) {
    return res.status(400).json({ message: "Invalid map coordinates" });
  }

  req.body.buildingId = buildingId;
  req.body.floor = floor;
  if (x !== undefined) req.body.x = x;
  if (y !== undefined) req.body.y = y;
  if (lat !== undefined) req.body.lat = lat;
  if (lng !== undefined) req.body.lng = lng;

  next();
};

const validateGuardMovement = (req, res, next) => {
  const { guardCode, reportedBy } = req.body;
  const buildingId = Number(req.body.buildingId);
  const floor = Number(req.body.floor);
  const lat = Number(req.body.lat);
  const lng = Number(req.body.lng);

  if (!guardCode || String(guardCode).trim() === "") {
    return res.status(400).json({ message: "guardCode is required" });
  }
  if (!reportedBy || String(reportedBy).trim() === "") {
    return res.status(400).json({ message: "reportedBy is required" });
  }
  if (!Number.isFinite(buildingId) || !Number.isFinite(floor)) {
    return res.status(400).json({ message: "Invalid buildingId/floor" });
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ message: "Invalid map coordinates" });
  }

  req.body.guardCode = String(guardCode).trim().toUpperCase();
  req.body.reportedBy = String(reportedBy).trim();
  req.body.buildingId = buildingId;
  req.body.floor = floor;
  req.body.lat = lat;
  req.body.lng = lng;
  req.body.displayName =
    req.body.displayName && String(req.body.displayName).trim() !== ""
      ? String(req.body.displayName).trim()
      : req.body.guardCode;

  next();
};

module.exports = { validatePin, validateGuardMovement };
