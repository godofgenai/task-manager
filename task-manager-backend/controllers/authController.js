require('dotenv').config();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const how_salty = parseInt(process.env.SALT_ROUNDS);

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, how_salty);
    const user = await User.create({ username, email, passwordHash });
    res.status(201).json({ message: 'User registered' });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token });
};
