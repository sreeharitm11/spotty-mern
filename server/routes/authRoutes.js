const express = require("express");
const router = express.Router();
const { login, requestOtp, verifyOtp } = require("../controllers/authController");

router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);

module.exports = router;
