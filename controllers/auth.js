const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");

const router = express.Router();

const User = require("../models/user");
const AuthenticateToken = require("../middleware/auth");

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // validate input parameters
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Invalid name or email or password",
        success: false,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists, Kindly Login!",
        success: false,
      });
    }
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error registering user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password are required!",
        success: false,
      });
    }

    if (!user) {
      return res.status(400).json({
        msg: "User Does'nt Exists",
        success: false,
      });
    }

    const pass = await user.comparePassword(password);
    const token = await user.getJWT();

    if (!pass) {
      return res.status(400).json({
        msg: "Password Does'nt Match",
        success: false,
      });
    }
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
});

// Protected route example
router.get("/dashboard", AuthenticateToken, (req, res) => {
  res.json({ message: "Welcome to the dashboard!", userId: req.user.userId });
});

module.exports = router;
