// import express from "express";
// import auth from "../middleware/auth.js";
// import Class from "../models/class.js";
// import Semester from "../models/semester.js";
// import { sanitizeString } from "../middleware/sanitize.js";

// const router = express.Router();

// router.get("/getClasses/:semesterId", auth, async (req, res) => {
//   try {
//     const { semesterId } = req.params;

//     const classes = await Class.find({ semester: semesterId });
//     res.json(classes);
//   } catch (error) {
//     console.error("Error fetching classes:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.get("/getUserClasses", auth, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const semesters = await Semester.find({ user: userId });
//     const classes = await Class.find({ semester: { $in: semesters.map(s => s._id) } });
//     res.json(classes);
//   } catch (error) {
//     console.error("Error fetching user classes:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.post("/createClass", auth, async (req, res) => {
//   try {
//     const { classId, professor, grade, semesterId } = req.body;

//     console.log(classId, professor, grade, semesterId);

//     const newClass = new Class({
//       classId: classId,
//       professor: professor,
//       grade: grade,
//       semester: semesterId,
//     });

//     const saved = await newClass.save();
//     res.status(201).json(saved);
//   } catch (error) {
//     console.error("Error creating class:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.put("/updateClass/:id", auth, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { id } = req.params;
//     const { classId, professor, grade } = req.body;

//     const foundClass = await Class.findOne({ _id: id });
//     if (!foundClass) return res.status(404).json({ message: "Class not found or unauthorized" });

//     if (classId) foundClass.classId = sanitizeString(classId, 50);
//     if (professor) foundClass.professor = sanitizeString(professor, 50);
//     if (grade) foundClass.grade = sanitizeString(grade, 10);

//     const updated = await foundClass.save();
//     res.json(updated);
//   } catch (error) {
//     console.error("Error updating class:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.delete("/deleteClass/:id", auth, async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("Deleting class with id:", id);

//     const deleted = await Class.findOneAndDelete({ _id: id});
//     if (!deleted) return res.status(404).json({ message: "Class not found or unauthorized" });

//     res.json({ message: "Class deleted" });
//   } catch (error) {
//     console.error("Error deleting class:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// export default router;



import express from "express";
import auth from "../middleware/auth.js";
import Class from "../models/class.js";
import Semester from "../models/semester.js";
import { sanitizeString } from "../middleware/sanitize.js";
import { 
  validateParamId, 
  validateBody,
  toObjectId 
} from "../middleware/validators.js";

const router = express.Router();

/**
 * GET all classes for a specific semester
 * Protected: Requires authentication
 * Validates: semesterId must be valid ObjectId
 * Note: Should verify user owns the semester
 */


