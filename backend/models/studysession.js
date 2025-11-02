import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema({
  datetime: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

const StudySession = mongoose.model("StudySession", studySessionSchema);
export default StudySession;
