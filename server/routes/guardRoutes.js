const express = require("express");
const router = express.Router();
const { getLiveGuards, reportGuardMovement, removeGuard } = require("../controllers/guardController");
const { validateGuardMovement } = require("../middlewares/validateMiddleware");

router.get("/live", getLiveGuards);
router.post("/move", validateGuardMovement, reportGuardMovement);
router.delete("/:guardCode", removeGuard);

module.exports = router;
