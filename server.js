const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();


const app = express();

app.use(cors({
    origin: "https://todoapp-nu-peach.vercel.app",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  }));
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import routes
const authRoutes = require("./routes/auth");
const todoRoutes = require("./routes/todos");
const forgotPasswordRoutes = require("./routes/forgotPassword");
const resetPasswordRoutes = require("./routes/resetPassword");
const shareTaskRoutes = require("./routes/shareTask");
const notificationRoutes = require("./routes/notifications");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", forgotPasswordRoutes);
app.use("/api/auth", resetPasswordRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/todos", shareTaskRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
