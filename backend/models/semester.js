import mongoose from "mongoose";
import Class from "./class.js";

const semesterSchema = new mongoose.Schema({
  season: { type: String, required: true }, // e.g. "Fall", "Spring"
  year: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

// Cascade delete classes when a semester is deleted (allows for weak entities)
semesterSchema.pre("findOneAndDelete", async function (next) {
  const semester = await this.model.findOne(this.getFilter());
  if (semester) {
    const classes = await Class.find({ semester: semester._id });
    for (const c of classes) {
      // This ensures the Class hook executes
      await Class.findOneAndDelete({ _id: c._id });
    }
  }
  next();
});

semesterSchema.index({user: 1});

const Semester = mongoose.model("Semester", semesterSchema);
export default Semester;
