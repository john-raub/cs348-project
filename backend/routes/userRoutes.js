// import express from "express";
// import auth from "../middleware/auth.js";
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// const router = express.Router();

// // Protected route to get user data
// router.get("/me", auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password"); // exclude password
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Update user profile (protected)
// router.put("/me", auth, async (req, res) => {
//   try {
//     const { startYear, school } = req.body;

//     // Find user by the ID in their token
//     const user = await User.findByIdAndUpdate(
//       req.user.id,
//       { $set: { startYear, school } },
//       { new: true, runValidators: true }
//     ).select("-password");

//     res.json(user);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to update profile" });
//   }
// });

// export default router;


import express from "express";
import auth from "../middleware/auth.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { 
  validateBody,
  toObjectId 
} from "../middleware/validators.js";

const router = express.Router();

/**
 * GET current user's profile data
 * Protected: Requires authentication
 * Returns: User object without password
 */
router.get("/me", 
  auth, 
  async (req, res) => {
    try {
      const userId = req.user.id;
      const userObjectId = toObjectId(userId, 'userId');

      const user = await User.findById(userObjectId).select("-password"); // exclude password
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (err) {
      console.error("Error fetching user:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * PUT update user profile
 * Protected: Requires authentication
 * Validates:
 *   - startYear: integer, reasonable range (1900-5 years future), optional
 *   - school: string, 1-100 chars, optional
 * Note: Users can only update their own profile
 */
router.put("/me", 
  auth,
  validateBody({
    startYear: { 
      type: 'number', 
      required: false,
      integer: true,
      custom: (value) => {
        if (value === undefined || value === null) return null;
        
        const currentYear = new Date().getFullYear();
        
        // Reasonable range for college start year
        if (value < 1900) {
          return 'startYear cannot be before 1900';
        }
        
        if (value > currentYear + 5) {
          return `startYear cannot be more than 5 years in the future (${currentYear + 5})`;
        }
        
        // Warn if suspiciously old (more than 100 years ago)
        if (value < currentYear - 100) {
          return 'startYear seems unreasonably far in the past';
        }
        
        return null;
      }
    },
    school: { 
      type: 'string', 
      required: false,
      minLength: 1,
      maxLength: 100,
      custom: (value) => {
        if (value === undefined || value === null) return null;
        
        const cleaned = value.trim();
        if (cleaned.length === 0) {
          return 'school cannot be empty or whitespace only';
        }
        
        // Optional: Check for suspicious patterns
        if (cleaned.includes('<script') || cleaned.includes('javascript:')) {
          return 'school contains invalid characters';
        }
        
        return null;
      }
    }
  }),
  async (req, res) => {
    try {
      const { startYear, school } = req.body;
      const userId = req.user.id;
      const userObjectId = toObjectId(userId, 'userId');

      // Build update object with only provided fields
      const updateFields = {};
      
      if (startYear !== undefined) {
        updateFields.startYear = startYear;
      }
      
      if (school !== undefined) {
        // Sanitize school name (remove extra whitespace, trim)
        updateFields.school = school.trim().replace(/\s+/g, ' ');
      }

      // If no fields to update, return early
      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ 
          message: "No valid fields provided to update" 
        });
      }

      // Find and update user
      const user = await User.findByIdAndUpdate(
        userObjectId,
        { $set: updateFields },
        { 
          new: true,           // Return updated document
          runValidators: true  // Run schema validators
        }
      ).select("-password");   // Exclude password from response

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (err) {
      console.error("Error updating user profile:", err);
      
      // Handle validation errors from Mongoose
      if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ 
          message: "Validation failed", 
          errors 
        });
      }
      
      res.status(500).json({ message: "Failed to update profile" });
    }
  }
);

export default router;