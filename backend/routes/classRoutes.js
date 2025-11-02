import express from "express";
import auth from "../middleware/auth.js";
import Class from "../models/class.js";

const router = express.Router();

router.get("/getClasses/:semesterId", auth, async (req, res) => {
  try {
    const { semesterId } = req.params;

    const classes = await Class.find({ semester: semesterId });
    res.json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/createClass", auth, async (req, res) => {
  try {
    const { classId, professor, grade, semesterId } = req.body;

    console.log(classId, professor, grade, semesterId);

    const newClass = new Class({
      classId: classId,
      professor: professor,
      grade: grade,
      semester: semesterId,
    });

    const saved = await newClass.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/updateClass/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { classId, professor, grade } = req.body;

    const foundClass = await Class.findOne({ _id: id });
    if (!foundClass) return res.status(404).json({ message: "Class not found or unauthorized" });

    if (classId) foundClass.classId = classId;
    if (professor) foundClass.professor = professor;
    if (grade) foundClass.grade = grade;

    const updated = await foundClass.save();
    res.json(updated);
  } catch (error) {
    console.error("Error updating class:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/deleteClass/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting class with id:", id);

    const deleted = await Class.findOneAndDelete({ _id: id});
    if (!deleted) return res.status(404).json({ message: "Class not found or unauthorized" });

    res.json({ message: "Class deleted" });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
