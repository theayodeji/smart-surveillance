import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import express from 'express';
import { authenticateUser } from "../middleware/middleware.js";


const router = express.Router()

// 📌 User Signup
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Default role to "user" if not provided
    const newUser = await User.create({
      username,
      password: hashedPassword,
      role: role,
    });

    res.json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
});

// 📌 User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email 
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensures cookies are only sent over HTTPS in production
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({ message: "Login successful", token, user });
  } catch (error) {
    console.log(error)  
    res.status(500).json({ error: error.message });
  }
});
// 📌 Logout Route: Clears the HTTP-only Cookie
router.post("/logout", authenticateUser, (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.json({ message: "Logged out successfully" });
});

// 📌 Get User Settings
router.get('/settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      emailAlerts: user.emailAlerts,
      alertEmail: user.alertEmail || user.email,
      email: user.email
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ error: 'Failed to fetch user settings' });
  }
});

// 📌 Update User Settings
router.put('/settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword, emailAlerts, alertEmail } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change password' });
      }
      
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      
      // Hash and update the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }
    
    // Update email alerts preference
    if (typeof emailAlerts === 'boolean') {
      user.emailAlerts = emailAlerts;
    }
    
    // Update alert email if provided and different from current
    if (alertEmail && alertEmail !== user.alertEmail) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(alertEmail)) {
        return res.status(400).json({ error: 'Please provide a valid email address' });
      }
      user.alertEmail = alertEmail;
    }
    
    await user.save();
    
    // Return updated settings without sensitive data
    const { password, ...userData } = user.toObject();
    res.json({
      message: 'Settings updated successfully',
      user: {
        email: userData.email,
        emailAlerts: userData.emailAlerts,
        alertEmail: userData.alertEmail || userData.email
      }
    });
    
  } catch (error) {
    console.error('Error updating user settings:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
