import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to Authenticate User
 */
export const authenticateUser = async (req, res, next) => {
    try {
        const token = req.cookies.token; // Read token from HTTP-only cookie
        if (!token) return res.status(401).json({ error: "Access denied" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password'); // Attach user to request

        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
};
