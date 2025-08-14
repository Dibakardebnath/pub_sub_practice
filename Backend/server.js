const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// Allow CORS for all origins (for dev)
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// ✅ CORS config for socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  socket.on("subscribe", (topic) => {
    socket.join(topic);
    console.log(`📌 ${socket.id} subscribed to topic: ${topic}`);
  });

  socket.on("publish", ({ topic, message }) => {
    console.log(`📢 Message to ${topic}: ${message}`);
    io.to(topic).emit("message", { topic, message });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

app.post("/send-email", async (req, res) => {
  console.log(req.body, "request");
  const { name, email, message } = req.body;

  console.log("✅Sending email:", req.body);

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: email,
    to: "ddibakar190@gmail.com", 
    subject: `Contact Form Submission from ${name}`,
    text: message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    res.json({ success: true, info });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
server.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
