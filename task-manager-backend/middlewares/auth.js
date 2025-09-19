const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    let { token } = req.query;
    if (!token) {
        token = req.headers.authorization?.split(' ')[1];
    }
    if (!token) return res.status(401).json({ message: 'No token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
};
