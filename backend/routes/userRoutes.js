import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { authenticateUser, isAdmin, isSuperAdmin } from '../middleware/middleware.js';

const router = express.Router();

// Get all users (admin only) - exclude root admin account
router.get('/', authenticateUser, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ username: { $ne: 'admin' } }, { password: 0 }); // Exclude passwords and root admin
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Delete user (root admin only)
router.delete('/:id', authenticateUser, isSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (req.user && req.user._id && req.user._id.toString() === id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    // Prevent deleting the root admin account
    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (target.username === 'admin') {
      return res.status(403).json({ error: 'Cannot delete root admin account' });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Create new user (root admin only)
router.post('/', authenticateUser, isSuperAdmin, async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role
    });

    await user.save();
    
    // Don't send back the password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user role (root admin only)
router.put('/:id/role', authenticateUser, isSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Disallow changing root admin's role
    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (target.username === 'admin') {
      return res.status(403).json({ error: 'Cannot change root admin role' });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true, select: '-password' });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

export default router;
