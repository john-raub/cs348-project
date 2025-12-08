import express from "express";
import auth from "../middleware/auth.js";
import AssignmentWork from "../models/assignmentwork.js";

const router = express.Router();

/**
 * GET assignment routes for the current study session
 */
router.get("/getSessionWorks/:sessionId", auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const works = await AssignmentWork.find({ session: sessionId }).populate("assignment");
    if (!works) return res.status(404).json({ message: "Works not found" });
    res.json(works);
  } catch (error) {
    console.error("Error fetching session works:", error);
    res.status(500).json({ message: "Server error" });
  }
});


/**
 * POST create a new assignmentwork for a study session
 */
router.post("/create", auth, async (req, res) => {
  try {
    const { time, assignmentId, sessionId } = req.body;
    const assignment = new AssignmentWork({
      time: time,
      assignment: assignmentId,
      session: sessionId,
    });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    console.error("Error creating session work:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT update an existing assignmentwork
 */
router.put("/update/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { time } = req.body;
    const assignment = await AssignmentWork.findByIdAndUpdate(id, {$set: { time } }, { new: true, runValidators: true });
    if (!assignment) return res.status(404).json({ message: "Work not found" });
    res.json(assignment);
  } catch (error) {
    console.error("Error updating session work:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE an assignmentwork
 */
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await AssignmentWork.findByIdAndDelete(id);
    if (!assignment) return res.status(404).json({ message: "Work not found" });
    res.json({ message: "Work deleted successfully" });
  } catch (error) {
    console.error("Error deleting session assignment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;