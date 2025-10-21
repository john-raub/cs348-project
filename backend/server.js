const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error(err));

// Test route
app.get("/", (req, res) => {
  res.send("Hello from the Backend");
});

const Message = require("./models/test");

// Test route: Save a message to DB
app.get("/test-db", async (req, res) => {
  try {
    // Insert a message
    const newMessage = new Message({ text: "Hello MongoDB!" });
    await newMessage.save();

    // Fetch all messages
    const messages = await Message.find();
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database test failed" });
  }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
