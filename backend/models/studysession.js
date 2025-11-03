import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema({
  datetime: { type: Date, default: Date.now, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
});

const StudySession = mongoose.model("StudySession", studySessionSchema);
export default StudySession;
