const express = require("express");
const router = express.Router();
const Todo = require("../models/Todo");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "baraiyanikhil593@gmail.com",
    pass: "njr tbo uen jqq rrz",
  },
});

// POST /api/todos/share
router.post("/share", async (req, res) => {
  const { todoId, email } = req.body;
  try {
    const todo = await Todo.findById(todoId).populate("owner", "username");
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    const taskDetails = `Task: ${todo.title}
Description: ${todo.description || "No description"}
Due: ${todo.timeLimit ? new Date(todo.timeLimit).toLocaleString() : "No deadline"}
Priority: ${todo.priority}
Status: ${todo.status}`;

    await transporter.sendMail({
      from: "baraiyanikhil593@gmail.com",
      to: email,
      subject: "Shared Task from TodoApp",
      text: `Hi,

Your friend shared a task with you:
------------------------------------------------------------------------
${taskDetails}
------------------------------------------------------------------------
           It is an auto generated email, please do not reply
Regards,
TodoApp`,
    });

    res.json({ message: "Task shared successfully" });
  } catch (error) {
    console.error("Error sharing task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
