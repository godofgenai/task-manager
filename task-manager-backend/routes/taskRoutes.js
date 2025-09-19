const express = require('express');
const { getTasks, createTask, updateTask, deleteTask, sendReminders } = require('../controllers/taskController');
const auth = require('../middlewares/auth');
const router = express.Router();

router.use(auth);
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.get('/reminders', sendReminders);

module.exports = router;
