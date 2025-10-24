const classSchema = new mongoose.Schema({
  classId: { type: String, required: true }, // e.g. "CS180"
  professor: String,
  grade: String,
  semester: { type: mongoose.Schema.Types.ObjectId, ref: "Semester", required: true }
});

const Class = mongoose.model("Class", classSchema);
export default Class;
