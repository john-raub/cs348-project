// import express from "express";
// import auth from "../middleware/auth.js";
// import AssignmentWork from "../models/assignmentwork.js";

// const router = express.Router();

// /**
//  * GET assignment routes for the current study session
//  */
// router.get("/getSessionWorks/:sessionId", auth, async (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const works = await AssignmentWork.find({ session: sessionId }).populate("assignment");
//     if (!works) return res.status(404).json({ message: "Works not found" });
//     res.json(works);
//   } catch (error) {
//     console.error("Error fetching session works:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });


// /**
//  * POST create a new assignmentwork for a study session
//  */
// router.post("/create", auth, async (req, res) => {
//   try {
//     const { time, assignmentId, sessionId } = req.body;
//     const assignment = new AssignmentWork({
//       time: time,
//       assignment: assignmentId,
//       session: sessionId,
//     });
//     await assignment.save();
//     res.status(201).json(assignment);
//   } catch (error) {
//     console.error("Error creating session work:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /**
//  * PUT update an existing assignmentwork
//  */
// router.put("/update/:id", auth, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { time } = req.body;
//     const assignment = await AssignmentWork.findByIdAndUpdate(id, {$set: { time } }, { new: true, runValidators: true });
//     if (!assignment) return res.status(404).json({ message: "Work not found" });
//     res.json(assignment);
//   } catch (error) {
//     console.error("Error updating session work:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /**
//  * DELETE an assignmentwork
//  */
// router.delete("/delete/:id", auth, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const assignment = await AssignmentWork.findByIdAndDelete(id);
//     if (!assignment) return res.status(404).json({ message: "Work not found" });
//     res.json({ message: "Work deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting session assignment:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// export default router;


import express from "express";
import auth from "../middleware/auth.js";
import AssignmentWork from "../models/assignmentwork.js";
import StudySession from "../models/studysession.js";
import Assignment from "../models/assignment.js";
import { 
  validateParamId, 
  validateBody,
  toObjectId 
} from "../middleware/validators.js";

const router = express.Router();

/**
 * GET all assignment work entries for a specific study session
 * Protected: Requires authentication
 * Validates: sessionId must be valid ObjectId
 * Returns: Work entries with populated assignment details
 */
router.get("/getSessionWorks/:sessionId", 
  auth,
  validateParamId('sessionId'),
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const userObjectId = toObjectId(userId, 'userId');

      // Verify the session belongs to the user
      const session = await StudySession.findOne({
        _id: sessionId,
        user: userObjectId
      });

      if (!session) {
        return res.status(404).json({ 
          message: "Study session not found or you don't have permission to view it" 
        });
      }

      const works = await AssignmentWork.find({ session: sessionId })
        .populate("assignment");

      res.json(works);
    } catch (error) {
      console.error("Error fetching session works:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * POST create a new assignment work entry
 * Protected: Requires authentication
 * Validates:
 *   - time: number, 0-1440 minutes, required
 *   - assignmentId: valid ObjectId, required
 *   - sessionId: valid ObjectId, required
 * Verifies: User owns both the session and assignment
 */
router.post("/create", 
  auth,
  validateBody({
    time: { 
      type: 'number', 
      required: true,
      min: 0,
      max: 1440,  // 24 hours in minutes
      integer: true,
      custom: (value) => {
        if (value < 0) {
          return 'time cannot be negative';
        }
        if (value > 1440) {
          return 'time cannot exceed 24 hours (1440 minutes)';
        }
        return null;
      }
    },
    assignmentId: { 
      type: 'objectId', 
      required: true 
    },
    sessionId: { 
      type: 'objectId', 
      required: true 
    }
  }),
  async (req, res) => {
    try {
      const { time, assignmentId, sessionId } = req.body;
      const userId = req.user.id;
      const userObjectId = toObjectId(userId, 'userId');

      // Verify the session belongs to the user
      const session = await StudySession.findOne({
        _id: sessionId,
        user: userObjectId
      });

      if (!session) {
        return res.status(404).json({ 
          message: "Study session not found or you don't have permission to add work to it" 
        });
      }

      // Verify the assignment exists and belongs to the user's classes
      // We need to check through: Assignment -> Class -> Semester -> User
      const assignment = await Assignment.findById(assignmentId)
        .populate({
          path: 'class',
          populate: {
            path: 'semester',
            select: 'user'
          }
        });

      if (!assignment) {
        return res.status(404).json({ 
          message: "Assignment not found" 
        });
      }

      // Verify assignment belongs to user (through class -> semester -> user chain)
      if (!assignment.class || 
          !assignment.class.semester || 
          assignment.class.semester.user.toString() !== userObjectId.toString()) {
        return res.status(403).json({ 
          message: "You don't have permission to log work for this assignment" 
        });
      }

      // Check for duplicate work entry (same assignment in same session)
      const existingWork = await AssignmentWork.findOne({
        assignment: assignmentId,
        session: sessionId
      });

      if (existingWork) {
        return res.status(400).json({ 
          message: "Work entry for this assignment already exists in this session. Use update instead." 
        });
      }

      const assignmentWork = new AssignmentWork({
        time: time,
        assignment: assignmentId,
        session: sessionId,
      });

      await assignmentWork.save();
      
      // Populate assignment details before returning
      const populatedWork = await AssignmentWork.findById(assignmentWork._id)
        .populate("assignment");
      
      res.status(201).json(populatedWork);
    } catch (error) {
      console.error("Error creating session work:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * PUT update an existing assignment work entry
 * Protected: Requires authentication + ownership verification
 * Validates:
 *   - id param: valid ObjectId
 *   - time: number, 0-1440 minutes, required
 */
router.put("/update/:id", 
  auth,
  validateParamId('id'),
  validateBody({
    time: { 
      type: 'number', 
      required: true,  // Time is required for updates
      min: 0,
      max: 1440,
      integer: true
    }
  }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { time } = req.body;
      const userId = req.user.id;
      const userObjectId = toObjectId(userId, 'userId');

      // Find the work entry with populated session for ownership check
      const work = await AssignmentWork.findById(id).populate('session');

      if (!work) {
        return res.status(404).json({ message: "Work entry not found" });
      }

      // Verify the session belongs to the user
      if (!work.session || work.session.user.toString() !== userObjectId.toString()) {
        return res.status(403).json({ 
          message: "You don't have permission to update this work entry" 
        });
      }

      // Update the time
      work.time = time;
      const updated = await work.save();

      // Populate assignment details before returning
      const populatedWork = await AssignmentWork.findById(updated._id)
        .populate("assignment");

      res.json(populatedWork);
    } catch (error) {
      console.error("Error updating session work:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * DELETE an assignment work entry
 * Protected: Requires authentication + ownership verification
 * Validates: id param must be valid ObjectId
 */
router.delete("/delete/:id", 
  auth,
  validateParamId('id'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userObjectId = toObjectId(userId, 'userId');

      // Find the work entry first to verify ownership
      const work = await AssignmentWork.findById(id).populate('session');

      if (!work) {
        return res.status(404).json({ message: "Work entry not found" });
      }

      // Verify the session belongs to the user
      if (!work.session || work.session.user.toString() !== userObjectId.toString()) {
        return res.status(403).json({ 
          message: "You don't have permission to delete this work entry" 
        });
      }

      // Delete the work entry
      await AssignmentWork.findByIdAndDelete(id);

      res.json({ message: "Work deleted successfully" });
    } catch (error) {
      console.error("Error deleting session assignment:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;