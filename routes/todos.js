// routes/todos.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Todo = require("../models/Todo");
const Notification = require("../models/Notification");

// GET all todos
router.get("/", async (req, res) => {
  try {
    let todos = await Todo.find()
      .populate("owner", "username")
      .populate("collaborators", "username");

    const priorityOrder = { high: 3, medium: 2, low: 1 };

    todos.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "pending" ? -1 : 1;
      }
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create a new todo with notifications for owner and collaborators
router.post("/", async (req, res) => {
  try {
    const { title, description, timeLimit, owner, collaborators, priority, status } = req.body;
    if (!title || !owner || !description) {
      return res.status(400).json({ error: "Title, owner and description are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).json({ error: "Invalid owner ID" });
    }
    
    const collabs = Array.isArray(collaborators) ? collaborators : [];

    const todo = new Todo({
      title,
      description,
      timeLimit: timeLimit ? new Date(timeLimit) : null,
      owner,
      collaborators: collabs,
      priority: priority || "low",
      status: status || "pending"
    });
    
    await todo.save();

    const populatedTodo = await Todo.findById(todo._id)
      .populate("owner", "username")
      .populate("collaborators", "username");

    await Notification.create({
      userId: owner,
      message: `Task "${title}" has been created.`
    });

    if (collabs.length > 0) {
      await Promise.all(
        collabs.map(collaborator =>
          Notification.create({
            userId: collaborator,
            message: `You were assigned to task "${title}".`
          })
        )
      );
    }

    res.status(201).json(populatedTodo);
  } catch (error) {
    console.error("Error saving todo:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update a todo
router.put("/:id", async (req, res) => {
  try {
    const { title, description, timeLimit, collaborators, priority, status } = req.body;
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      { 
        title, 
        description, 
        timeLimit: timeLimit ? new Date(timeLimit) : null, 
        collaborators, 
        priority, 
        status 
      },
      { new: true }
    )
      .populate("owner", "username")
      .populate("collaborators", "username");

    if (!updatedTodo)
      return res.status(404).json({ error: "Todo not found" });
    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a todo
router.delete("/:id", async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    if (!deletedTodo) return res.status(404).json({ error: "Todo not found" });
    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
