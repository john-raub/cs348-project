import mongoose from "mongoose";
import AssignmentWork from "./assignmentwork.js";
import Study from "./study.js";
import Distraction from "./distraction.js";

const studySessionSchema = new mongoose.Schema({
  datetime: { type: Date, default: Date.now, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
});

studySessionSchema.pre("findOneAndDelete", async function (next) {
  const session = await this.model.findOne(this.getFilter());
  if (session) {
    await AssignmentWork.deleteMany({ session: session._id });
    await Study.deleteMany({ session: session._id });
    await Distraction.deleteMany({ session: session._id });
  }
  next();
});

studySessionSchema.index({ user: 1, datetime: 1 });

const StudySession = mongoose.model("StudySession", studySessionSchema);
export default StudySession;
