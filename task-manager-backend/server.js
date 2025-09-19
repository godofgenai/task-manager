require('dotenv').config();
const app = require('./app');
const connectDB = require('./config');
const setupCronJobs = require('./utils/cronJobs');

const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
        setupCronJobs();
    })
    .catch((err) => {
        console.error('Server start failure:', err);
    });
