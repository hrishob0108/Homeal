const express = require("express");
const router = express.Router();
const { registerUser, loginUser, googleAuth, updateCollegeProfile, sendPhoneOtp, verifyPhoneOtp } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.put("/college", protect, updateCollegeProfile);
router.post("/send-phone-otp", sendPhoneOtp);
router.post("/verify-phone-otp", verifyPhoneOtp);

module.exports = router;
