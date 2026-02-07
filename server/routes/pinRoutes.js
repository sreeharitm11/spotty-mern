const express = require("express");
const router = express.Router();
const { createPin, getPins, deletePin } = require("../controllers/pinController");
const { validatePin } = require("../middlewares/validateMiddleware");

router.post("/", validatePin, createPin);
router.get("/:buildingId/:floor", getPins);
router.delete("/:id", deletePin);

module.exports = router;