import express from "express";
import auth from "../middleware/auth.js";
import Study from "../models/study.js";
import { sanitizeString } from "../middleware/sanitize.js";

const router = express.Router();

/**
 * Get all study for the session
 */
router.get("/getStudies/:sessionId", auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const studies = await Study.find({ session: sessionId });
    console.log("Fetched studies:", studies);
    res.json(studies);
  } catch (err) {
    console.error("Error fetching studies:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Create a new study entry
 */
router.post("/create", auth, async (req, res) => {
  try {
    const newStudy = new Study(req.body);
    await newStudy.save();
    res.status(201).json(newStudy);
  } catch (err) {
    console.error("Error creating study:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** 
 * Update an existing study entry
 */
router.put("/update/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { what, understanding, time } = req.body;
    const updatedStudy = await Study.findById(id);

    if (what) updatedStudy.what = sanitizeString(what, 200);
    if (understanding) updatedStudy.understanding = Number(understanding);
    if (time) updatedStudy.time = Number(time);
    await updatedStudy.save();
    res.json(updatedStudy);
  } catch (err) {
    console.error("Error updating study:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Delete a study entry
 */
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    await Study.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting study:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;