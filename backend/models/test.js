const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  text: { type: String, required: true }
});

module.exports = mongoose.model("Message", MessageSchema);
