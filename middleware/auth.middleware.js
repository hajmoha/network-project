const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const secretKey = 'your_secret_key';

const isAdmin = async (req, res, next) => {
    if (!req.cookies || !req.cookies.token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = req.cookies.token;

    try {
        const decoded = jwt.verify(token, secretKey);
        const user = await User.findOne({ where: { email: decoded.email } });

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admin access required' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

const authMiddleware = async (req, res, next) => {
    if (!req.cookies || !req.cookies.token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = req.cookies.token;

    try {
        const decoded = jwt.verify(token, secretKey);
        const user = await User.findOne({ where: { email: decoded.email } });

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = { authMiddleware, isAdmin };
