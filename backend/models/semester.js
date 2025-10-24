const semesterSchema = new mongoose.Schema({
  session: { type: String, required: true }, // e.g. "Fall", "Spring"
  year: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

const Semester = mongoose.model("Semester", semesterSchema);
export default Semester;
