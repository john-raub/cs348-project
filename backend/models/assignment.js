import mongoose from "mongoose";
const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true }
});

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
