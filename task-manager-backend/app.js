require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const morgan = require('morgan');
const authenticateUser = require('./middlewares/auth');

const app = express();
// connectDB();

app.use(morgan('dev'));
app.use(
    cors({
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use(authenticateUser);

app.get('/ping', (req, res) => {
    res.send('pong');
});

// app.listen(process.env.PORT, () => {
//     console.log(`Server running on port ${process.env.PORT}`);
// });

module.exports = app;
