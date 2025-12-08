import express from "express";
import auth from "../middleware/auth.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Protected route to get user data
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // exclude password
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile (protected)
router.put("/me", auth, async (req, res) => {
  try {
    const { startYear, school } = req.body;

    // Find user by the ID in their token
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { startYear, school } },
      { new: true, runValidators: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;
