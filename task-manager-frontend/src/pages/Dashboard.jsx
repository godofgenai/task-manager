import { useEffect, useState } from 'react';
import { getTasks, createTask, updateTask, deleteTask, reminderEventSource } from '../services/api';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';

const priorities = ['Low', 'Medium', 'High'];
const statuses = ['To Do', 'In Progress', 'Done'];
const recurrences = ['None', 'Daily', 'Weekly', 'Custom'];

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function TaskForm({ open, onClose, onSave, initial }) {
    const [title, setTitle] = useState(initial?.title || '');
    const [description, setDescription] = useState(initial?.description || '');
    const [category, setCategory] = useState(initial?.category || '');
    const [priority, setPriority] = useState(initial?.priority || 'Low');
    const [status, setStatus] = useState(initial?.status || 'To Do');
    const [startDate, setStartDate] = useState(initial?.startDate ? initial.startDate.slice(0, 10) : '');
    const [dueDate, setDueDate] = useState(initial?.dueDate ? initial.dueDate.slice(0, 10) : '');
    const [recurrence, setRecurrence] = useState(initial?.recurrence || 'None');
    const [reminder, setReminder] = useState(initial?.reminder ? initial.reminder.slice(0, 16) : '');
    const [recurrenceInterval, setRecurrenceInterval] = useState(initial?.recurrenceInterval || '');
    const [recurrenceDays, setRecurrenceDays] = useState(initial?.recurrenceDays || []);
    const [intervalError, setIntervalError] = useState('');

    const handleRecurrenceDaysChange = (day) => {
        setRecurrenceDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
    };

    // Helper to convert local date/time to UTC ISO string
    const toUTC = (val, type) => {
        if (!val) return '';
        if (type === 'date') {
            // val: 'YYYY-MM-DD' -> Date
            const d = new Date(val + 'T00:00');
            return d.toISOString();
        }
        if (type === 'datetime') {
            // val: 'YYYY-MM-DDTHH:mm' -> Date
            const d = new Date(val);
            return d.toISOString();
        }
        return val;
    };

    const handleSave = () => {
        let validInterval = recurrenceInterval;
        if (recurrence === 'Custom') {
            validInterval = parseInt(recurrenceInterval);
            if (isNaN(validInterval) || validInterval <= 0) {
                setIntervalError('Interval must be a positive number');
                return;
            }
        }
        onSave({
            title,
            description,
            category,
            priority,
            status,
            startDate: toUTC(startDate, 'date'),
            dueDate: toUTC(dueDate, 'date'),
            recurrence,
            reminder: toUTC(reminder, 'datetime'),
            recurrenceInterval: recurrence === 'Custom' ? validInterval : undefined,
            recurrenceDays: recurrence === 'Weekly' ? recurrenceDays : undefined
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initial ? 'Edit Task' : 'Add Task'}</DialogTitle>
            <DialogContent>
                <TextField label="Title" fullWidth margin="normal" value={title} onChange={(e) => setTitle(e.target.value)} />
                <TextField label="Description" fullWidth margin="normal" value={description} onChange={(e) => setDescription(e.target.value)} />
                <TextField label="Category" fullWidth margin="normal" value={category} onChange={(e) => setCategory(e.target.value)} />
                <TextField select label="Priority" fullWidth margin="normal" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    {priorities.map((p) => (
                        <MenuItem key={p} value={p}>
                            {p}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField select label="Status" fullWidth margin="normal" value={status} onChange={(e) => setStatus(e.target.value)}>
                    {statuses.map((s) => (
                        <MenuItem key={s} value={s}>
                            {s}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    type="date"
                    label="Start Date"
                    fullWidth
                    margin="normal"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    type="date"
                    label="Due Date"
                    fullWidth
                    margin="normal"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField select label="Recurrence" fullWidth margin="normal" value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
                    {recurrences.map((r) => (
                        <MenuItem key={r} value={r}>
                            {r}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    type="datetime-local"
                    label="Reminder"
                    fullWidth
                    margin="normal"
                    value={reminder}
                    onChange={(e) => setReminder(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />

                {/* Recurrence fields logic */}
                {recurrence === 'Weekly' && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1">Recurrence Days</Typography>
                        <FormGroup row>
                            {weekDays.map((day) => (
                                <FormControlLabel
                                    key={day}
                                    control={<Checkbox checked={recurrenceDays.includes(day)} onChange={() => handleRecurrenceDaysChange(day)} />}
                                    label={day}
                                />
                            ))}
                        </FormGroup>
                    </Box>
                )}
                {recurrence === 'Custom' && (
                    <TextField
                        type="number"
                        label="Recurrence Interval"
                        fullWidth
                        margin="normal"
                        value={recurrenceInterval}
                        onChange={(e) => {
                            setRecurrenceInterval(e.target.value);
                            setIntervalError('');
                        }}
                        error={!!intervalError}
                        helperText={intervalError}
                    />
                )}
                {/* Hide recurrenceDays and recurrenceInterval for None/Daily */}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editTask, setEditTask] = useState(null);

    const token = localStorage.getItem('token');

    const fetchTasks = async () => {
        setLoading(true);
        setError('');
        const res = await getTasks(token);
        if (Array.isArray(res)) {
            setTasks(res);
        } else {
            setError(res.message || 'Failed to fetch tasks');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        const reminderEvent = reminderEventSource(token);
        reminderEvent.onmessage = (event) => {
            const data = JSON.parse(event.data);
            alert(`Reminder: ${data.title} is due on ${new Date(data.dueDate).toLocaleString()}`);
        };
        return () => reminderEvent.close();
    }, []);

    const handleAdd = async (data) => {
        setFormOpen(false);
        const res = await createTask(data, token);
        if (res._id) {
            fetchTasks();
        } else {
            setError(res.message || 'Failed to add task');
        }
    };

    const handleEdit = async (data) => {
        setEditTask(null);
        const res = await updateTask(editTask._id, data, token);
        if (res._id) {
            fetchTasks();
        } else {
            setError(res.message || 'Failed to update task');
        }
    };

    const handleDelete = async (id) => {
        const res = await deleteTask(id, token);
        if (res.message === 'Task deleted') {
            fetchTasks();
        } else {
            setError(res.message || 'Failed to delete task');
        }
    };

    if (loading)
        return (
            <Box sx={{ mt: 8, textAlign: 'center' }}>
                <CircularProgress />
            </Box>
        );
    if (error)
        return (
            <Box sx={{ mt: 8, textAlign: 'center' }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );

    return (
        <Box sx={{ maxWidth: 700, mx: 'auto', mt: 8 }}>
            <Typography variant="h4" gutterBottom>
                My Tasks
            </Typography>
            <Button variant="contained" sx={{ mb: 2 }} onClick={() => setFormOpen(true)}>
                Add Task
            </Button>
            <List>
                {tasks.map((task) => (
                    <ListItem
                        key={task._id}
                        divider
                        secondaryAction={
                            <>
                                <IconButton edge="end" aria-label="edit" onClick={() => setEditTask(task)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(task._id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </>
                        }
                    >
                        <ListItemText
                            primary={task.title}
                            secondary={`Status: ${task.status} | Priority: ${task.priority} | Due: ${
                                task.dueDate ? new Date(task.dueDate).toLocaleString() : 'N/A'
                            }${task.reminder ? ` | Reminder: ${new Date(task.reminder).toLocaleString()}` : ''}`}
                        />
                    </ListItem>
                ))}
            </List>
            {tasks.length === 0 && <Typography>No tasks found.</Typography>}
            <TaskForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleAdd} />
            {editTask && <TaskForm open={!!editTask} onClose={() => setEditTask(null)} onSave={handleEdit} initial={editTask} />}
        </Box>
    );
}
