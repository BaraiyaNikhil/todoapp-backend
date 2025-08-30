const express = require("express");
const router = express.Router();
const User = require("../models/User");

// POST /api/auth/reset-password/:userId
router.post("/reset-password/:userId", async (req, res) => {
  const { newPassword } = req.body;
  const { userId } = req.params;
  if (!newPassword) {
    return res.status(400).json({ error: "New password is required" });
  }
  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ error: "User not found" });

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
