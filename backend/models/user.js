import mongoose from "mongoose";
import Semester from "./semester.js";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  startYear: { type: Number},
  school: { type: String }
});

// Cascade delete classes when a user is deleted (allows for weak entities)
userSchema.pre("findOneAndDelete", async function (next) {
  const user = await this.model.findOne(this.getFilter());
  if (user) {
    const semesters = await Semester.find({ user: user._id });
    for (const s of semesters) {
      // This ensures the Semester hook executes
      await Semester.findOneAndDelete({ _id: s._id });
    }
  }
  next();
});

userSchema.index({ username: 1 });

const User = mongoose.model("User", userSchema);
export default User;
