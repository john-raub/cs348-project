import express from "express";
import auth from "../middleware/auth.js";
import Assignment from "../models/assignment.js";
import Class from "../models/class.js";
import User from "../models/user.js";
import Semester from "../models/semester.js";
import { sanitizeString } from "../middleware/sanitize.js";
import { 
  validateParamId, 
  validateBody,
  toObjectId 
} from "../middleware/validators.js";
import mongoose from "mongoose";

const router = express.Router();

/**
 * GET all assignments for a specific class
 * Protected: Requires authentication
 * Validates: classId must be valid ObjectId
 */
router.get("/getAssignments/:classId", 
  auth, 
  validateParamId('classId'),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { classId } = req.params;

      // Verify that the class exists
      const classExists = await Class.findOne({ _id: classId }).session(session);
      if (!classExists) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(404).json({ message: "Class not found" });
      }

      const assignments = await Assignment.find({ class: classId }).session(session);
      res.json(assignments);
      await session.commitTransaction();
    } catch (error) {
      console.error("Error fetching assignments:", error);
      await session.abortTransaction();
      res.status(500).json({ message: "Server error" });
    }
    finally {
      await session.endSession();
    }
  }
);

/**
 * GET all assignments for the logged-in user
 * Protected: Requires authentication
 * Returns: All assignments across all user's classes
 */
router.get("/getUserAssignments", 
  auth, 
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const userId = req.user.id;
      
      // Convert to ObjectId safely
      const userObjectId = toObjectId(userId, 'userId');
      
      // Get all semesters for this user
      const semesters = await Semester.find({ user: userObjectId }).session(session);
      
      if (semesters.length === 0) {
        await session.abortTransaction();
        await session.endSession();
        return res.json([]);
      }
      
      // Get all classes for these semesters
      const classes = await Class.find({ semester: { $in: semesters.map(s => s._id) } }).session(session);
      
      if (classes.length === 0) {
        await session.abortTransaction();
        await session.endSession();
        return res.json([]);
      }
      
      const classIds = classes.map(c => c._id);
      
      // Get all assignments for these classes
      const assignments = await Assignment.find({ 
        class: { $in: classIds } 
      }).session(session).populate('class');
      
      res.json(assignments);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error("Error fetching user assignments:", error);
      res.status(500).json({ message: "Server error" });
    }
    finally {
      await session.endSession();
    }
  }
);

/**
 * POST create a new assignment
 * Protected: Requires authentication
 * Validates: classId (ObjectId), title (string, 1-100 chars)
 */
router.post("/createAssignment", 
  auth,
  validateBody({
    classId: { 
      type: 'objectId', 
      required: true 
    },
    title: { 
      type: 'string', 
      required: true,
      minLength: 1,
      maxLength: 100
    }
  }),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { classId, title } = req.body;

      // Verify that the class exists
      const classExists = await Class.findOne({ _id: classId }).session(session);
      if (!classExists) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(404).json({ message: "Class not found" });
      }

      // Create the assignment with sanitized title
      const newAssignment = new Assignment({ 
        title: sanitizeString(title, 100), 
        class: classId 
      });
      
      await newAssignment.save({session: session});
      res.status(201).json(newAssignment);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error("Error creating assignment:", error);
      res.status(500).json({ message: "Server error" });
    }
    finally {
      await session.endSession();
    }
  }
);

/**
 * PUT update an existing assignment
 * Protected: Requires authentication
 * Validates: id param (ObjectId), title (string, optional, 1-100 chars)
 */
router.put("/updateAssignment/:id", 
  auth,
  validateParamId('id'),
  validateBody({
    title: { 
      type: 'string', 
      required: false,  // Optional for updates
      minLength: 1,
      maxLength: 100
    }
  }),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;
      const { title } = req.body;

      // Check if title was provided
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      // Find the assignment
      const assignment = await Assignment.findById(id).session(session);
      
      if (!assignment) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Update the assignment
      assignment.title = sanitizeString(title, 100);
      const updated = await assignment.save({session: session});

      res.json(updated);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error("Error updating assignment:", error);
      res.status(500).json({ message: "Server error" });
    }
    finally {
      await session.endSession();
    }
  }
);

/**
 * DELETE an assignment
 * Protected: Requires authentication
 * Validates: id param (ObjectId)
 */
router.delete("/deleteAssignment/:id", 
  auth,
  validateParamId('id'),
  async (req, res) => {
    //no need for transactions, one write to one document which mongo already protects
    try {
      const { id } = req.params;

      // Find and delete the assignment
      const deleted = await Assignment.findByIdAndDelete(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      res.json({ message: "Assignment deleted successfully" });
    } catch (error) {
      console.error("Error deleting assignment:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;