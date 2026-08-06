const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendSmsOtp = require("../utils/sendSmsService");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password || !role || !phone) {
    return res.status(400).json({ message: "Please fill in all the fields." });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists." });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        isPhoneVerified: user.isPhoneVerified || false,
        state: user.state || "",
        district: user.district || "",
        collegeName: user.collegeName || "",
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ message: "Server error, Please try again later." });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide the email and password." });
  }

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        isPhoneVerified: user.isPhoneVerified || false,
        state: user.state || "",
        district: user.district || "",
        collegeName: user.collegeName || "",
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password." });
    }
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Server error, Please try again later." });
  }
};

// @desc    Authenticate/Register via Google
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  const { name, email, role, phone } = req.body;
  
  try {
    let user = await User.findOne({ email });

    if (!user) {
      if (!role) return res.status(400).json({ message: "Role is required for new Google users" });
      if (!phone) return res.status(400).json({ message: "Phone number is required for new Google users" });
      
      user = await User.create({
        name,
        email,
        password: "GoogleAuthPlaceholderUser!@#",
        role,
        phone
      });
    } else {
      // If user exists but is finalizing a role/phone update
      let updated = false;
      if (role && user.role !== role) {
         user.role = role;
         updated = true;
      }
      if (phone && user.phone !== phone) {
         user.phone = phone;
         updated = true;
      }
      if (updated) {
         await user.save();
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      isPhoneVerified: user.isPhoneVerified || false,
      state: user.state || "",
      district: user.district || "",
      collegeName: user.collegeName || "",
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Google Auth Error:", error.message);
    res.status(500).json({ message: "Server error during Google Auth." });
  }
};

// @desc    Update user college & onboarding profile
// @route   PUT /api/auth/college
// @access  Private
exports.updateCollegeProfile = async (req, res) => {
  const { state, district, collegeName, phone, isPhoneVerified } = req.body;

  if (!state || !district || !collegeName) {
    return res.status(400).json({ message: "State, district, and college name are required." });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.state = state.trim();
    user.district = district.trim();
    user.collegeName = collegeName.trim();
    if (phone) user.phone = phone.trim();
    if (isPhoneVerified !== undefined) user.isPhoneVerified = isPhoneVerified;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isPhoneVerified: user.isPhoneVerified,
      state: user.state,
      district: user.district,
      collegeName: user.collegeName,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Update College Profile Error:", error.message);
    res.status(500).json({ message: "Server error updating college profile." });
  }
};

// In-memory mobile phone OTP store
const phoneOtpStore = {};

// @desc    Send Phone OTP via Mobile SMS
// @route   POST /api/auth/send-phone-otp
// @access  Public
exports.sendPhoneOtp = async (req, res) => {
  const { phone } = req.body;
  const cleanPhone = phone ? String(phone).replace(/\D/g, "") : "";

  if (!cleanPhone || cleanPhone.length < 10) {
    return res.status(400).json({ message: "Please provide a valid 10-digit mobile phone number." });
  }

  try {
    // Generate a 6-digit dynamic numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    phoneOtpStore[cleanPhone] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes validity
    };

    // Dispatch real SMS via SMS gateway / logger
    const smsResult = await sendSmsOtp(cleanPhone, otp);

    res.json({
      success: true,
      message: `SMS OTP sent successfully to +91 ${cleanPhone}.`,
      provider: smsResult?.provider || "ConsoleLogger",
      isRealSms: Boolean(process.env.FAST2SMS_API_KEY || process.env.TWILIO_ACCOUNT_SID)
    });
  } catch (error) {
    console.error("Send Phone OTP Error:", error.message);
    res.status(500).json({ message: "Failed to send Mobile SMS OTP. Please try again." });
  }
};

// @desc    Verify Mobile Phone OTP
// @route   POST /api/auth/verify-phone-otp
// @access  Public
exports.verifyPhoneOtp = async (req, res) => {
  const { phone, otp } = req.body;
  const cleanPhone = phone ? String(phone).replace(/\D/g, "") : "";
  const inputOtp = otp ? String(otp).trim() : "";

  if (!cleanPhone || !inputOtp) {
    return res.status(400).json({ message: "Mobile number and OTP code are required." });
  }

  const record = phoneOtpStore[cleanPhone];

  // Validate exact 6-digit OTP code against store
  if (record && record.otp === inputOtp && record.expiresAt > Date.now()) {
    delete phoneOtpStore[cleanPhone]; // Clear OTP after successful verification
    return res.json({
      success: true,
      message: "Mobile phone number verified successfully!"
    });
  }

  if (record && record.expiresAt <= Date.now()) {
    delete phoneOtpStore[cleanPhone];
    return res.status(400).json({ message: "OTP code has expired. Please request a new Mobile SMS code." });
  }

  res.status(400).json({ message: "Invalid Mobile OTP code. Please enter the correct 6-digit code received on your phone." });
};
