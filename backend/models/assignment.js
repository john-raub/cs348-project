import mongoose from "mongoose";
const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true }
});

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
