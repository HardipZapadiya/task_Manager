const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// Get all tasks for user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, subtasks, dueDate } = req.body;
    const newTask = new Task({
      userId: req.user,
      title,
      description,
      dueDate,
      subtasks: subtasks || []
    });
    const task = await newTask.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.userId.toString() !== req.user) return res.status(401).json({ message: 'Not authorized' });

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.userId.toString() !== req.user) return res.status(401).json({ message: 'Not authorized' });

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
