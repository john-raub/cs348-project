import mongoose from "mongoose";

//this isn't in us, leftover from when creating the project and testing the connections

const MessageSchema = new mongoose.Schema({
  text: { type: String, required: true }
});

const Message = mongoose.model("Message", MessageSchema);
export default Message;
