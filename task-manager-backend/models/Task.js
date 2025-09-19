const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        title: String,
        description: String,
        category: String,
        priority: { type: String, enum: ['Low', 'Medium', 'High'] },
        status: { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' },
        startDate: Date,
        dueDate: Date,
        recurrence: { type: String, enum: ['None', 'Daily', 'Weekly', 'Custom'], default: 'None' },
        reminder: Date,
        recurrenceInterval: Number,
        recurrenceDays: [String]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
