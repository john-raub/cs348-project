import mongoose from "mongoose";
import AssignmentWork from "./assignmentwork.js";
const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true }
});

assignmentSchema.pre("findOneAndDelete", async function (next) {
  const assignment = await this.model.findOne(this.getFilter());
  if (assignment) {
    // If there are any dependent entities, handle them here
    await AssignmentWork.deleteMany({ assignment: assignment._id });
  }
  next();
});

assignmentSchema.index({class:1});

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
