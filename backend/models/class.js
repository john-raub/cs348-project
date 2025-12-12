import mongoose from "mongoose";
import Assignment from "./assignment.js";

const classSchema = new mongoose.Schema({
  classId: { type: String, required: true }, // e.g. "CS180"
  professor: String,
  grade: String,
  semester: { type: mongoose.Schema.Types.ObjectId, ref: "Semester", required: true }
});

classSchema.pre("findOneAndDelete", async function (next) {
  const classDoc = await this.model.findOne(this.getFilter());
  if (classDoc) {
    for (const a of await Assignment.find({ class: classDoc._id })) {
      await Assignment.findOneAndDelete({ _id: a._id });
    }
  }
  next();
});

classSchema.index({classId: 1});
classSchema.index({semester: 1});

const Class = mongoose.model("Class", classSchema);
export default Class;
