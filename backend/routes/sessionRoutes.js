import express from "express";
import auth from "../middleware/auth.js";
import StudySession from "../models/studysession.js";
import { sanitizeString } from "../middleware/sanitize.js";

const router = express.Router();

/**
 * GET all study sessions for the logged-in user
 */
router.get("/getUserSessions", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await StudySession.find({ user: userId }).sort({ datetime: -1 });
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching study sessions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST create a new study session
 */
router.post("/createSession", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, datetime } = req.body;

    const newSession = new StudySession({
      title,
      datetime,
      user: userId,
    });

    const savedSession = await newSession.save();
    res.status(201).json(savedSession);
  } catch (error) {
    console.error("Error creating study session:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT update an existing study session
 */
router.put("/updateSession/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, datetime } = req.body;
    const userId = req.user.id;

    const foundSession = await StudySession.findOne(
      { _id: id, user: userId }
    );

    if (title) foundSession.title = sanitizeString(title, 200);
    if (datetime) foundSession.datetime = new Date(datetime);

    const updatedSession = await foundSession.save();

    if (!updatedSession)
      return res.status(404).json({ message: "Study session not found" });

    res.json(updatedSession);
  } catch (error) {
    console.error("Error updating study session:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE a study session
 */
router.delete("/deleteSession/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = await StudySession.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!deleted)
      return res.status(404).json({ message: "Study session not found" });

    res.json({ message: "Study session deleted successfully" });
  } catch (error) {
    console.error("Error deleting study session:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
