const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");

//Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "baraiyanikhil593@gmail.com",
    pass: "dhgg iwggg ssaw fddp",
  },
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "User not found" });
    
    const resetLink = `http://localhost:5173/reset-password/${user._id}`;

    await transporter.sendMail({
      from: "baraiyanikhil593@gmail.com",
      to: email,
      subject: "Password Reset - TodoApp",
      text: `Click here to reset your password: ${resetLink}`,
    });

    res.json({ message: "Reset link sent to your email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
