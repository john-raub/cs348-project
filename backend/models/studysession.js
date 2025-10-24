const studySessionSchema = new mongoose.Schema({
  datetime: { type: Date, default: Date.now },
  timeStudying: { type: Number, required: true } // in minutes or hours
});

const StudySession = mongoose.model("StudySession", studySessionSchema);
export default StudySession;
