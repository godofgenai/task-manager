const Task = require('../models/Task');

exports.getTasks = async (req, res) => {
    const tasks = await Task.find({ userId: req.userId });
    res.json(tasks);
};

exports.createTask = async (req, res) => {
    const task = await Task.create({ ...req.body, userId: req.userId });
    res.status(201).json(task);
};

exports.updateTask = async (req, res) => {
    console.log('Update payload:', req.body);
    const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true });
    res.json(task);
};

exports.deleteTask = async (req, res) => {
    await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Task deleted' });
};

exports.sendReminders = (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendReminder = (task) => {
        res.write(`data: ${JSON.stringify(task)}\n\n`);
    };

    const interval = setInterval(async () => {
        const now = new Date();
        const upcoming = new Date(now.getTime() + 5 * 60 * 1000);

        const tasks = await Task.find({
            reminder: { $gte: now, $lte: upcoming },
            userId: req.userId
        });

        tasks.forEach(sendReminder);
    }, 60000);

    req.on('close', () => {
        clearInterval(interval);
        res.end();
    });
};
