import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import semesterRoutes from "./routes/semesterRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import workRoutes from "./routes/workRoutes.js";
import studyRoutes from "./routes/studyRoutes.js";
import distractionRoutes from "./routes/distractionRoutes.js";
import recordRoutes from "./routes/recordRoutes.js";
import Message from "./models/test.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/semesters", semesterRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/works", workRoutes);
app.use("/api/study", studyRoutes);
app.use("/api/distractions", distractionRoutes);
app.use("/api/records", recordRoutes);

// Test route - need to remove later
app.get("/", (req, res) => {
  res.send("Hello from the Backend");
});

// Test DB route
app.get("/test-db", async (req, res) => {
  try {
    const newMessage = new Message({ text: "Hello MongoDB!" });
    await newMessage.save();
    const messages = await Message.find();
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database test failed" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
