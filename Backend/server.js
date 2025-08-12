const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// Allow CORS for all origins (for dev)
app.use(cors());

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
  const { name, email, message } = req.body;

  console.log("✅Sending email:", req.body);

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "ddibakar190@gmail.com", // Your Gmail
      pass: "ighj kpmr gghn mkdj", // App password (not regular password)
    },
  });

  const mailOptions = {
    from: email, // the user's email (could be spoofed unless you validate)
    to: "ddibakar190@gmail.com", // your inbox where you want to receive the message
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
app.post("/send-email", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const mailOptions = {
      from: email,
      to: process.env.GMAIL_USER,
      subject: `Contact Form: ${name}`,
      text: message,
      html: `<p>From: ${name} (${email})</p><p>${message}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    res.json({ success: true, info });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({
      error: "Failed to send email",
      details: err.message,
    });
  }
});
server.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
