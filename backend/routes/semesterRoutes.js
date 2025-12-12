import express from "express";
import auth from "../middleware/auth.js";
import Semester from "../models/semester.js";
import { sanitizeString } from "../middleware/sanitize.js";
import { 
  validateParamId, 
  validateBody,
  toObjectId 
} from "../middleware/validators.js";

const router = express.Router();

/**
 * GET all semesters for the logged-in user
 * Protected: Requires authentication
 * Returns: Array of semesters sorted by year (descending)
 */
router.get("/getUserSemesters", 
  auth, 
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Convert to ObjectId safely
      const userObjectId = toObjectId(userId, 'userId');
      
      const semesters = await Semester.find({ user: userObjectId })
        .sort({ year: -1, season: 1 });
        
      res.json(semesters);
    } catch (error) {
      console.error("Error fetching semesters:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * POST create a new semester
 * Protected: Requires authentication
 * Validates:
 *   - season: string, one of 4 valid values, required
 *   - year: integer, reasonable range, required
 * Prevents: Duplicate semesters for the same user
 */
router.post("/create", 
  auth,
  validateBody({
    season: { 
      type: 'string', 
      required: true,
      enum: ['Spring', 'Summer', 'Fall', 'Winter']
    },
    year: { 
      type: 'number', 
      required: true,
      integer: true
    }
  }),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { season, year } = req.body;

      // Convert userId to ObjectId
      const userObjectId = toObjectId(userId, 'userId');

      // Check for duplicate semester (same user, season, and year)
      const existing = await Semester.findOne({ 
        user: userObjectId, 
        season: season, 
        year: year 
      });
      
      if (existing) {
        return res.status(400).json({ 
          message: `${season} ${year} semester already exists` 
        });
      }

      // Create new semester
      const newSemester = new Semester({
        season: season,
        year: year,
        user: userObjectId,
      });

      await newSemester.save();
      res.status(201).json(newSemester);
    } catch (error) {
      console.error("Error creating semester:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * PUT update a semester
 * Protected: Requires authentication + ownership verification
 * Validates:
 *   - id param: valid ObjectId
 *   - season: string, one of 4 valid values, optional
 *   - year: integer, reasonable range, optional
 * Prevents: Duplicate semesters after update
 */
router.put("/updateSemester/:id", 
  auth,
  validateParamId('id'),
  validateBody({
    season: { 
      type: 'string', 
      required: false,
      enum: ['Spring', 'Summer', 'Fall', 'Winter']
    },
    year: { 
      type: 'number', 
      required: false,
      integer: true,
    }
  }),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { year, season } = req.body;

      // Convert userId to ObjectId
      const userObjectId = toObjectId(userId, 'userId');

      // Find the semester and verify ownership
      const semester = await Semester.findOne({ 
        _id: id, 
        user: userObjectId 
      });
      
      if (!semester) {
        return res.status(404).json({ 
          message: "Semester not found or you don't have permission to edit it" 
        });
      }

      // Prepare updated values (use existing if not provided)
      const updatedYear = year !== undefined ? year : semester.year;
      const updatedSeason = season !== undefined ? season : semester.season;

      // Check if update would create a duplicate
      if (year !== undefined || season !== undefined) {
        const duplicate = await Semester.findOne({
          user: userObjectId,
          season: updatedSeason,
          year: updatedYear,
          _id: { $ne: id } // Exclude current semester from duplicate check
        });

        if (duplicate) {
          return res.status(400).json({ 
            message: `${updatedSeason} ${updatedYear} semester already exists` 
          });
        }
      }

      // Update fields
      if (year !== undefined) {
        semester.year = year;
      }
      
      if (season !== undefined) {
        semester.season = sanitizeString(season, 20);
      }

      const updatedSemester = await semester.save();
      res.json(updatedSemester);
    } catch (error) {
      console.error("Error updating semester:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * DELETE a semester
 * Protected: Requires authentication + ownership verification
 * Validates: id param must be valid ObjectId
 */
router.delete("/delete/:id", 
  auth,
  validateParamId('id'),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const semesterId = req.params.id;

      // Convert userId to ObjectId
      const userObjectId = toObjectId(userId, 'userId');

      // Verify ownership and delete in one query
      const semester = await Semester.findOneAndDelete({ 
        _id: semesterId, 
        user: userObjectId 
      });
      
      if (!semester) {
        return res.status(404).json({ 
          message: "Semester not found or you don't have permission to delete it" 
        });
      }

      res.json({ message: "Semester deleted successfully" });
    } catch (error) {
      console.error("Error deleting semester:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;