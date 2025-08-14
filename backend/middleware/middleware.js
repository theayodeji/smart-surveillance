import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to authenticate user using JWT token
 */
export const authenticateUser = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication invalid' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authentication invalid' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Get user from the token
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Attach user to the request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Not authorized, token failed' });
    }
};

/**
 * Middleware to restrict actions to the root admin account only (username === 'admin')
 * Must be used after authenticateUser middleware
 */
export const isSuperAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authorized, no user' });
        }
        if (req.user.username !== 'admin') {
            return res.status(403).json({ error: 'Only root admin can perform this action' });
        }
        next();
    } catch (error) {
        console.error('Super admin check error:', error);
        return res.status(500).json({ error: 'Server error during super admin verification' });
    }
};

/**
 * Middleware to check if user is an admin
 * Must be used after authenticateUser middleware
 */
export const isAdmin = (req, res, next) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ error: 'Not authorized, no user' });
        }

        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized as an admin' });
        }

        next();
    } catch (error) {
        console.error('Admin check error:', error);
        return res.status(500).json({ error: 'Server error during admin verification' });
    }
};
