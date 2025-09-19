const cron = require('node-cron');
const Task = require('../models/Task');

function checkRecurrence(task, now) {
    if (task.recurrence === 'Daily') return true;

    if (task.recurrence === 'Weekly') {
        const today = now.toLocaleString('en-US', { weekday: 'long' });
        return task.recurrenceDays?.includes(today);
    }

    if (task.recurrence === 'Custom') {
        const lastCreated = new Date(task.createdAt);
        const diffDays = Math.floor((now - lastCreated) / (1000 * 60 * 60 * 24));
        return diffDays >= task.recurrenceInterval;
    }

    return false;
}

setupCronJobs = () => {
    cron.schedule('0 0 * * *', async () => {
        const now = new Date();

        const recurringTasks = await Task.find({
            recurrence: { $ne: 'None' }
        });

        recurringTasks.forEach(async (task) => {
            const shouldRecur = checkRecurrence(task, now);
            if (shouldRecur) {
                const newTask = new Task({
                    ...task.toObject(),
                    _id: undefined,
                    createdAt: now,
                    updatedAt: now,
                    startDate: now,
                    dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // example: next day
                    reminder: task.reminder ? new Date(now.getTime() + 60 * 60 * 1000) : null
                });
                await newTask.save();
            }
        });
    });
};

module.exports = setupCronJobs;
