const distractionSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g. "phone", "snack", "social media"
  timeTaken: { type: Number, required: true }, // duration
  session: { type: mongoose.Schema.Types.ObjectId, ref: "StudySession", required: true }
});

const Distraction = mongoose.model("Distraction", distractionSchema);
export default Distraction;
