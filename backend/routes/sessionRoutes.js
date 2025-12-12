import express from "express";
import auth from "../middleware/auth.js";
import StudySession from "../models/studysession.js";
import { sanitizeString } from "../middleware/sanitize.js";
import { 
  validateParamId, 
  validateBody,
  toObjectId 
} from "../middleware/validators.js";

const router = express.Router();

/**
 * GET all study sessions for the logged-in user
 * Protected: Requires authentication
 * Returns: Array of study sessions sorted by date (newest first)
 */
router.get("/getUserSessions", 
  auth, 
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Convert to ObjectId safely
      const userObjectId = toObjectId(userId, 'userId');
      
      const sessions = await StudySession.find({ user: userObjectId })
        .sort({ datetime: -1 });
        
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching study sessions:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * POST create a new study session
 * Protected: Requires authentication
 * Validates: 
 *   - title: string, 1-200 characters, required
 *   - datetime: valid date, required
 */
router.post("/createSession", 
  auth,
  validateBody({
    title: { 
      type: 'string', 
      required: true,
      minLength: 1,
      maxLength: 200
    },
    datetime: { 
      type: 'date', 
      required: true,
      custom: (value) => {
        const date = new Date(value);
        
        if (isNaN(date.getTime())) {
          return 'Invalid date format';
        }
        
        return null; // Validation passed
      }
    }
  }),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { title, datetime } = req.body;

      // Convert userId to ObjectId
      const userObjectId = toObjectId(userId, 'userId');

      const newSession = new StudySession({
        title: sanitizeString(title, 200),
        datetime: new Date(datetime),
        user: userObjectId,
      });

      const savedSession = await newSession.save();
      res.status(201).json(savedSession);
    } catch (error) {
      console.error("Error creating study session:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * PUT update an existing study session
 * Protected: Requires authentication + ownership verification
 * Validates: 
 *   - id param: valid ObjectId
 *   - title: string, 1-200 characters, optional
 *   - datetime: valid date, optional
 */
router.put("/updateSession/:id", 
  auth,
  validateParamId('id'),
  validateBody({
    title: { 
      type: 'string', 
      required: false,
      minLength: 1,
      maxLength: 200
    },
    datetime: { 
      type: 'date', 
      required: false,
      custom: (value) => {
        if (!value) return null; // Skip if not provided
        
        const date = new Date(value);
        
        if (isNaN(date.getTime())) {
          return 'Invalid date format';
        }
        
        return null;
      }
    }
  }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, datetime } = req.body;
      const userId = req.user.id;

      // Convert userId to ObjectId
      const userObjectId = toObjectId(userId, 'userId');

      // Find the session and verify ownership in one query
      const foundSession = await StudySession.findOne({
        _id: id,
        user: userObjectId
      });

      if (!foundSession) {
        return res.status(404).json({ 
          message: "Study session not found or you don't have permission to edit it" 
        });
      }

      // Update fields only if provided
      if (title !== undefined) {
        foundSession.title = sanitizeString(title, 200);
      }
      
      if (datetime !== undefined) {
        foundSession.datetime = new Date(datetime);
      }

      const updatedSession = await foundSession.save();
      res.json(updatedSession);
    } catch (error) {
      console.error("Error updating study session:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * DELETE a study session
 * Protected: Requires authentication + ownership verification
 * Validates: id param must be valid ObjectId
 */
router.delete("/deleteSession/:id", 
  auth,
  validateParamId('id'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Convert userId to ObjectId
      const userObjectId = toObjectId(userId, 'userId');

      // Find and delete in one operation, verifying ownership
      const deleted = await StudySession.findOneAndDelete({
        _id: id,
        user: userObjectId,
      });

      if (!deleted) {
        return res.status(404).json({ 
          message: "Study session not found or you don't have permission to delete it" 
        });
      }

      res.json({ message: "Study session deleted successfully" });
    } catch (error) {
      console.error("Error deleting study session:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;