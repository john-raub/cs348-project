import express from "express";
import auth from "../middleware/auth.js";
import Semester from "../models/semester.js";
import { sanitizeString } from "../middleware/sanitize.js"

const router = express.Router();

//  Get all semesters for the logged-in user
router.get("/getUserSemesters", auth, async (req, res) => {
  try {
    const userId = req.user.id; // from JWT payload
    const semesters = await Semester.find({ user: userId }).sort({ year: -1 });
    res.json(semesters);
  } catch (error) {
    console.error("Error fetching semesters:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//  Create a new semester
router.post("/create", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { season, year } = req.body;

    if (!season || !year) {
      return res.status(400).json({ message: "Season and year are required" });
    }

    // Prevent duplicate (e.g. Fall 2025 already exists for user)
    const existing = await Semester.findOne({ user: userId, season: season, year: year });
    if (existing) {
      return res.status(400).json({ message: "Semester already exists" });
    }

    const newSemester = new Semester({
      season: season,
      year: year,
      user: userId,
    });

    await newSemester.save();
    res.status(201).json(newSemester);
  } catch (error) {
    console.error("Error creating semester:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//  Delete a semester
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const semesterId = req.params.id;

    // Verify that the semester belongs to the logged-in user
    const semester = await Semester.findOneAndDelete({ _id: semesterId, user: userId });
    if (!semester) {
      return res.status(404).json({ message: "Semester not found" });
    }
    
    res.json({ message: "Semester deleted successfully" });
  } catch (error) {
    console.error("Error deleting semester:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/updateSemester/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id; // from JWT
    const { id } = req.params;
    const { year, season } = req.body;

    // find the semester that belongs to the user
    const semester = await Semester.findOne({ _id: id, user: userId });
    if (!semester) {
      return res.status(404).json({ message: "Semester not found or unauthorized" });
    }

    // update fields
    if (year) semester.year = Number(year);
    if (season) semester.season =  sanitizeString(season, 20);

    const updatedSemester = await semester.save();
    res.json(updatedSemester);
  } catch (error) {
    console.error("Error updating semester:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
