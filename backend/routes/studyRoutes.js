// import express from "express";
// import auth from "../middleware/auth.js";
// import Study from "../models/study.js";
// import { sanitizeString } from "../middleware/sanitize.js";

// const router = express.Router();

// /**
//  * Get all study for the session
//  */
// router.get("/getStudies/:sessionId", auth, async (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const studies = await Study.find({ session: sessionId });
//     console.log("Fetched studies:", studies);
//     res.json(studies);
//   } catch (err) {
//     console.error("Error fetching studies:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// /**
//  * Create a new study entry
//  */
// router.post("/create", auth, async (req, res) => {
//   try {
//     const newStudy = new Study(req.body);
//     await newStudy.save();
//     res.status(201).json(newStudy);
//   } catch (err) {
//     console.error("Error creating study:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// /** 
//  * Update an existing study entry
//  */
// router.put("/update/:id", auth, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { what, understanding, time } = req.body;
//     const updatedStudy = await Study.findById(id);

//     if (what) updatedStudy.what = sanitizeString(what, 200);
//     if (understanding) updatedStudy.understanding = Number(understanding);
//     if (time) updatedStudy.time = Number(time);
//     await updatedStudy.save();
//     res.json(updatedStudy);
//   } catch (err) {
//     console.error("Error updating study:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// /**
//  * Delete a study entry
//  */
// router.delete("/delete/:id", auth, async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Study.findByIdAndDelete(id);
//     res.status(204).send();
//   } catch (err) {
//     console.error("Error deleting study:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// export default router;


import express from "express";
import auth from "../middleware/auth.js";
import Study from "../models/study.js";
import StudySession from "../models/studysession.js";
import { sanitizeString } from "../middleware/sanitize.js";
import { 
  validateParamId, 
  validateBody,
  toObjectId 
} from "../middleware/validators.js";

const router = express.Router();

/**
 * GET all study entries for a specific study session
 * Protected: Requires authentication
 * Validates: sessionId must be valid ObjectId
 * Note: Should verify user owns the session
 */
router.get("/getStudies/:sessionId", 
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

      const studies = await Study.find({ session: sessionId });
      console.log("Fetched studies:", studies);
      
      res.json(studies);
    } catch (err) {
      console.error("Error fetching studies:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * POST create a new study entry
 * Protected: Requires authentication
 * Validates:
 *   - session: valid ObjectId, required
 *   - what: string, 1-200 chars, required (what was studied)
 *   - understanding: number, 1-5 scale, required
 *   - time: number, 0-1440 minutes, required
 */
router.post("/create", 
  auth,
  validateBody({
    session: { 
      type: 'objectId', 
      required: true 
    },
    what: { 
      type: 'string', 
      required: true,
      minLength: 1,
      maxLength: 200,
      custom: (value) => {
        const cleaned = value.trim();
        if (cleaned.length === 0) {
          return 'what cannot be empty or whitespace only';
        }
        return null;
      }
    },
    understanding: { 
      type: 'number', 
      required: true,
      integer: true
    },
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
    }
  }),
  async (req, res) => {
    try {
      const { session, what, understanding, time } = req.body;
      const userId = req.user.id;
      const userObjectId = toObjectId(userId, 'userId');

      // Verify the session exists and belongs to the user
      const studySession = await StudySession.findOne({
        _id: session,
        user: userObjectId
      });

      if (!studySession) {
        return res.status(404).json({ 
          message: "Study session not found or you don't have permission to add entries to it" 
        });
      }

      const newStudy = new Study({
        session: session,
        what: sanitizeString(what, 200),
        understanding: understanding,
        time: time
      });

      await newStudy.save();
      res.status(201).json(newStudy);
    } catch (err) {
      console.error("Error creating study:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * PUT update an existing study entry
 * Protected: Requires authentication + ownership verification
 * Validates:
 *   - id param: valid ObjectId
 *   - what: string, 1-200 chars, optional
 *   - understanding: number, 1-5 scale, optional
 *   - time: number, 0-1440 minutes, optional
 */
router.put("/update/:id", 
  auth,
  validateParamId('id'),
  validateBody({
    what: { 
      type: 'string', 
      required: false,
      minLength: 1,
      maxLength: 200
    },
    understanding: { 
      type: 'number', 
      required: false,
      integer: true
    },
    time: { 
      type: 'number', 
      required: false,
      min: 0,
      max: 1440,
      integer: true
    }
  }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { what, understanding, time } = req.body;
      const userId = req.user.id;
      const userObjectId = toObjectId(userId, 'userId');

      // Find the study entry
      const updatedStudy = await Study.findById(id).populate('session');

      if (!updatedStudy) {
        return res.status(404).json({ error: "Study entry not found" });
      }

      // Verify the session belongs to the user
      if (!updatedStudy.session || updatedStudy.session.user.toString() !== userObjectId.toString()) {
        return res.status(403).json({ 
          error: "You don't have permission to update this study entry" 
        });
      }

      // Update only provided fields
      if (what !== undefined) {
        updatedStudy.what = sanitizeString(what, 200);
      }
      
      if (understanding !== undefined) {
        updatedStudy.understanding = Number(understanding);
      }
      
      if (time !== undefined) {
        updatedStudy.time = Number(time);
      }

      await updatedStudy.save();
      res.json(updatedStudy);
    } catch (err) {
      console.error("Error updating study:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * DELETE a study entry
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

      // Find the study entry first to verify ownership
      const study = await Study.findById(id).populate('session');

      if (!study) {
        return res.status(404).json({ error: "Study entry not found" });
      }

      // Verify the session belongs to the user
      if (!study.session || study.session.user.toString() !== userObjectId.toString()) {
        return res.status(403).json({ 
          error: "You don't have permission to delete this study entry" 
        });
      }

      // Delete the study entry
      await Study.findByIdAndDelete(id);
      
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting study:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;