import mongoose from "mongoose";


const MessageSchema = new mongoose.Schema({
  text: { type: String, required: true }
});

const Message = mongoose.model("Message", MessageSchema);
export default Message;
