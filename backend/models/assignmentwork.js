const assignmentWorkSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: "StudySession", required: true },
  time: { type: Number, required: true } // time spent on that assignment during that session
});

const AssignmentWork = mongoose.model("AssignmentWork", assignmentWorkSchema);
export default AssignmentWork;
