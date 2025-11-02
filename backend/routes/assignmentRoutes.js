import express from "express";
import auth from "../middleware/auth.js";
import Assignment from "../models/assignment.js";
import Class from "../models/class.js";

const router = express.Router();

router.get("/getAssignments/:classId", auth, async (req, res) => {
  try {
    const { classId } = req.params;

    // Optional: Verify that the class belongs to this user
    const classExists = await Class.findOne({ _id: classId });
    if (!classExists)
      return res.status(404).json({ message: "Class not found or not authorized" });

    const assignments = await Assignment.find({ class: classId });
    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/createAssignment", auth, async (req, res) => {
  try {
    const { classId, title } = req.body;

    if (!classId || !title)
      return res.status(400).json({ message: "Missing required fields" });

    const classExists = await Class.findOne({ _id: classId });
    if (!classExists)
      return res.status(404).json({ message: "Class not found or not authorized" });

    const newAssignment = new Assignment({ title, class: classId });
    await newAssignment.save();
    res.status(201).json(newAssignment);
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/updateAssignment/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const updated = await Assignment.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Assignment not found" });

    res.json(updated);
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.delete("/deleteAssignment/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Assignment.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Assignment not found" });

    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
