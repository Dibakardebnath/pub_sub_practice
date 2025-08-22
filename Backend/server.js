import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import crypto from "crypto";
import Razorpay from "razorpay";

dotenv.config();

await connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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

app.post("/api/payment/order", async (req, res) => {
  const { amount } = req.body;

   try {
     const options = {
       amount: Number(amount * 100),
       currency: "INR",
       receipt: crypto.randomBytes(10).toString("hex"),
     };

     razorpayInstance.orders.create(options, (error, order) => {
       if (error) {
         console.log(error);
         return res.status(500).json({ message: "Something Went Wrong!" });
       }
       res.status(200).json({ data: order });
       console.log(order);
     });
   } catch (error) {
     res.status(500).json({ message: "Internal Server Error!" });
     console.log(error);
   }
})

server.listen(process.env.PORT || 3001, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
