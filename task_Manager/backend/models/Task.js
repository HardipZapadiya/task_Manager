const mongoose = require('mongoose');

const SubtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  dueDate: {
    type: Date
  }
});

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  completed: {
    type: Boolean,
    default: false
  },
  dueDate: {
    type: Date
  },
  subtasks: [SubtaskSchema]
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