router.get("/getClasses/:semesterId", 
  auth,
  validateParamId('semesterId'),
  async (req, res) => {
    try {
      const { semesterId } = req.params;
      const userId = req.user.id;
      const userObjectId = toObjectId(userId, 'userId');

      // Verify the semester belongs to the user
      const semester = await Semester.findOne({
        _id: semesterId,
        user: userObjectId
      });

      if (!semester) {
        return res.status(404).json({ 
          message: "Semester not found or you don't have permission to view it" 
        });
      }

      const classes = await Class.find({ semester: semesterId });
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * GET all classes for the logged-in user (across all semesters)
 * Protected: Requires authentication
 * Returns: All classes for user's semesters
 */
router.get("/getUserClasses", 
  auth, 
  async (req, res) => {
    try {
      const userId = req.user.id;
      const userObjectId = toObjectId(userId, 'userId');

      // Get all user's semesters
      const semesters = await Semester.find({ user: userObjectId });
      
      if (semesters.length === 0) {
        return res.json([]);
      }

      const semesterIds = semesters.map(s => s._id);

      // Get all classes for those semesters
      const classes = await Class.find({ 
        semester: { $in: semesterIds } 
      });
      
      res.json(classes);
    } catch (error) {
      console.error("Error fetching user classes:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * POST create a new class
 * Protected: Requires authentication
 * Validates:
 *   - classId: string (course code), 1-50 chars, required
 *   - professor: string, 1-50 chars, required
 *   - grade: string, valid grade or empty, optional
 *   - semesterId: valid ObjectId, required
 */
router.post("/createClass", 
  auth,
  validateBody({
    classId: { 
      type: 'string', 
      required: true,
      minLength: 1,
      maxLength: 50,
      custom: (value) => {
        // Remove excessive whitespace
        const cleaned = value.trim().replace(/\s+/g, ' ');
        if (cleaned.length === 0) {
          return 'classId cannot be empty or whitespace only';
        }
        return null;
      }
    },
    professor: { 
      type: 'string', 
      required: true,
      minLength: 1,
      maxLength: 50,
      custom: (value) => {
        const cleaned = value.trim();
        if (cleaned.length === 0) {
          return 'professor cannot be empty or whitespace only';
        }
        return null;
      }
    },
    grade: { 
      type: 'string', 
      required: false,
      maxLength: 50
    },
    semesterId: { 
      type: 'objectId', 
      required: true 
    }
  }),
  async (req, res) => {
    try {
      const { classId, professor, grade, semesterId } = req.body;
      const userId = req.user.id;
      const userObjectId = toObjectId(userId, 'userId');

      // Verify the semester exists and belongs to the user
      const semester = await Semester.findOne({
        _id: semesterId,
        user: userObjectId
      });

      if (!semester) {
        return res.status(404).json({ 
          message: "Semester not found or you don't have permission to add classes to it" 
        });
      }

      // Check for duplicate class in the same semester
      const existingClass = await Class.findOne({
        semester: semesterId,
        classId: sanitizeString(classId, 50)
      });

      if (existingClass) {
        return res.status(400).json({ 
          message: `Class ${classId} already exists in this semester` 
        });
      }

      console.log("Creating class:", { classId, professor, grade, semesterId });

      const newClass = new Class({
        classId: sanitizeString(classId, 50),
        professor: sanitizeString(professor, 50),
        grade: grade ? sanitizeString(grade, 50) : '',
        semester: semesterId,
      });

      const saved = await newClass.save();
      res.status(201).json(saved);
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * PUT update an existing class
 * Protected: Requires authentication + ownership verification
 * Validates:
 *   - id param: valid ObjectId
 *   - classId: string, 1-50 chars, optional
 *   - professor: string, 1-50 chars, optional
 *   - grade: valid grade string, optional
 */
router.put("/updateClass/:id", 
  auth,
  validateParamId('id'),
  validateBody({
    classId: { 
      type: 'string', 
      required: false,
      maxLength: 50
    },
    professor: { 
      type: 'string', 
      required: false,
      maxLength: 50
    },
    grade: { 
      type: 'string', 
      required: false,
      maxLength: 50
    }
  }),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { classId, professor, grade } = req.body;

      const userObjectId = toObjectId(userId, 'userId');

      // Find the class and verify ownership through semester
      const foundClass = await Class.findById(id).populate('semester');
      
      if (!foundClass) {
        return res.status(404).json({ message: "Class not found" });
      }

      // Verify the semester belongs to the user
      if (!foundClass.semester || foundClass.semester.user.toString() !== userObjectId.toString()) {
        return res.status(403).json({ 
          message: "You don't have permission to update this class" 
        });
      }

      // Update only provided fields
      if (classId !== undefined && classId.trim().length > 0) {
        foundClass.classId = sanitizeString(classId, 50);
      }

      if (professor !== undefined && professor.trim().length > 0) {
        foundClass.professor = sanitizeString(professor, 50);
      }

      if (grade !== undefined && grade.trim().length > 0) {
        foundClass.grade = sanitizeString(grade, 50);
      }

      const updated = await foundClass.save();
      res.json(updated);
    } catch (error) {
      console.error("Error updating class:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * DELETE a class
 * Protected: Requires authentication + ownership verification
 * Validates: id param must be valid ObjectId
 * Note: This will orphan related assignments
 * Consider cascade delete or prevention if assignments exist
 */
router.delete("/deleteClass/:id", 
  auth,
  validateParamId('id'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userObjectId = toObjectId(userId, 'userId');

      console.log("Deleting class with id:", id);

      // Find the class first to verify ownership
      const foundClass = await Class.findById(id).populate('semester');
      
      if (!foundClass) {
        return res.status(404).json({ message: "Class not found" });
      }

      // Verify the semester belongs to the user
      if (!foundClass.semester || foundClass.semester.user.toString() !== userObjectId.toString()) {
        return res.status(403).json({ 
          message: "You don't have permission to delete this class" 
        });
      }

      // Delete the class
      const deleted = await Class.findByIdAndDelete(id);

      res.json({ message: "Class deleted" });
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;