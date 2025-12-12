import mongoose from "mongoose";
const studySchema = new mongoose.Schema({
  what: { type: String, required: true },
  understanding: { type: Number, min: 0, max: 10 }, // rating of comprehension
  time: { type: Number, required: true }, // time spent
  session: { type: mongoose.Schema.Types.ObjectId, ref: "StudySession", required: true }
});

studySchema.index({session: 1});

const Study = mongoose.model("Study", studySchema);
export default Study;
